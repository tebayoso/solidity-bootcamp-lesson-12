import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { MyToken, MyToken__factory } from "../typechain-types";
import { token } from "../typechain-types/@openzeppelin/contracts";
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

  // Mint new tokens and Send tokens to the authorized wallet
  const userWallet = process.env.PUBLIC_KEY_USER ?? "";
  console.log(`Using address ${userWallet}`);
  const myTokenFactory = new MyToken__factory(deployerWallet);
  const myToken = myTokenFactory.attach(process.env.TOKEN_CONTRACT ?? "") as MyToken;
  const amount = 100;
  console.log("Balance for user wallet before transfer", await myToken.balanceOf(userWallet));
  const transferTx = await myToken.mint(userWallet, amount);
  console.log("Transfer transaction hash", transferTx.hash);
  console.log("Balance for user wallet after transfer", await myToken.balanceOf(userWallet));
}

main()
.then(() => process.exitCode = 0)
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});