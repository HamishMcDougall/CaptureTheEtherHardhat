import { expect } from 'chai';
import { Contract, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import crypto from "crypto";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

function getWallet() {
  let wallet: Wallet;
  let contractAddress;
  let counter = 0;
  let privateKey;
  while (1) {
    privateKey = `0x${crypto.randomBytes(32).toString("hex")}`;
    wallet = new ethers.Wallet(privateKey);

    contractAddress = ethers.utils.getContractAddress({
      from: wallet.address,
      nonce: ethers.BigNumber.from("0"), 
    });

    if (contractAddress.toLowerCase().includes("badc0de")) {
      console.log("found", privateKey);
      return wallet;
    }

    counter++;
    if (counter % 1000 === 0) {
      console.log(`checked ${counter} addresses`);
    }
  }
}

describe('FuzzyIdentityChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (await ethers.getContractFactory('FuzzyIdentityChallenge', deployer)).deploy();

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
      

    const [owner] = await ethers.getSigners();

    // let wallet = await getWallet();

    // console.log(wallet)
    // checked 20811000 addresses
    // found 0x258d4542951dc7c964e8509e9876074ca23256d15bc367fa33debe281a5e7b28
    // Wallet {
    //   _isSigner: true,
    //   _signingKey: [Function (anonymous)],
    //   _mnemonic: [Function (anonymous)],
    //   address: '0xDF035F8FeA85FA613AcFd2F7e0389C47e88bDc6C',
    //   provider: null
    // }

    const wallet = new Wallet("0x258d4542951dc7c964e8509e9876074ca23256d15bc367fa33debe281a5e7b28", owner.provider);

    let tx;
    tx = await owner.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther("0.1"),
    });
    await tx.wait();

    const attackFactory = await ethers.getContractFactory("FuzzyIdentityAttack");
    const attackContract = await attackFactory.connect(wallet).deploy(target.address);
    await attackContract.deployed();

    tx = await attackContract.attack();
    await tx.wait();

  

    expect(await target.isComplete()).to.equal(true);
  });
});
