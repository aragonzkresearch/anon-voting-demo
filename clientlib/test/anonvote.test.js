const {
	loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

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
			const web3gw = hre.ethers.provider;

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
			expect(process).to.be.null;
		});

		// Fixture to create a new process and return the processID and the AnonVote instance
		async function newProcessWithoutZKFixture(nLevels = 16) {
			// Load the fixture with the nLevels parameter
			const { av, web3gw } = await loadFixture(contractFixture, nLevels);

			// Set the parameters
			const topic = "test";
			const censusRoot = 1; // This is the root of the census tree, which is a hash of the public keys. Here we use 1 as a placeholder
			const startBlock = 10;
			const endBlock = 100;
			const minTurnout = 1; // 1%
			const minMajority = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			const processID = await av.newProcess(topic, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);

			return {av, processID, signer, web3gw, nLevels, topic, censusRoot, startBlock, endBlock, minTurnout, minMajority };
		}

		it("Should create and get a new process (without zk)", async () => {

			// Load the fixture with the nLevels parameter
			const { av } = await loadFixture(contractFixture);

			// Set the parameters
			const topic = "test";
			const censusRoot = 1; // This is the root of the census tree, which is a hash of the public keys. Here we use 1 as a placeholder
			const startBlock = 10;
			const endBlock = 100;
			const minTurnout = 1; // 1%
			const minMajority = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			const processID = await av.newProcess(topic, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);
			expect(processID).to.equal(1);

			// // Get the process that was just created
			const process = await av.getProcess(processID);

			// Check that the process is not null
			expect(process).to.not.be.null;

			// Check that the process has the correct parameters
			expect(process.topic).to.equal(topic);
			expect(process.censusRoot).to.equal(censusRoot);
			expect(process.startBlock).to.equal(startBlock);
			expect(process.endBlock).to.equal(endBlock);
			expect(process.minTurnout).to.equal(minTurnout);
			expect(process.minMajority).to.equal(minMajority);
		});

		it("Should create two processes and get them all", async () => {

			// Load the fixture with the nLevels parameter
			const { av } = await loadFixture(contractFixture);

			// Set the parameters for the first process
			const topicOne = "test 1";
			const censusRootOne = 1; // This is the root of the census tree, which is a hash of the public keys. Here we use 1 as a placeholder
			const startBlockOne = 10;
			const endBlockOne = 100;
			const minTurnoutOne = 1; // 1%
			const minMajorityOne = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			const processID1 = await av.newProcess(topicOne, censusRootOne, startBlockOne, endBlockOne, minTurnoutOne, minMajorityOne, signer);
			expect(processID1).to.equal(1);

			// Set the parameters for the second process
			const topicTwo = "test 2";
			const censusRootTwo = 2; // This is the root of the census tree, which is a hash of the public keys. Here we use 2 as a placeholder
			const startBlockTwo = 100;
			const endBlockTwo = 200;
			const minTurnoutTwo = 2; // 1%
			const minMajorityTwo = 52; // 51%


			// Create a second process
			const processID2 = await av.newProcess(topicTwo, censusRootTwo, startBlockTwo, endBlockTwo, minTurnoutTwo, minMajorityTwo, signer);
			expect(processID2).to.equal(2);


			// Use the getProcesses function to get all the processes
			const processes = await av.getProcesses();


			// Check that the 1st process is the first process
			expect(processes[0].topic).to.equal(topicOne);
			expect(processes[0].censusRoot).to.equal(censusRootOne);
			expect(processes[0].startBlock).to.equal(startBlockOne);
			expect(processes[0].endBlock).to.equal(endBlockOne);
			expect(processes[0].minTurnout).to.equal(minTurnoutOne);
			expect(processes[0].minMajority).to.equal(minMajorityOne);

			// Check that the 2nd process is the second process
			expect(processes[1].topic).to.equal(topicTwo);
			expect(processes[1].censusRoot).to.equal(censusRootTwo);
			expect(processes[1].startBlock).to.equal(startBlockTwo);
			expect(processes[1].endBlock).to.equal(endBlockTwo);
			expect(processes[1].minTurnout).to.equal(minTurnoutTwo);
			expect(processes[1].minMajority).to.equal(minMajorityTwo);

			expect(processes.length).to.equal(2);

		});

		it("Should close a process with no votes", async () => {

			// Load the fixture with the nLevels parameter
			const { av, processID, signer, endBlock } = await loadFixture(newProcessWithoutZKFixture);

			// Skip to the end of the process
			const skipBlocks = endBlock - (await ethers.provider.getBlock("latest")).number + 1;
			await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);


			// Close the process
			await av.closeProcess(processID, signer);

			// Get the process
			const process = await av.getProcess(processID);

			// Check that the process is closed
			expect(process.closed).to.equal(true);

			expect(process.yesVotes).to.equal(0);
			expect(process.noVotes).to.equal(0);

		});

	});

});
