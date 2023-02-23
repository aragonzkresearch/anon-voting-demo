// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your smartcontracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, run} = require("hardhat");

async function main() {

  // Deploy ZkVerifier contract to verify the anonymous election votes
  const ZkVerifier = await ethers.getContractFactory("Verifier");
  const zkVerifier = await ZkVerifier.deploy();

  await zkVerifier.deployed();
  console.log("ZkVerifier deployed to:", zkVerifier.address);


  // Deploy AnonVoting contract
  const AnonVoting = await ethers.getContractFactory("AnonVoting");
  const anonVoting = await AnonVoting.deploy(zkVerifier.address);

  await anonVoting.deployed();

  // Wait for 60 seconds to make sure the contract is deployed
  console.log("Waiting for 60 seconds to make sure the contract is registered by Etherscan...");
  await new Promise(r => setTimeout(r, 60000));

  console.log("AnonVoting deployed to:", anonVoting.address);

  console.log("Verifying contracts on Etherscan...");
  try {
    await run("verify:verify", {
      address: zkVerifier.address,
      constructorArguments: [
      ],
    });
    console.log("ZkVerifier contract verified on Etherscan!");
  } catch (error) {
    // If the error contains "Reason: Already Verified", it means the contract is already verified, so we can ignore it
    if (error.message.includes("Reason: Already Verified")) {
        console.log("ZkVerifier contract already verified on Etherscan!");
    } else {
      console.log("Error while verifying ZkVerifier contract on Etherscan:", error);
    }
  }

  try {
    await run("verify:verify", {
      address: anonVoting.address,
      constructorArguments: [
        zkVerifier.address
      ],
    });
    console.log("AnonVoting contract verified on Etherscan!");
  } catch (error) {
    // If the error contains "Reason: Already Verified", it means the contract is already verified, so we can ignore it
    if (error.message.includes("Reason: Already Verified")) {
      console.log("ZkVerifier contract already verified on Etherscan!");
    } else {
      console.log("Error while verifying ZkVerifier contract on Etherscan:", error);
    }
  }

  // Print the contract addresses
  console.log("ZkVerifier contract address:", zkVerifier.address);
  console.log("AnonVoting contract address:", anonVoting.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
