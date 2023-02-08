require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

const { SEPOLIA_API_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: `${ETHERSCAN_API_KEY}`
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
}