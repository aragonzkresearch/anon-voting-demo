import React, { useState } from 'react';
import { AnonVote, buildAnonVote } from "../hooks/anonvote";
import { ethers } from "ethers";

export default function MakeProcess() {
	const [showSpinner, setShowSpinner] = useState(false);
	const [showProcessId, setShowProcessId] = useState(false);
	const [newProcessId, setNewProcessId] = useState("");

	const createVoteProcess = async () => {
		const VOTING_ADDR = "0xcf66FfaFe927202a71F2C0918e83FfBF19fE15e8";
		const N_LEVELS = 16;

		if (window.ethereum) {
			setShowSpinner(true);

			try {
				//const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
				//const signer = accounts[0]

				// POTENTIAL PROBLEM, only during testing, I think.
				// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
				const currentChain = await ethereum.request({ method: 'eth_chainId' });
				const web3gw = new ethers.providers.Web3Provider(window.ethereum)
				const signer = await web3gw.getSigner();

				// Get stuff from the chain
				const av = await buildAnonVote(currentChain, N_LEVELS);
				await av.connect(web3gw, VOTING_ADDR);

				// Get data from user
				const topic = document.getElementById('topic').value;
				const censusRoot = document.getElementById('census-merkel-root').value;
				const startBlock = document.getElementById('start-blocknum').value;
				const endBlock = document.getElementById('end-blocknum').value;
				const minTurnout = document.getElementById('min-turnout').value;
				const minMajority = document.getElementById('min-majority').value;

				// Create the proccess
				const processID = await av.newProcess(topic, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);

				setNewProcessId(processID);

				if (processID !== "" && processID !== null) {
					setShowProcessId(true);
					setShowSpinner(false);
				}

			} catch (error) {
				console.log({ error });
				setShowSpinner(false);
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
              Get the process started
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              Let&apos;s create a secure voting process on the Ethereum blockchain.
            </p>
          </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
			<form onSubmit={(event) => event.preventDefault()}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-6">
						<p className="mt-4 text-xl text-gray-500">
							Fill in the info and click the button to create a new voting process.
						</p>
					</div>
				</div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Topic
                      </label>
                      <input
                        type="text"
                        name="topic"
                        id="topic"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="census-merkel-root" className="block text-sm font-medium text-gray-700">
                        Census Merkel Root
                      </label>
                      <input
                        type="text"
                        name="census-merkel-root"
                        id="census-merkel-root"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="start-blocknum" className="block text-sm font-medium text-gray-700">
                        Start Block Number
                      </label>
                      <input
                        type="text"
                        name="start-blocknum"
                        id="start-blocknum"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="end-blocknum" className="block text-sm font-medium text-gray-700">
                        Ending Block Number
                      </label>
                      <input
                        type="text"
                        name="end-blocknum"
                        id="end-blocknum"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="min-turnout" className="block text-sm font-medium text-gray-700">
                        Minimum Turnout (quorum)
                      </label>
                      <input
                        type="text"
                        name="min-turnout"
                        id="min-turnout"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="min-majority" className="block text-sm font-medium text-gray-700">
                        Minimum Majority
                      </label>
                      <input
                        type="text"
                        name="min-majority"
                        id="min-majority"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
      			  {showProcessId && (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="process-id" className="block text-sm font-medium text-gray-700">
                        Process ID
                      </label>
                      <input
                        type="text"
                        name="process-id"
                        disabled={true}
                        id="process-id"
						value={newProcessId}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
					)}
                </div>

                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    onClick={ createVoteProcess }
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
				{ showSpinner ? (
<div class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
				) : (
                    'Create Voting Process'
				)}
                  </button>
                </div>
              </div>
			</form>
          </div>
        </div>
      </div>
    </>
  )
}

