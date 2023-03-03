import { newMemEmptyTrie, buildPoseidonReference, buildBabyjub } from "circomlibjs";
import { utils as ffutils} from 'ffjavascript';

async function buildCensus(nLevels) {
	const poseidon = await buildPoseidonReference();
	const babyjub = await buildBabyjub();
	const tree = await newMemEmptyTrie()
	return new Census(tree, poseidon, babyjub, nLevels);
}

class Census {
	constructor(tree, poseidon, babyjub, nLevels) {
		this.poseidon = poseidon;
		this.babyjub = babyjub;
		this.F = this.poseidon.F;
		this.nLevels = nLevels;
		this.tree = tree;
		this.publicKeys = [];
		this.lastIndex = 0
	}

	async addKeys(publicKeys) {
		for (let i=0; i<publicKeys.length; i++) {
			this.publicKeys.push(publicKeys[i]);

			const leafValue = this.poseidon([publicKeys[i][0], publicKeys[i][1], "1"]);

			await this.tree.insert(this.lastIndex + i, leafValue);
		}
		this.lastIndex += publicKeys.length;
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

	export() {
		let compPubKs = [];
		for (let i=0; i<this.publicKeys.length; i++) {
			let compPubK = ffutils.leBuff2int(this.babyjub.packPoint(this.publicKeys[i]));
			compPubKs.push(compPubK.toString());
		}
		return JSON.stringify(compPubKs);
	}

	async import(jsonData) {
		let compPubKs = JSON.parse(jsonData);
		let pubKs = [];
		for (let i=0; i<compPubKs.length; i++) {
			let compPubK = ffutils.leInt2Buff(BigInt(compPubKs[i]));
			let pubK = this.babyjub.unpackPoint(compPubK);
			pubKs.push(pubK);
		}
		await this.addKeys(pubKs);
	}
}


export { Census, buildCensus };
