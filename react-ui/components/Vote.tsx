import { VOTING_ADDR, IPFS_GATEWAY, SIGNING_TEXT, N_LEVELS, VOTING_GAS_LIMIT } from "../hooks/settings";

// @ts-ignore
import { Census, buildCensus } from "clientlib";
import { buildAnonVote } from "clientlib";

import CastVote from "../components/CastVote";
import ProcessList from "../components/ProcessList";

import Script from 'next/script'
import { useState } from 'react';
import { ethers } from "ethers";

export default function Vote() {
	const [open, setOpen] = useState(false);
	const [procId, setProcId] = useState();
	const [croot, setCroot] = useState();
	const [ipfs, setIpfs] = useState();
	const [showVoteSuccess, setShowVoteSuccess] = useState(false);

    let openModal = (childData, childRoot, childIpfs) => {
		setProcId(childData);
		setCroot(childRoot);
		setIpfs(childIpfs);
		setOpen(!open)
    }

	const doTheVote = async (id, keyArray, ipfsHash, voteChoice) => {
		if (window.ethereum) {
			try {
				// POTENTIAL PROBLEM, only during testing, I think.
				// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
				const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
				const chainID = parseInt(currentChain, 16);
		
				const web3gw = new ethers.providers.Web3Provider(window.ethereum)
				const signer = await web3gw.getSigner();

				// Get stuff from the chain
				const av = await buildAnonVote(chainID, N_LEVELS);
				await av.connect(web3gw, VOTING_ADDR);

				// Generate the keys
				console.log("generate the keys");
				const signature = await signer.signMessage(SIGNING_TEXT);
				const {privateKey, publicKey, compressedPublicKey } = await av.generateKey(signature);

				// Build the Census
				console.log("build census");
				let census = await buildCensus(N_LEVELS);
				if (typeof ipfsHash === 'undefined') {
					console.log("	ipfshash==undefined, census.addCompKeys(keyArray)");
					await census.addCompKeys(keyArray);
				} else {
					// TODO: this now works, but in next iteration needs to be simplified
					console.log("	rebuilding census from ipfs");
					census = await Census.rebuildFromIPFS(IPFS_GATEWAY, ipfsHash, N_LEVELS);
					// recreate keyArray from census.publicKeys
					console.log("	obtained the census from ipfs, now recreating the keyArray");
					let exportedCensus = census.export();
					keyArray = JSON.parse(exportedCensus);
				}
				console.log("keyArray", keyArray);

				// Check that the uploaded census matches process
				console.log("get process data");
				const processData = await av.getProcess(id);
				if (processData.censusRoot.toString() !== census.root()) {
					console.log("ERR: this census does not match chosen process");
					return;
				}

				// Find where this user's key is in census
				console.log("get user index in census");
				const myIndex = keyArray.indexOf(compressedPublicKey); // TODO - keyArray is undefined if ipfsHash is defined
				if (myIndex < 0) {
					console.log("ERR: You are not part of census");
					return;
				}

				console.log("generateProof");
				const merkelproof = await census.generateProof(myIndex);

				console.log("av.castVote");
				await av.castVote(
					// @ts-ignore
					snarkjs,
					signer,
					"/circuit16.zkey",
					"/circuit16.wasm",
					id,
					census.root(),
					merkelproof,
					voteChoice,
					VOTING_GAS_LIMIT
				);

/*
				const proofAndPI = await av.genZKProof(
					snarkjs,
					"/circuit16.zkey",
					"/circuit16.wasm",
					id,
					census.root(),
					merkelproof,
					voteChoice
				);
*/

				setOpen(false);
				setShowVoteSuccess(true)
				return setTimeout(function() {
                    setShowVoteSuccess(false);
                }, 3000);
				/* the next if-else has no effect as proofAndPI
				 * is not currently returned from the castVote
				 * method
				if (proofAndPI.proof !== null) {
					setOpen(false);
				} else {
					setOpen(false);
					alert("Casting vote failed");
				}
				*/
			} catch (error) {
				setOpen(false);
				console.log({ error })
				alert("Casting vote failed");
			}
		}
	};

  return (
    <>
    	<Script src="/snarkjs.min.js" />
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
			<div className="shadow sm:max-w-lg sm:rounded-md px-4 py-5 bg-white bg-opacity-50">
            <h3 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Time to do some voting
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              Choose one of the processes from the list if you would like to place your vote. Of course, you must be in the census for the chosen process.
            </p>
          </div>
			{showVoteSuccess && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
					<strong className="font-bold">Success!</strong>
					<span className="block sm:inline">&nbsp; Your vote has been cast for process ID: {procId}</span>
					<span className="absolute top-0 bottom-0 right-0 px-4 py-3"></span>
				</div>
			)}
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <div className="sm:rounded-lg border-t border-transparent overflow-scroll">
			<ProcessList
				clickAction={ openModal }
				actionIcon={"vote"}
			/>
          </div>
        </div>
      </div>
      </div>
		<CastVote
			open={open}
			close={() => setOpen(false)}
			voteAction={ doTheVote }
			id={procId}
			ipfs={ipfs}
		/>
    </>
  )
}

