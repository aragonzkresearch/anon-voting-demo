const { buildPoseidonReference, buildEddsa } = require(
	"circomlibjs",
);

async function buildAnonVote(chainID, nLevels, web3gateway) {
	const poseidon = await buildPoseidonReference();
	const eddsa = await buildEddsa();
	return new AnonVote(poseidon, eddsa, chainID, nLevels, web3gateway);
}

// AnonVote contains all the logic to build the data structures to vote, build
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

module.exports = { AnonVote, buildAnonVote };
