import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.encodeBytes32String(array[index]));
  }
  return bytes32Array;
}

async function deployContract() {
  const signers = await ethers.getSigners();
  const contractFactory = await ethers.getContractFactory("TokenizedBallot");
  const tokenFactory = await ethers.getContractFactory("MyToken");
  const proposals = convertStringArrayToBytes32(PROPOSALS);
  const targetBlockNumber = (await ethers.provider.getBlockNumber()) + 1;
  const tokenContract = await tokenFactory.deploy();
  const ballotContract = await contractFactory.deploy(proposals, tokenContract.getAddress(), targetBlockNumber);

  return {signers, tokenContract,  ballotContract};
}

describe("Ballot", async () => {

  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      const proposals0 = await ballotContract.proposals(0);
      expect(ethers.decodeBytes32String(proposals0.name)).to.equal(PROPOSALS[0]);
    });

    it("has zero votes for all proposals", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.equal(0);
      }
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("the votes are added to the proposal", async () => {
      const {signers, ballotContract, tokenContract} = await loadFixture(deployContract);
      const voter = signers[1];
      await tokenContract.mint(voter.getAddress(), 100);
      await ballotContract.connect(voter).vote(0, 100);
      expect((await ballotContract.proposals(0)).voteCount).to.equal(100);
    });
    it("cannot vote if he already voted", async () => {
      it("the votes are added to the proposal", async () => {
        const {signers, ballotContract, tokenContract} = await loadFixture(deployContract);
        const voter = signers[2];
        await tokenContract.mint(voter.getAddress(), 100);
        await ballotContract.connect(voter).vote(0, 100);
        await ballotContract.connect(voter).vote(0, 100);
        expect((await ballotContract.proposals(1)).voteCount).to.equal(200);
      });
    });
    it("cannot vote if he doesn't have enough tokens", async () => {
      const {signers, ballotContract, tokenContract} = await loadFixture(deployContract);
      const voter = signers[3];
      await ballotContract.connect(voter).vote(0, 100);
      expect((await ballotContract.proposals(2)).voteCount).to.equal(0);
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      expect(await ballotContract.winningProposal()).to.equal(0);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const {signers, ballotContract, tokenContract} = await loadFixture(deployContract);
      const voter = signers[4];
      await tokenContract.mint(voter.getAddress(), 100);
      await ballotContract.connect(voter).vote(0, 100);
      expect(await ballotContract.winningProposal()).to.equal(0);
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const {signers, ballotContract, tokenContract} = await loadFixture(deployContract);
      const voter = signers[5];
      await tokenContract.mint(voter.getAddress(), 100);
      await ballotContract.connect(voter).vote(0, 100);
      expect(ethers.decodeBytes32String(await ballotContract.winnerName())).to.equal(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 3 random votes are cast for the proposals", async () => {
    it("should return the name of the winner proposal", async () => {
      const {signers, ballotContract, tokenContract} = await loadFixture(deployContract);
      const voter1 = signers[6];
      const voter2 = signers[7];
      const voter3 = signers[8];
      await tokenContract.mint(voter1.getAddress(), 100);
      await tokenContract.mint(voter2.getAddress(), 100);
      await tokenContract.mint(voter3.getAddress(), 150);
      await ballotContract.connect(voter1).vote(0, 100);
      await ballotContract.connect(voter2).vote(1, 100);
      await ballotContract.connect(voter3).vote(2, 150);
      expect(await ballotContract.winningProposal()).to.equal(2);
    });
  });
});