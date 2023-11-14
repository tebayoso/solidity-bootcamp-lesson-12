# Ballot.sol Function Execution Report

## Introduction

This report documents the execution of various functions within the "TokenizedBallot.sol" smart contract. I developed and run scripts to interact with the contract's functionalities, such as giving voting rights, casting votes, delegating votes, and querying results. Each function call is logged with its outcome and the corresponding transaction hash or revert reason.

## Methodology

Scripts were developed using [appropriate language/framework, e.g., JavaScript with Truffle/Hardhat]. They were executed against the deployed "MyTokenizedBallot.sol" contract at different addresses on the Sepolia Network.

Each function was invoked by a signer whose role is relevant to the action. Transaction hashes are recorded for successful executions, and revert reasons are documented for any failed attempts.

## Execution Details

### Minting Tokens

- **Ballot Address:** `0xF941F64b600E5cfB1DFd5C77ee0c98b88Df73CBf`
- **Token Address:** `0x882B0436f0f9764779eb27dA71C01B0e1C2590a9`
- **Transaction Hash:** `0xf9bd105820a6171c9aa88e8d7279462a74b52f878c3a665f31817c74d0788aed`
- **Function Execution:** `mint(address userWallet, uint amount)`
- **Signer:** `0xdaabeCACDD888DCf68Ff1f2d9202e74ABA0601bd`
- **Status:** Success
- **Outcome:** Tokens minted `100`.

### Casting Votes

- **Ballot Address:** `0xF941F64b600E5cfB1DFd5C77ee0c98b88Df73CBf`
- **Token Address:** `0x882B0436f0f9764779eb27dA71C01B0e1C2590a9`
- **Transaction Hash:** `0x61fbcbb47a3563936e24055ac3a4f4019b68542cbcef60792521407fd39063d2`
- **Function Execution:** `vote(uint proposal, uint amount)`
- **Signer:** `0xc743f017A2596F407eb3b3Cb7D347e2B46eb3b1d`
- **Status:** Success
- **Outcome:** Vote was successfully cast for proposal `0`.

### Querying Results

## Reading from the blockchain doesn't invole a transaction, this is a sample of one of the contracts:

```
0xF941F64b600E5cfB1DFd5C77ee0c98b88Df73CBf
[
Using address 0xdaabeCACDD888DCf68Ff1f2d9202e74ABA0601bd
Wallet balance 0.47737052476415975 ETH
Winning proposal: 0
]
```

## Observations and Issues Encountered

The voter can't vote into two proposals without building an advanced storage to know which proposals did he already voted.
The contract is vulnerable to flashloan attacks, the voter can borrow a lot of tokens and vote with them and then return them back to the lender.
The voter can just keep adding tokens to his wallet and vote with them, this can be solved by adding a limit to the amount of tokens that can be added to the wallet.
The tests are complex due to the addresses generated not resetting, forcing me to use different addresses on each test, which is not a good practice, we should be resetting the signers.

## Conclusion

This contract is weak and vulnerable to several attacks, we will have to work towards making it more reliable.