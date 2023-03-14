import { VOTING_ADDR, IPFS_GATEWAY, SIGNING_TEXT, N_LEVELS, VOTING_GAS_LIMIT } from "../hooks/settings";
import { isConnected } from "../hooks/connection";

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
	const [errorText, setErrorText] = useState("");

    let openModal = (childData, childRoot, childIpfs) => {
		setProcId(childData);
		setCroot(childRoot);
		setIpfs(childIpfs);
		setOpen(!open)
    }

	const doTheVote = async (id, keyArray, ipfsHash, voteChoice) => {
		if (window.ethereum) {
			try {
				if (!await isConnected()) {
					throw new Error("Wallet not connected. Please connect to Metamask");
				}
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
				if (typeof ipfsHash === 'undefined' || ipfsHash === "") {
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
				const myIndex = keyArray.indexOf(compressedPublicKey);
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
				//alert("Casting vote failed");
				setErrorText(error.message);
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
			{(errorText !== "") && (
              	 <div className="bg-white bg-opacity-50 px-1 py-3 sm:px-6">
					<div className="blink_me bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
						<strong className="font-bold">Error!</strong>
						<span className="block sm:inline">&nbsp; { errorText }.</span>
						<span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={ () => { setErrorText("")} }>
							<svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
  
						</span>
					</div>
                </div>
            )}
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <div className="sm:rounded-lg border-t border-transparent overflow-scroll h-screen">
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

