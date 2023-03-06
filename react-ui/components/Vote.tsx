import { Census, buildCensus } from "../hooks/census";
import { AnonVote, buildAnonVote } from "../hooks/anonvote";

import CastVote from "../components/CastVote";
import ProcessList from "../components/ProcessList";

import { Fragment, useRef, useState } from 'react';
import Script from 'next/script';
import { ethers } from "ethers";

export default function Vote() {
	const [open, setOpen] = useState(false);
	const [procId, setProcId] = useState();
	const [croot, setCroot] = useState();

    let openModal = (childData, childRoot) => {
		setProcId(childData);
		setCroot(childRoot);
		setOpen(!open)
    }

	const doTheVote = async (id, keyArray, voteChoice) => {
		if (window.ethereum) {
			const VOTING_ADDR = "0xcf66FfaFe927202a71F2C0918e83FfBF19fE15e8";
			const SIGNING_TEXT = "ANONVOTE KEY GENERATION SECRET";
			const N_LEVELS = 16;
			const GAS_LIMIT = 300000;

			try {
				// POTENTIAL PROBLEM, only during testing, I think.
				// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
				const currentChain = await ethereum.request({ method: 'eth_chainId' });
				const chainID = parseInt(currentChain, 16);
		
				const web3gw = new ethers.providers.Web3Provider(window.ethereum)
				const signer = await web3gw.getSigner();

				// Get stuff from the chain
				const av = await buildAnonVote(chainID, N_LEVELS);
				await av.connect(web3gw, VOTING_ADDR);

				// Generate the keys
				const signature = await signer.signMessage(SIGNING_TEXT);
				const {privateKey, publicKey, compressedPublicKey } = await av.generateKey(signature);

				// Build the Census
				const census = await buildCensus(N_LEVELS);
				await census.addCompKeys(keyArray);

				const merkelproof = await census.generateProof(0);

				const proofAndPI = await av.castVote(
					snarkjs,
					signer,
					"/circuit16.zkey",
					"/circuit16.wasm",
					id,
					census.root(),
					merkelproof,
					voteChoice,
					GAS_LIMIT
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

				if (proofAndPI.proof !== null) {
					setOpen(false);
				} else {
					setOpen(false);
					alert("Casting vote failed");
				}
			} catch (error) {
				setOpen(false);
				console.log({ error })
				alert("Casting vote failed");
			}
		}
	};

  return (
    <>
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
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <div className="sm:rounded-lg border-t border-transparent overflow-hidden">
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
		/>
    </>
  )
}

