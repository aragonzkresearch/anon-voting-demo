// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your smartcontracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, run} = require("hardhat");

async function main() {

  const DEFAULT_MIN_TURNOUT = 25; // 25%
  const DEFAULT_MIN_MAJORITY = 50; // 50%


  const AnonVoting = await ethers.getContractFactory("AnonVoting");
  const anonVoting = await AnonVoting.deploy(DEFAULT_MIN_TURNOUT, DEFAULT_MIN_MAJORITY);

  await anonVoting.deployed();

  console.log("Verifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address: anonVoting.address,
      constructorArguments: [
        DEFAULT_MIN_TURNOUT,
        DEFAULT_MIN_MAJORITY
      ],
    });
    console.log("Token contract verified on Etherscan!");
  } catch (error) {
    console.log("Error while verifying Token contract on Etherscan:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
