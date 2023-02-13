const {
	loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { assert } = require("chai");

const {buildAnonVote} = require("../src/anonvote.js");
const {buildCensus} = require("../src/census.js");


const fromHexString = (hexString) =>
	new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));


describe("ClientLib", function () {
	describe("Full flow without SmartContracts interaction", function () {
		this.timeout(100000);

		const chainID=42;
		const nLevels=16;

		it("build vote (no-zk)", async () => {
			const processID = 3;
			const av = await buildAnonVote(chainID, nLevels);
			const census = await buildCensus(nLevels);

			// simulate key generation
			const privateKey = fromHexString(
				"0001020304050607080900010203040506070809000102030405060708090000",
			);
			const publicKey = av.eddsa.prv2pub(privateKey);
			av.privateKey = privateKey;
			av.publicKey = publicKey;

			// gen other pubKeys
			let publicKeys = [av.publicKey];
			for (let i=1; i<10; i++) {
				const privateKey = fromHexString(
					"000102030405060708090001020304050607080900010203040506070809000"+i,
				);
				const publicKey = av.eddsa.prv2pub(privateKey);
				publicKeys.push(publicKey);
			}

			await census.addKeys(publicKeys);

			const proof = await census.generateProof(0);

			const vote = "1";
			const votePackage = av.buildVote(processID, null, // provingKey set to null as it is not used in this test
				census.root(), proof, publicKey, vote);
			assert(votePackage.publicInputs != undefined);
		});
	});


	describe("Smart Contract interaction tests", function () {

		// Define a fixture that defines hardhat gateway and then deploy the Smart Contract
		// to the local hardhat network. It also builds the AnonVote instance and connects
		// it to the Smart Contract.
		async function contractFixture(nLevels = 16) {
			// Contracts are deployed using the first signer/account by default
			const web3gw = ethers.getDefaultProvider();

			// Deploy the AnonVoting Smart Contract
			const anonVoting = await ethers.getContractFactory("AnonVoting");
			const anonVotingInstance = await anonVoting.deploy();
			await anonVotingInstance.deployed();
			let anonVotingAddress = anonVotingInstance.address;

			// Get the chainID from the web3 gateway
			const chainID = await web3gw.getNetwork().chainId;


			// Build the AnonVote instance and connect it to the AnonVoting Smart Contract
			const av = await buildAnonVote(chainID, nLevels);
			await av.connect(web3gw, anonVotingAddress);

			return {av, nLevels, web3gw};
		}

		it("Should connect to a Smart Contract", async () => {

			// Load the fixture
			// Inside the fixture, the AnonVoting Smart Contract is deployed and the
			// AnonVote instance is connected to it.
			await loadFixture(contractFixture);
		});

		it("Should return null if the process does not exist", async () => {

			// Load the fixture
			const { av } = await loadFixture(contractFixture);

			// Get the processID
			const processID = 3;

			// Get the process
			const process = await av.getProcess(processID);

			// Check that the process is null
			assert(process == null);
		});


	});

});
