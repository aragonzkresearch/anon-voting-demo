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
	const tree = await newMemEmptyTrie()
	return new Census(tree, poseidon, nLevels);
}

class Census {
	constructor(tree, poseidon, nLevels) {
		this.poseidon = poseidon;
		this.F = this.poseidon.F;
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

	root() {
		return this.F.toObject(this.tree.root).toString();
	}

}

module.exports = { AnonVote, Census, buildAnonVote, buildCensus };
