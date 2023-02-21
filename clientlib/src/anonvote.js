
const { buildPoseidonReference, buildEddsa, buildBabyjub } = require(
	"circomlibjs",
);

const { utils: ffutils } = require('ffjavascript');

const {ethers} = require("ethers");

const WitnessCalculatorBuilder = require("circom_runtime").WitnessCalculatorBuilder;
const snarkjs = require("snarkjs");

async function buildAnonVote(chainID, nLevels) {
	const poseidon = await buildPoseidonReference();
	const eddsa = await buildEddsa();
	const babyjub = await buildBabyjub();
	return new AnonVote(poseidon, eddsa, babyjub, chainID, nLevels);
}

// AnonVote contains all the logic to build the data structures to vote, build
// censuses, interact with the Smart Contracts, etc.
// To interact with the Smart Contracts, it needs a web3 gateway and a contract
// address. For that, use the connect() method.
class AnonVote {
	constructor(poseidon, eddsa, babyjub, chainID, nLevels) {
		this.poseidon = poseidon;
		this.F = this.poseidon.F;
		this.eddsa = eddsa;
		this.chainID = chainID;
		this.babyjub = babyjub;
		this.nLevels = nLevels
	}

	// Connect the AnonVote instance to a web3 gateway and a contract address
	async connect(web3gw, anonVotingAddress) {
		this.web3gw = web3gw;

		// This is the ABI of the AnonVoting contract
		// If you change the contract, you need to update this ABI
		// You can get the new ABI from the smartcontract's artifact folder
		// (clientlib/artifacts/contracts/AnonVoting.sol/AnonVoting.json)
		// To generate the new artifact, you need to compile the contract
		// Run `npx hardhat compile` in the root folder of the project
		const abi = [{"inputs":[{"internalType":"address","name":"_verifierContractAddr","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"processID","type":"uint256"},{"indexed":false,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"topic","type":"string"},{"indexed":false,"internalType":"uint256","name":"startBlockNum","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endBlockNum","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"censusRoot","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"minTurnout","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"minMajority","type":"uint8"}],"name":"NewProcess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"processID","type":"uint256"},{"indexed":false,"internalType":"bool","name":"passed","type":"bool"}],"name":"ProcessClosed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"processID","type":"uint256"},{"indexed":false,"internalType":"bool","name":"vote","type":"bool"}],"name":"Vote","type":"event"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"},{"internalType":"uint256","name":"_nullifier","type":"uint256"}],"name":"checkIfVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"}],"name":"closeProcess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"}],"name":"isProcessPassed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastProcessID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_topic","type":"string"},{"internalType":"uint256","name":"_censusRoot","type":"uint256"},{"internalType":"uint256","name":"_startBlockNum","type":"uint256"},{"internalType":"uint256","name":"_endBlockNum","type":"uint256"},{"internalType":"uint8","name":"_minTurnout","type":"uint8"},{"internalType":"uint8","name":"_minMajority","type":"uint8"}],"name":"newProcess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"processes","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"topic","type":"string"},{"internalType":"uint256","name":"startBlockNum","type":"uint256"},{"internalType":"uint256","name":"endBlockNum","type":"uint256"},{"internalType":"uint256","name":"censusRoot","type":"uint256"},{"internalType":"uint8","name":"minTurnout","type":"uint8"},{"internalType":"uint8","name":"minMajority","type":"uint8"},{"internalType":"uint256","name":"yesVotes","type":"uint256"},{"internalType":"uint256","name":"noVotes","type":"uint256"},{"internalType":"bool","name":"closed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"},{"internalType":"bool","name":"_vote","type":"bool"},{"internalType":"uint256","name":"_nullifier","type":"uint256"},{"internalType":"uint256[2]","name":"_a","type":"uint256[2]"},{"internalType":"uint256[2][2]","name":"_b","type":"uint256[2][2]"},{"internalType":"uint256[2]","name":"_c","type":"uint256[2]"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}];
		// Load the contract
		this.anonVoting = new ethers.Contract(anonVotingAddress, abi, this.web3gw);
	}

	// Generate a BabyJubJub keypair
	// To generate the private key, we use the users signature over "AnonVote Key Generation Secret"
	// Then we hash the signature to get a 32-byte private key
	// The public key is computed from the private key using the BabyJubJub curve
	async generateKey(signer) {
		const text = "ANONVOTE KEY GENERATION SECRET";
		const signature = await signer.signMessage(text);

		const privateKey = ethers.utils.keccak256(signature);

		// Compute the public key by hashing the private key to the BabyJubJub curve
		const publicKey = this.eddsa.prv2pub(privateKey)

		// Store the private and public key
		this.privateKey = privateKey
		this.publicKey = [publicKey[0].toString(), publicKey[1].toString()]


		// Compute the compressed public key
		const compressedPublicKey = ffutils.leBuff2int(this.babyjub.packPoint(publicKey))
		this.compressedPublicKey = ethers.utils.hexZeroPad(`0x${compressedPublicKey.toString(16)}`, 32);

		return {privateKey: this.privateKey, publicKey: this.publicKey, compressedPublicKey: this.compressedPublicKey };
	}

	computeNullifier(processID) {
		const nullifier = this.poseidon([
			this.chainID,
			processID,
			this.publicKey[0],
			this.publicKey[1],
		]);
		return this.F.toObject(nullifier).toString();
	}

