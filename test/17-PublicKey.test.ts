import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('PublicKey', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (await ethers.getContractFactory('PublicKeyChallenge', deployer)).deploy();

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    /**
     * YOUR CODE HERE
     * */

    

      const transaction = {
        to: target.address,
        value: ethers.utils.parseEther('0.1'),
        gasLimit: 210000,
      };
    
      const serializedTransaction = ethers.utils.serializeTransaction(transaction);
      const signedTransaction = await attacker.signMessage(serializedTransaction);
      const { r, s, v } = ethers.utils.splitSignature(signedTransaction);
  
      const publicKey = ethers.utils.recoverPublicKey(serializedTransaction, { r, s, v });
      console.log('Recovered Public Key:', publicKey);
  
      // Hash the public key using keccak256 before passing it to the authenticate function
      const hashedPublicKey = ethers.utils.keccak256(publicKey);
  
      await target.authenticate(hashedPublicKey);

    expect(await target.isComplete()).to.equal(true);
  });
});
