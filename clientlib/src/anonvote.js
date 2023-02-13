const { buildPoseidonReference, buildEddsa } = require(
	"circomlibjs",
);

async function buildAnonVote(chainID, nLevels) {
	const poseidon = await buildPoseidonReference();
	const eddsa = await buildEddsa();
	return new AnonVote(poseidon, eddsa, chainID, nLevels);
}

// AnonVote contains all the logic to build the data structures to vote, build
// censuses, interact with the Smart Contracts, etc.
// To interact with the Smart Contracts, it needs a web3 gateway and a contract
// address. For that, use the connect() method.
class AnonVote {
	constructor(poseidon, eddsa, chainID, nLevels) {
		this.poseidon = poseidon;
		this.F = this.poseidon.F;
		this.eddsa = eddsa;
		this.chainID = chainID;
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
		const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"processID","type":"uint256"},{"indexed":false,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"topic","type":"string"},{"indexed":false,"internalType":"uint256","name":"startBlockNum","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"endBlockNum","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"censusRoot","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"minTurnout","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"minMajority","type":"uint8"}],"name":"NewProcess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"processID","type":"uint256"},{"indexed":false,"internalType":"bool","name":"passed","type":"bool"}],"name":"ProcessClosed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"processID","type":"uint256"},{"indexed":false,"internalType":"bool","name":"vote","type":"bool"}],"name":"Vote","type":"event"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"}],"name":"closeProcess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBlockNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"}],"name":"isProcessPassed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastProcessID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_topic","type":"string"},{"internalType":"uint256","name":"_censusRoot","type":"uint256"},{"internalType":"uint256","name":"_startBlockNum","type":"uint256"},{"internalType":"uint256","name":"_endBlockNum","type":"uint256"},{"internalType":"uint8","name":"_minTurnout","type":"uint8"},{"internalType":"uint8","name":"_minMajority","type":"uint8"}],"name":"newProcess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"processes","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"topic","type":"string"},{"internalType":"uint256","name":"startBlockNum","type":"uint256"},{"internalType":"uint256","name":"endBlockNum","type":"uint256"},{"internalType":"uint256","name":"censusRoot","type":"uint256"},{"internalType":"uint8","name":"minTurnout","type":"uint8"},{"internalType":"uint8","name":"minMajority","type":"uint8"},{"internalType":"uint256","name":"yesVotes","type":"uint256"},{"internalType":"uint256","name":"noVotes","type":"uint256"},{"internalType":"bool","name":"closed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_processID","type":"uint256"},{"internalType":"bool","name":"_vote","type":"bool"},{"internalType":"uint256","name":"_nullifier","type":"uint256"},{"internalType":"uint256[]","name":"_proof","type":"uint256[]"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}];

		// Load the contract
		this.anonVoting = new ethers.Contract(anonVotingAddress, abi, this.web3gw);
	}

	generateKey() {
		// TODO derive from Metamask signature
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

	buildVote(processID, provingKey, censusRoot, proof, publicKey, vote) {
		// for this version, weight is hardcoded to 1 for all voters
		const weight = "1";

		const nullifier = this.computeNullifier(processID);

		// compute signature
		const toSign = this.poseidon([vote]);
		const signature = this.eddsa.signPoseidon(this.privateKey, toSign);

		// set the zk-inputs
		const inputs = {
			chainID: this.chainID, // public inputs
			processID: processID,
			censusRoot: censusRoot,
			weight: weight,
			nullifier: nullifier,
			vote: vote,
			index: proof.index, // private inputs
			pubKx: this.F.toObject(publicKey[0]).toString(),
			pubKy: this.F.toObject(publicKey[1]).toString(),
			s: signature.S,
			rx: this.F.toObject(signature.R8[0]).toString(),
			ry: this.F.toObject(signature.R8[1]).toString(),
			siblings: proof.siblings,
		};

		const publicInputs = {
			chainID: this.chainID,
			processID: processID,
			censusRoot: censusRoot,
			weight: weight,
			nullifier: nullifier,
			vote: vote
		};

		// TODO generate zk-proof
		// TODO return public inputs + zk-proof
		return {publicInputs: publicInputs};
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

	checkIfVoted(voterAddress) {}
	getProof() {}
	getProvingKey() {}
	closeProcess() {}
	castVote() {}
}

module.exports = { AnonVote, buildAnonVote };
