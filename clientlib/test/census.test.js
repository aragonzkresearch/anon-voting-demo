import { assert, expect } from "chai";

import {buildCensus} from "../src/census.js";
import {buildAnonVote} from "../src/anonvote.js";


const fromHexString = (hexString) =>
	new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

describe("Census generation tests", function () {
	this.timeout(100000);

	const chainID=42;
	const nLevels=16;

	it("build census and generate proof (no-zk)", async () => {
		const av = await buildAnonVote(chainID, nLevels, null);
		const census = await buildCensus(nLevels);
		
		// simulate key generation
		const privateKey = fromHexString(
			"0001020304050607080900010203040506070809000102030405060708090000",
		);
		const publicKey = av.eddsa.prv2pub(privateKey);
		av.privateKey = privateKey;
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
		
		let proof = await census.generateProof(0);
		assert(proof.index == 0);
		const leafValue = av.poseidon([publicKeys[0][0], publicKeys[0][1], "1"]);
		expect(proof.value).to.equal(av.F.toObject(leafValue).toString());
	});
	it("export & import census", async () => {
		const av = await buildAnonVote(chainID, nLevels, null);
		const census = await buildCensus(nLevels);
		
		// simulate key generation
		const privateKey = fromHexString(
			"0001020304050607080900010203040506070809000102030405060708090000",
		);
		const publicKey = av.eddsa.prv2pub(privateKey);
		
		// gen other pubKeys
		let publicKeys = [publicKey];
		for (let i=1; i<10; i++) {
			const privateKey = fromHexString(
				"000102030405060708090001020304050607080900010203040506070809000"+i,
			);
			const publicKey = av.eddsa.prv2pub(privateKey);
			publicKeys.push(publicKey);
		}
		
		await census.addKeys(publicKeys);

		let exportedJSON = census.export();

		const census2 = await buildCensus(nLevels);
		await census2.import(exportedJSON);

		expect(census2.root()).to.equal(census.root());
	});
});
