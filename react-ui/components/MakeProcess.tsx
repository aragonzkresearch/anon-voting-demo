import { VOTING_ADDR, N_LEVELS } from "../hooks/settings";
import React, { useState } from 'react';
import { useEffect, Component } from 'react';
// @ts-ignore
import { AnonVote, buildAnonVote } from 'clientlib';
import { ethers } from "ethers";

export default function MakeProcess() {
	const [showSpinner, setShowSpinner] = useState(false);
	const [showProcessId, setShowProcessId] = useState(false);
	const [newProcessId, setNewProcessId] = useState("");

	useEffect(() => {
		getBlockNums();
	}, []);

	const getBlockNums = async () => {
		if (window.ethereum) {
			try {
				const web3gw = new ethers.providers.Web3Provider(window.ethereum)
				const curBlock = await web3gw.getBlockNumber();

				//setStartBlockNum(curBlock + 60);
				//setEndBlockNum(curBlock + 300);
				const curBlockPlusOneHour = curBlock + 300;

                (document.getElementById('start-blocknum') as HTMLInputElement).value = (curBlock + 60).toString();
                (document.getElementById('end-blocknum') as HTMLInputElement).value = curBlockPlusOneHour.toString();
			} catch (error) {
				console.log({ error });
			}
		}
	}

	const createVoteProcess = async () => {
		if (window.ethereum) {
			setShowSpinner(true);

			try {
				// POTENTIAL PROBLEM, only during testing, I think.
				// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
				const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
				const web3gw = new ethers.providers.Web3Provider(window.ethereum)
				const signer = await web3gw.getSigner();

				// Get stuff from the chain
				const av = await buildAnonVote(currentChain, N_LEVELS);
				await av.connect(web3gw, VOTING_ADDR);

				// Get data from user
				const topic = (document.getElementById('topic') as HTMLInputElement).value;
				const censusRoot = (document.getElementById('census-merkel-root') as HTMLInputElement).value;
                const censusIpfs = (document.getElementById('census-ipfs-hash') as HTMLInputElement).value.toString();
				const startBlock = (document.getElementById('start-blocknum') as HTMLInputElement).value;
				const endBlock = (document.getElementById('end-blocknum') as HTMLInputElement).value;
				const minTurnout = (document.getElementById('min-turnout') as HTMLInputElement).value;
				const minMajority = (document.getElementById('min-majority') as HTMLInputElement).value;

				// Create the proccess
				const processID = await av.newProcess(topic, censusIpfs, censusRoot, startBlock, endBlock, minTurnout, minMajority, signer);
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
					{showProcessId && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
							<strong className="font-bold">Success!</strong>
							<span className="block sm:inline">&nbsp; It worked. Process created. ID: { newProcessId } </span>
							<span className="absolute top-0 bottom-0 right-0 px-4 py-3"></span>
						</div>
                    )}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="topic" className="block text-m font-medium text-gray-800 py-1">
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
                      <label htmlFor="census-merkel-root" className="block text-m font-medium text-gray-800 py-1">
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
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-6">
                            <label htmlFor="census-ipfs-hash" className="block text-m font-medium text-gray-700">
                                Census IPFS Hash
                            </label>
                            <input
                                type="text"
                                name="census-ipfs-hash"
                                id="census-ipfs-hash"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
							<p className="mt-4 text-xs text-gray-600 px-4"><i>If used. You must handle the upload yourself, seperately.</i></p>
                        </div>
                    </div>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="start-blocknum" className="block text-m font-medium text-gray-800 py-1">
                        Start Block Number
                      </label>
                      <input
                        type="text"
                        name="start-blocknum"
                        id="start-blocknum"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
           			<p className="mt-4 text-xs text-gray-600 px-4">⚠️&nbsp;<i>5 minutes from now</i></p>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="end-blocknum" className="block text-m font-medium text-gray-800 py-1">
                        Ending Block Number
                      </label>
                      <input
                        type="text"
                        name="end-blocknum"
                        id="end-blocknum"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
           			<p className="mt-4 text-xs text-gray-600 px-4">⚠️&nbsp;<i>About 1 hour from now</i></p>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="min-turnout" className="block text-m font-medium text-gray-800 py-1">
                        Minimum Turnout (quorum) [%]
                      </label>
                      <input
                        type="text"
                        name="min-turnout"
                        id="min-turnout"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="min-majority" className="block text-m font-medium text-gray-800 py-1">
                        Minimum Majority [%]
                      </label>
                      <input
                        type="text"
                        name="min-majority"
                        id="min-majority"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    onClick={ createVoteProcess }
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
				{ showSpinner ? (
<div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
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