	prepareZKInputs(processID, censusRoot, merkleproof, vote) {
		// for this version, weight is hardcoded to 1 for all voters
		const weight = "1";

		const nullifier = this.computeNullifier(processID);

		// compute signature
		const toSign = this.poseidon([this.chainID, processID, vote]);
		const signature = this.eddsa.signPoseidon(this.privateKey, toSign);

		// set the zk-inputs
		const inputs = {
			chainID: this.chainID, // public inputs
			processID: processID,
			censusRoot: censusRoot,
			weight: weight,
			nullifier: nullifier,
			vote: vote,
			index: merkleproof.index, // private inputs
			pubKx: this.F.toObject(this.publicKey[0]).toString(),
			pubKy: this.F.toObject(this.publicKey[1]).toString(),
			s: signature.S.toString(),
			rx: this.F.toObject(signature.R8[0]).toString(),
			ry: this.F.toObject(signature.R8[1]).toString(),
			siblings: merkleproof.siblings,
		};
		return inputs;
	}

	async genZKProof(zkey, witnessCalcWasm, processID, censusRoot, merkleproof, vote) {
		const inputs = this.prepareZKInputs(processID, censusRoot, merkleproof, vote);

		let proof, publicInputs;
		try {
			let res = await snarkjs.groth16.fullProve(
				inputs,
				witnessCalcWasm,
				zkey,
			);
			proof = res.proof;
			publicInputs = res.publicSignals;
		} catch(e) {
			throw new Error("fullProve err: " + e);
		}

		// return public inputs + zk-proof
		return {
			publicInputs: {
				chainID: publicInputs[0],
				processID: publicInputs[1],
				censusRoot: publicInputs[2],
				weight: publicInputs[3],
				nullifier: publicInputs[4],
				vote: publicInputs[5],
			},
			proof: [ // proof in the SmartContract expected format
				[proof.pi_a[0], proof.pi_a[1]],
				[
					[proof.pi_b[0][1], proof.pi_b[0][0]],
					[proof.pi_b[1][1], proof.pi_b[1][0]]
				],
				[proof.pi_c[0], proof.pi_c[1]]
			]
		};
	}

	// Method to get the information of a process
	async getProcess(processID) {
		if (!this.web3gw) {
			throw new Error("web3gw not defined. Use connect() first");
		}

		const process = await this.anonVoting.processes(processID);

		// Check if the process exists
		if (process.creator === "0x0000000000000000000000000000000000000000") {
			return null;
		}

		// If so, return the information of the process
		return {
			processID: processID,
			creator: process.creator,
			topic: process.topic,
			startBlock: process.startBlockNum,
			endBlock: process.endBlockNum,
			censusRoot: process.censusRoot,
			minMajority: process.minMajority,
			minTurnout: process.minTurnout,
			closed: process.closed,
			yesVotes: process.yesVotes,
			noVotes: process.noVotes,
		};
	}

	// Method to get all the processes in the AnonVoting contract
	async getProcesses() {
		if (!this.web3gw) {
			throw new Error("web3gw not defined. Use connect() first");
		}

		// Get the lastProcessID
		const lastProcessID = await this.anonVoting.lastProcessID();

		// For each processID until lastProcessID, get the process
		// Note that the indexing is moved by 1, so the first processID is 1
		const processes = [];
		for (let i = 1; i <= lastProcessID; i++) {
			const process = await this.getProcess(i);
			processes.push(process);
		}

		return processes;
	}

	// Method to generate a new process in the AnonVoting contract
	async newProcess(topic, censusRoot, startBlock, endBlock, minMajority, minTurnout, signer) {
		if (!this.web3gw) {
			throw new Error("web3gw not defined. Use connect() first");
		}

		const anonVotingWithSigner = this.anonVoting.connect(signer);



		await anonVotingWithSigner.newProcess(topic, censusRoot, startBlock, endBlock, minMajority, minTurnout);


		// Return the created processID
		return  await this.anonVoting.lastProcessID();
	}

	getMerkleProof() {}
	getProvingKey() {}

	async castVote(signer, zkey, witnessCalcWasm, processID, censusRoot, merkleproof, voteBool) {
		if (!this.web3gw) {
			throw new Error("web3gw not defined. Use connect() first");
		}
		const anonVotingWithSigner = this.anonVoting.connect(signer);

		let vote = 0;
		if (voteBool){
			vote = 1;
		}

		// prepare the inputs and generate the zkproof
		let proofAndPI = await this.genZKProof(zkey, witnessCalcWasm,
			processID, censusRoot, merkleproof, vote);

		// call contract vote method sending the proof
		await anonVotingWithSigner.vote(processID, voteBool,
			proofAndPI.publicInputs.nullifier, proofAndPI.proof[0],
			proofAndPI.proof[1], proofAndPI.proof[2]);
	}

	// Method to check if a voter has already voted in a process
	// Returns true if the voter has already voted, false otherwise
	// TODO - create a test for this method
	async checkIfVoted(processID) {
		if (!this.web3gw) {
			throw new Error("web3gw not defined. Use connect() first");
		}

		const nullifier = this.computeNullifier(processID);

		// Check if the nullifier is in the nullifiers array
		return await this.anonVoting.checkIfVoted(processID, nullifier);
	}

	// Method to close a process
	// To get the results, the user must call the getProcess method
	closeProcess(processID, signer) {
		if (!this.web3gw) {
			throw new Error("web3gw not defined. Use connect() first");
		}

		const anonVotingWithSigner = this.anonVoting.connect(signer);

		return anonVotingWithSigner.closeProcess(processID);
	}
}

module.exports = { AnonVote, buildAnonVote };
