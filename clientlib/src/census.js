import { newMemEmptyTrie, buildPoseidonReference, buildBabyjub } from "circomlibjs";
import { utils as ffutils} from 'ffjavascript';
import { ethers } from "ethers";
import axios from 'axios';

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

	async addCompKeys(publicCompKeys) {
		for (let i=0; i<publicCompKeys.length; i++) {
			const thisKey = this.babyjub.unpackPoint(
								ffutils.leInt2Buff(
									BigInt(publicCompKeys[i])
								)
							);
			this.publicKeys.push(thisKey);
			const leafValue = this.poseidon([thisKey[0], thisKey[1], "1"]);
			await this.tree.insert(this.lastIndex + i, leafValue);
		}
		this.lastIndex += publicCompKeys.length;
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
			compPubKs.push(ethers.utils.hexZeroPad(`0x${compPubK.toString(16)}`, 32));
		}
		return JSON.stringify(compPubKs);
	}


	static async buildFromPubKs(pubKeys, nLevels) {
		let pubKs = [];
		let census = await buildCensus(nLevels);
		for (let i=0; i<pubKeys.length; i++) {
			let compPubK = ffutils.leInt2Buff(BigInt(pubKeys[i]));
			let pubK = census.babyjub.unpackPoint(compPubK);
			pubKs.push(pubK);
		}
		await census.addKeys(pubKs);
		return census;
	}

	static async rebuildFromJson(jsonData, nLevels = 16) {
		let compPubKs = JSON.parse(jsonData);
		return await Census.buildFromPubKs(compPubKs, nLevels);
	}

	static async rebuildFromIPFS(ipfsGateway, ipfsHash, nLevels = 16) {
		let res = await axios.get(`${ipfsGateway}/${ipfsHash}`);
		let compPubKs = await res.data;
		return await Census.buildFromPubKs(compPubKs, nLevels);
	}
}

export { Census, buildCensus };
