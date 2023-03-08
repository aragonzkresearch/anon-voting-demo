import { VOTING_ADDR, SIGNING_TEXT, N_LEVELS } from "../hooks/settings";
import React, { useState } from 'react';
import { useEffect, Component } from 'react';
// @ts-ignore
import { AnonVote, buildAnonVote } from "clientlib";
import { ethers } from "ethers";

export default function KeyGen() {
	const [buttonDisabled, setButtonDisabled] = useState(false);
	const [pubKey, setPubKey] = useState("");
	const [showCopy, setShowCopy] = useState(false);

	const getPubKey = async () => {
		if (window.ethereum) {
			try {
				// POTENTIAL PROBLEM, only during testing, I think.
				// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
				const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
				const chainID = parseInt(currentChain, 16);
				const web3gw = new ethers.providers.Web3Provider(window.ethereum)
				const signer = await web3gw.getSigner();
				const av = await buildAnonVote(chainID, N_LEVELS);

				// Get stuff from the chain
				await av.connect(web3gw, VOTING_ADDR);

				// Generate the keys
				const signature = await signer.signMessage(SIGNING_TEXT);
				const {privateKey, publicKey, compressedPublicKey } = await av.generateKey(signature);

				setPubKey(compressedPublicKey);
				setButtonDisabled(true);
			} catch (error) {
				console.log({ error })
			}
		}
	};

	function copyAddress() {
		// Copy the text inside the text field
		navigator.clipboard.writeText(pubKey);
		setShowCopy(true);
		return setTimeout(function() {
                    setShowCopy(false);
                }, 3000);
	}

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
			<div className="shadow sm:max-w-lg sm:rounded-md px-4 py-5 bg-white bg-opacity-50">
            <h3 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              First you&apos;ll need the keys
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              Step one is to generate a ZK friendly keypair. The input for this operation is your Ethereum public key that will be retrieved from Metamask.
            </p>
          </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
            <p className="mt-4 text-xl text-gray-600">
              Click on the &quot;Connect to Metamask&quot; button to get started.
            </p>
                    <div className="col-span-6">
                      <label htmlFor="public-address" className="block text-m font-medium text-gray-800 py-1">
                        Voting Census Key
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span onClick={copyAddress} style={{cursor: 'grab'}} className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
</svg>
                        </span>
                      <input
                        type="text"
                        disabled={ true }
                        name="public-address"
                        value={pubKey}
                        id="public-address"
                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
					{showCopy && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-1 rounded relative" role="alert">
							<span className="block sm:inline">Key Copied to Clipboard.</span>
						</div>
                    )}
                    <div className="col-span-6">
                      <div className="mt-1 flex rounded-md justify-center font-medium px-4 py-1">
						<p className="mt-4 text-m text-gray-600">
							This Voting Census Key is what you provide to the creator of the voting process. Copy it and send it to them in some trusted manner.
						</p>
                    </div>
                    </div>
                    </div>
                  </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    onClick={ getPubKey }
                    className={buttonDisabled ? ("inline-flex justify-center rounded-md border border-transparent bg-grey-600 py-2 px-4 text-sm font-medium text-grey-800 shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-grey-500 focus:ring-offset-2")
                    : ("inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2")}
					disabled={ buttonDisabled }
                  >
                    Generate Census Key
                  </button>
                </div>
               </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

