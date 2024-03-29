import {
	loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";

import {assert, expect } from "chai";
import "@nomiclabs/hardhat-ethers";

import path from "path";
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";
import {promises} from "fs";
const pfs = promises;
import {wasm} from "circom_tester";
const wasm_tester = wasm;
import * as snarkjs from "snarkjs";

// needed for circuitPrivK
import createBlakeHash from "blake-hash";
import { utils as ffutils} from 'ffjavascript';
import {Scalar} from "ffjavascript";

import {buildAnonVote} from "../src/anonvote.js";
import {buildCensus} from "../src/census.js";

const fromHexString = (hexString) =>
	new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

async function loadCircuit(path) {
	let zkey, witnessCalcWasm;
	try {
		zkey = await pfs.readFile( __dirname + path+".zkey");
		witnessCalcWasm = await pfs.readFile( __dirname + path+".wasm");
	} catch (e) {
		throw new Error("loadCircuit:err: " + e);
	}
	return {zkey: zkey, witnessCalcWasm: witnessCalcWasm};
}

const chainID=31337;
const nLevels=16;

describe("ClientLib", function () {
	describe("Full flow without SmartContracts interaction", function () {
		this.timeout(100000);

		it("Should prepare valid zk-inputs matching the circuit", async () => {
			const circuitPath = path.join(
				__dirname,
				"circuits",
				"oav-test.circom",
			);
			const circuitCode = `
			    pragma circom 2.0.0;
			    include "../../node_modules/ovote/circuits/src/oav.circom";
			    component main {public [chainID, processID, censusRoot, weight, nullifier, vote]}= oav(${
			      nLevels
			    });
			`;
			fs.writeFileSync(circuitPath, circuitCode, "utf8");

			let cir = await wasm_tester(circuitPath);

			await cir.loadConstraints();

			const processID = 3;
			const av = await buildAnonVote(chainID, nLevels);
			const census = await buildCensus(nLevels);

			// simulate key generation
			const privateKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090021", "hex");
			const pvk    = av.eddsa.pruneBuffer(createBlakeHash("blake512").update(privateKey).digest().slice(0,32));
			const circuitPrivateKey      = Scalar.shr(ffutils.leBuff2int(pvk), 3);
			const publicKey = av.eddsa.prv2pub(privateKey);
			av.privateKey = privateKey;
			av.circuitPrivateKey = circuitPrivateKey;
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

			const merkleproof = await census.generateProof(0);

			const vote = "1";

			const inputs = await av.prepareZKInputs(processID,
				census.root(), merkleproof, vote);
			// console.log("INPUTS", JSON.stringify(inputs));

			const witness = await cir.calculateWitness(inputs, true);
			await cir.checkConstraints(witness);
		});

		it("Should generate a valid zk-proof", async () => {
			const processID = 3;
			const av = await buildAnonVote(chainID, nLevels);
			const census = await buildCensus(nLevels);

			// simulate key generation
			const privateKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090021", "hex");
			const pvk    = av.eddsa.pruneBuffer(createBlakeHash("blake512").update(privateKey).digest().slice(0,32));
			const circuitPrivateKey = Scalar.shr(ffutils.leBuff2int(pvk), 3);
			const publicKey = av.eddsa.prv2pub(privateKey);
			av.privateKey = privateKey;
			av.circuitPrivateKey = circuitPrivateKey;
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

			const merkleproof = await census.generateProof(0);

			const vote = "1";
			const circuit = await loadCircuit("/../../other/circuit16");
			assert(circuit.zkey !== undefined);
			assert(circuit.witnessCalcWasm !== undefined);

			const proofAndPI = await av.genZKProof(snarkjs, circuit.zkey,
				circuit.witnessCalcWasm, processID,
				census.root(), merkleproof, vote);
			// console.log(JSON.stringify(proofAndPI));

			let p = proofAndPI.proof;
			let proofNoSolidity = { // proof in snarkjs expected format
				pi_a: p[0],
				pi_b: [
					[p[1][0][1], p[1][0][0]],
					[p[1][1][1], p[1][1][0]]
				],
				pi_c: p[2]
			};
			let publicInputs = [ // publicInputs in snarkjs expected format
				proofAndPI.publicInputs.chainID,
				proofAndPI.publicInputs.processID,
				proofAndPI.publicInputs.censusRoot,
				proofAndPI.publicInputs.weight,
				proofAndPI.publicInputs.nullifier,
				proofAndPI.publicInputs.vote
			];

			// verify the zk-proof
			const vKey = await snarkjs.zKey.exportVerificationKey(circuit.zkey);
			const isValid = await snarkjs.groth16.verify(vKey, publicInputs, proofNoSolidity);
			if (!isValid) throw new Error("The generated proof is not valid");
		});

		it("Generate BabyJubJub key pair check", async () => {
			const av = await buildAnonVote(chainID, nLevels);

			// Get a signer from hardhat
			const signer = (await ethers.getSigners())[0];

			const text = "ANONVOTE KEY GENERATION SECRET";
			const signature = await signer.signMessage(text);

			const {privateKey, publicKey, compressedPublicKey } = await av.generateKey(signature);

			// Check that the private key is 32 bytes long hex string (0x prefix + 64 hex chars)
			expect(privateKey).to.match(/^0x[0-9a-fA-F]{64}$/);
			// Check that the public key is not null
			expect(publicKey).to.not.be.null;
			// Check that the compressed public key is a 32 bytes long hex string (0x prefix + 64 hex chars)
			expect(compressedPublicKey).to.match(/^0x[0-9a-fA-F]{64}$/);

		});
	});


	describe("Smart Contract interaction tests", function () {
		// Define a fixture that defines hardhat gateway and then deploy the Smart Contract
		// to the local hardhat network. It also builds the AnonVote instance and connects
		// it to the Smart Contract.
		async function contractWithoutZKFixture(nLevels = 16) {
			// Contracts are deployed using the first signer/account by default
			const web3gw = hre.ethers.provider;

			// Deploy the AnonVoting Smart Contract
			const verifier = await ethers.getContractFactory("VerifierMock");
			const verifierInstance = await verifier.deploy();
			
			const anonVoting = await ethers.getContractFactory("AnonVoting");
			const anonVotingInstance = await anonVoting.deploy(verifierInstance.address);
			await anonVotingInstance.deployed();
			let anonVotingAddress = anonVotingInstance.address;

			// Get the chainID from the web3 gateway
			const chainID = await web3gw.getNetwork().chainId;


			// Build the AnonVote instance and connect it to the AnonVoting Smart Contract
			const av = await buildAnonVote(chainID, nLevels);
			await av.connect(web3gw, anonVotingAddress);

			return {av, nLevels, web3gw};
		}
		async function contractFixture(nLevels = 16) {
			// Contracts are deployed using the first signer/account by default
			const web3gw = hre.ethers.provider;

			// Deploy the AnonVoting Smart Contract
			const verifier = await ethers.getContractFactory("Verifier");
			const verifierInstance = await verifier.deploy();

			const anonVoting = await ethers.getContractFactory("AnonVoting");
			const anonVotingInstance = await anonVoting.deploy(verifierInstance.address);

			await anonVotingInstance.deployed();
			let anonVotingAddress = anonVotingInstance.address;

			// Get the chainID from the web3 gateway
			const chainID = (await web3gw.getNetwork()).chainId;
			expect(chainID).to.not.equal(undefined);


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
			const censusIPFSHash = "QmZ";
			const censusRoot = 1; // This is the root of the census tree, which is a hash of the public keys. Here we use 1 as a placeholder
			const startBlock = 10;
			const endBlock = 100;
			const minTurnout = 1; // 1%
			const minMajority = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			await av.newProcess(topic, censusIPFSHash, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);
			const processID = await av.getLastProcessID();

			return {av, processID, signer, web3gw, nLevels, topic, censusRoot, startBlock, endBlock, minTurnout, minMajority };
		}

		it("Should create and get a new process (without zk)", async () => {
			// Load the fixture with the nLevels parameter
			const { av } = await loadFixture(contractFixture);

			// Set the parameters
			const topic = "test";
			const censusRoot = 1; // This is the root of the census tree, which is a hash of the public keys. Here we use 1 as a placeholder
			const censusIPFSHash = "QmZ";
			const startBlock = 10;
			const endBlock = 100;
			const minTurnout = 1; // 1%
			const minMajority = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			await av.newProcess(topic, censusIPFSHash, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);
			const processID = await av.getLastProcessID();
			expect(processID).to.equal(1);

			// // Get the process that was just created
			const process = await av.getProcess(processID);

			// Check that the process is not null
			expect(process).to.not.be.null;

			// Check that the process has the correct parameters
			expect(process.topic).to.equal(topic);
			expect(process.censusIPFSHash).to.equal(censusIPFSHash);
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
			const censusIPFSHashOne = "QmZa";
			const censusRootOne = 1; // This is the root of the census tree, which is a hash of the public keys. Here we use 1 as a placeholder
			const startBlockOne = 10;
			const endBlockOne = 100;
			const minTurnoutOne = 1; // 1%
			const minMajorityOne = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			await av.newProcess(topicOne, censusIPFSHashOne, censusRootOne, startBlockOne, endBlockOne, minTurnoutOne, minMajorityOne, signer);
			const processID1 = await av.getLastProcessID();
			expect(processID1).to.equal(1);

			// Set the parameters for the second process
			const topicTwo = "test 2";
			const censusIPFSHashTwo = "QmZb";
			const censusRootTwo = 2; // This is the root of the census tree, which is a hash of the public keys. Here we use 2 as a placeholder
			const startBlockTwo = 100;
			const endBlockTwo = 200;
			const minTurnoutTwo = 2; // 1%
			const minMajorityTwo = 52; // 51%


			// Create a second process
			await av.newProcess(topicTwo, censusIPFSHashTwo, censusRootTwo, startBlockTwo, endBlockTwo, minTurnoutTwo, minMajorityTwo, signer);
			const processID2 = await av.getLastProcessID();
			expect(processID2).to.equal(2);


			// Use the getProcesses function to get all the processes
			const processes = await av.getProcesses();


			// Check that the 1st process is the first process
			expect(processes[0].topic).to.equal(topicOne);
			expect(processes[0].censusIPFSHash).to.equal(censusIPFSHashOne);
			expect(processes[0].censusRoot).to.equal(censusRootOne);
			expect(processes[0].startBlock).to.equal(startBlockOne);
			expect(processes[0].endBlock).to.equal(endBlockOne);
			expect(processes[0].minTurnout).to.equal(minTurnoutOne);
			expect(processes[0].minMajority).to.equal(minMajorityOne);

			// Check that the 2nd process is the second process
			expect(processes[1].topic).to.equal(topicTwo);
			expect(processes[1].censusIPFSHash).to.equal(censusIPFSHashTwo);
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

		it("Should create new process and cast a vote (with ZK)", async () => {
			// Load the fixture with the nLevels parameter
			const { av } = await loadFixture(contractFixture);
			const census = await buildCensus(nLevels);


			// simulate key generation
			const privateKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090021", "hex");
			const pvk    = av.eddsa.pruneBuffer(createBlakeHash("blake512").update(privateKey).digest().slice(0,32));
			const circuitPrivateKey      = Scalar.shr(ffutils.leBuff2int(pvk), 3);
			const publicKey = av.eddsa.prv2pub(privateKey);
			av.privateKey = privateKey;
			av.circuitPrivateKey = circuitPrivateKey;
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

			const merkleproof = await census.generateProof(0);

			// Set the new process parameters
			const topic = "test with zk";
			const censusIPFSHash = "QmZa";
			const censusRoot = census.root();
			const startBlock = 10;
			const endBlock = 100;
			const minTurnout = 1; // 1%
			const minMajority = 51; // 51%

			// Get the signer
			const signer = (await ethers.getSigners())[0];

			// Create the process
			await av.newProcess(topic, censusIPFSHash, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);
			const processID = await av.getLastProcessID();
			expect(processID).to.equal(1);

			// Skip to the start of the process
			const skipBlocks = startBlock - (await ethers.provider.getBlock("latest")).number + 1;
			await ethers.provider.send("hardhat_mine", ['0x'+skipBlocks.toString(16)]);

			// // Get the process that was just created
			await av.getProcess(processID);
			const circuit = await loadCircuit("/../../other/circuit16");

			const voteBool = true;

			// cast vote
			await av.castVote(snarkjs, signer, circuit.zkey,
				circuit.witnessCalcWasm, processID.toString(),
				census.root(), merkleproof, voteBool);
		});
	});
});
