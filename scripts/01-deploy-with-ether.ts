import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { MyToken__factory, TokenSale__factory, TokenizedBallot__factory } from "../typechain-types";
import { token } from "../typechain-types/@openzeppelin/contracts";
dotenv.config();
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  // Setup the Provider and Wallet
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const deployerWallet = new ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER ?? "", provider);
  console.log(`Using address ${deployerWallet.address}`);
  const balanceBN = await provider.getBalance(deployerWallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // Deploy the Token Contract
  console.log("Deploying Token Contract...")
  const tokenFactory = new MyToken__factory(deployerWallet);
  const tokenContract = await tokenFactory.deploy();
  console.log(`Contract deployed to ${tokenContract.target}`)

  // Deploy the Ballot Contract
  console.log("Deploying Ballot Contract...");
  const lastBlock = await provider.getBlock('latest');
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(`Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`);

  const targetBlockNumber = (lastBlock?.number ?? 0) - 1;

  console.log(`Target block number: ${targetBlockNumber}`)

  const ballotFactory = new TokenizedBallot__factory(deployerWallet);
  const ballotContract = await ballotFactory.deploy(
    PROPOSALS.map(ethers.encodeBytes32String),
    tokenContract.getAddress(),
    // Get the last number as bignumber
    targetBlockNumber
  );
  await ballotContract.waitForDeployment();
  console.log(`Contract deployed to ${ballotContract.target}`);
}

main()
.then(() => process.exitCode = 0)
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});