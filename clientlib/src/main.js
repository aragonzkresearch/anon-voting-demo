const { newMemEmptyTrie, buildPoseidonReference, buildEddsa } = require(
	"circomlibjs",
);

export async function buildLib() {
	const poseidon = await buildPoseidonReference();
	const eddsa = await buildEddsa();
	return new AnonVote(poseidon, eddsa);
}

// AnonVote contains all the logic to build the data strucutres to vote, build
// censuses, interact with the Smart Contracts, etc.
export class AnonVote {
	constructor(poseidon, eddsa, chainID, nLevels,
		web3gateway /* optional */) {
		this.poseidon = poseidon;
		this.eddsa = eddsa;
		this.chainID = chainID;
		this.nLevels = nLevels
	}
	generateKey() {}
	computeNullifier(processID) {}
	buildVote(processID, proof, vote) {}
	async buildCensus(publicKeys) {}
	async getProof(index) {}

	// methods containing the logic of interacting with SmartContracts &
	// servers. Only available if web3gateway is defined.
	getProcesses() {}
	getProcess() {}
	checkIfVoted() {}
	getProvingKey() {}
	closeProcess() {}
	castVote() {}
}
