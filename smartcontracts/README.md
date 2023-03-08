# anon-voting-demo contracts

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## Project Setup

Add a `.env` file to the root of this directory with the following contents:

```shell
SEPOLIA_API_URL = https://sepolia.infura.io/v3/<INFURA API KEY>
PRIVATE_KEY = <ETHEREUM PRIVATE KEY>
ETHERSCAN_API_KEY = <ETHERSCAN API KEY>
```


## Deploying to Ethereum Sepolia

To deploy to Ethereum Sepolia, run the following command:

```shell
npx hardhat run scripts/deploy.js --network sepolia
```

This will deploy the contract to the Ethereum Sepolia testnet as well as verify the contract on Etherscan.

The latest deployment of AnonVote can be found [here](https://sepolia.etherscan.io/address/0x4AC1BEE5B764521a0d919Fe4580452Ee5dc47613).
