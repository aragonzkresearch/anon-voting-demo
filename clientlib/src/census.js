const { newMemEmptyTrie, buildPoseidonReference } = require(
	"circomlibjs",
);

async function buildCensus(nLevels) {
	const poseidon = await buildPoseidonReference();
	const tree = await newMemEmptyTrie()
	return new Census(tree, poseidon, nLevels);
}

class Census {
	constructor(tree, poseidon, nLevels) {
		this.poseidon = poseidon;
		this.F = this.poseidon.F;
		this.nLevels = nLevels;
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
		while (siblings.length <= this.nLevels) siblings.push(0);

		return {
			censusRoot: this.F.toObject(this.tree.root).toString(),
			index: index,
			value: this.F.toObject(res.foundValue).toString(),
			siblings: siblings
		};
	}

	root() {
		return this.F.toObject(this.tree.root).toString();
	}

}

module.exports = { Census, buildCensus };
