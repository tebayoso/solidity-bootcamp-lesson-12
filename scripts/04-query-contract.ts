import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { MyToken, MyToken__factory, TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const deployerWallet = new ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER ?? "", provider);
  console.log(`Using address ${deployerWallet.address}`);
  const balanceBN = await provider.getBalance(deployerWallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // attach the ballot contract to the deployer wallet
  const myBallotFactory = new TokenizedBallot__factory(deployerWallet);
  const myBallot = myBallotFactory.attach(process.env.BALLOT_CONTRACT ?? "") as TokenizedBallot;

  // query the contract for the winning proposal
  const winningProposal = await myBallot.winningProposal();
  console.log(`Winning proposal: ${winningProposal}`);
}

main()
.then(() => process.exitCode = 0)
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});