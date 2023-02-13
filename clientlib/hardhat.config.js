require("@nomicfoundation/hardhat-toolbox");

// Note that we do not provide environment variables for the hardhat network
// as we do not need them to deploy to the hardhat test network

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {}
  },
  paths: {
    // Such setup is required to make hardhat work with the smart contracts defined in the `smartcontracts` folder
    // We tell hardhat to run the tests from the `clientlib` folder and to compile the smart contracts from the `smartcontracts` folder
    root: "../smartcontracts",
    tests: "../clientlib/test"
  }
}