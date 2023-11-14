// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function balanceOf(address account) external view returns (uint256);
}

contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    struct Voter {
        bool voted;
        uint256 vote;
        uint256 proposal;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;
    mapping (address => Voter) voters;

    constructor(
        bytes32[] memory _proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        require(_targetBlockNumber < block.number, "Target block number should be in the past");

        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;

        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint256 proposal, uint256 amount) external {
        // check if the user already voted
        require(!voters[msg.sender].voted, "You already voted.");
        require(amount > 0, "You have to vote with at least 1 token");
        proposals[proposal].voteCount += amount;
        // add the vote to the voters list
        voters[msg.sender] = Voter({
            voted: true,
            vote: amount,
            proposal: proposal
        });
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}