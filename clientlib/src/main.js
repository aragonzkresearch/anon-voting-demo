const { newMemEmptyTrie, buildPoseidonReference, buildEddsa } = require(
	"circomlibjs",
);

async function buildAnonVote(chainID, nLevels, web3gateway) {
	const poseidon = await buildPoseidonReference();
	const eddsa = await buildEddsa();
	return new AnonVote(poseidon, eddsa, chainID, nLevels, web3gateway);
}

// AnonVote contains all the logic to build the data strucutres to vote, build
// censuses, interact with the Smart Contracts, etc.
class AnonVote {
	constructor(poseidon, eddsa, chainID, nLevels, web3gw) {
		this.poseidon = poseidon;
		this.F = this.poseidon.F;
		this.eddsa = eddsa;
		this.chainID = chainID;
		this.nLevels = nLevels
		this.web3gw = web3gw; // optional
	}
	generateKey() {}
	computeNullifier(processID) {}
	buildVote(processID, proof, vote) {}

	// methods containing the logic of interacting with SmartContracts &
	// servers. Only available if web3gateway is defined.
	getProcesses() {}
	getProcess() {}
	checkIfVoted() {}
	getProof() {}
	getProvingKey() {}
	closeProcess() {}
	castVote() {}
}

async function buildCensus(nLevels) {
	const poseidon = await buildPoseidonReference();
	const eddsa = await buildEddsa();
	const tree = await newMemEmptyTrie()
	return new Census(tree, poseidon, eddsa, nLevels);
}

class Census {
	constructor(tree, poseidon, eddsa, nLevels) {
		this.poseidon = poseidon;
		this.F = this.poseidon.F;
		this.eddsa = eddsa;
		this.nLevels = nLevels
		this.tree = tree;
	}

	async addKeys(publicKeys) {
		for (let i=0; i<publicKeys.length; i++) {
			const leafValue = this.poseidon([publicKeys[i][0], publicKeys[i][1], "1"]);

			await this.tree.insert(i, leafValue);
		}
	}

	// generateProof generates the proof from the local tree
	async generateProof(index) {
		const res = await this.tree.find(index);
		// assert(res.found);
		let siblings = res.siblings;
		for (let i = 0; i < siblings.length; i++) {
			siblings[i] = this.F.toObject(siblings[i]).toString();
		}
		while (siblings.length < this.nLevels) siblings.push(0);

		return {
			censusRoot: this.F.toObject(this.tree.root).toString(),
			index: index,
			value: this.F.toObject(res.foundValue).toString(),
			proof: siblings
		};
	}

}

module.exports = { AnonVote, Census, buildAnonVote, buildCensus };
