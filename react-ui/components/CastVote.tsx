import { VOTING_ADDR, N_LEVELS } from "../hooks/settings";
import { AnonVote, buildAnonVote } from "clientlib";
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import React, { useEffect, Component } from 'react';
import { FileUploader } from "react-drag-drop-files";

export default function CastVote({open, close, voteAction, id, ipfs}) {

	// Use these later to show progress
	const [voteSuccess, setVoteSuccess] = useState(false);
	const [showButtons, setShowButtons] = useState(false);
	const [showSpinner, setShowSpinner] = useState(false);
	const [file, setFile] = useState(null);
	const [gmerk, setMerk] = useState();

	useEffect(() => {
		setFile(null);
		setShowSpinner(false);
		setShowButtons(false);
	}, [close]);

	const cleanup = () => {
		setFile(null);
		//setMerk(undefined);
		setShowSpinner(false);
		setShowButtons(false);
		close();
	}

	const doVote = (voteChoice) => {
		console.log("Voting: " + voteChoice);
		if (gmerk !== undefined || file === null) {
			console.log("calling vote routine");
			setShowButtons(false);
			setShowSpinner(true);
			voteAction(
				id,
				gmerk,
				ipfs,
				voteChoice
			);
		}
		else {
			console.log("need census key list");
			alert('Need to upload census file before casting vote');
		}
	};

	const handleChange = (file) => {
		setFile(file);
		const reader = new FileReader();

		reader.addEventListener(
			"load",
			() => {
				//let merkleproof = JSON.parse(reader.result);
				//setMerk(merkleproof);
				//let censusData = reader.result;
				let censusData = JSON.parse(reader.result);
				setMerk(censusData);
				setShowButtons(true);
			},
			false
		);

		if (file !== null) {
			reader.readAsText(file);
		}
	};

	const fileTypes = ["JSON"];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={cleanup}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 m:w-full m:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
</svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Cast your vote
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-m text-black-500">
							How would you like to vote on process: #<b>{id}</b>
                        </p>
						{(typeof ipfs === 'undefined') && (
		                <div className="mt-2 bg-gray-50 px-4 py-3 sm:flex sm:flex-row sm:px-6 items-center">
                          <div className="mt-2">
                            <p className="text-m text-gray-800 overflow-hidden px-4">
						    	Upload census file to prepare to vote
                            </p>
                          </div>
                          <div className="mt-2">
							<FileUploader handleChange={handleChange} name="file" types={fileTypes} label="Upload Census JSON file"/>
                         </div>
                         </div>
						)}
                      </div>
                    </div>
                    <div className="mx-auto flex h-1 w-1 flex-shrink-0 items-center justify-center rounded-full bg-transparent sm:mx-0 sm:h-10 sm:w-10">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-grey-500 px-4 py-2 text-base font-medium text-grey-800 shadow-sm hover:bg-grey-600 focus:outline-none focus:ring-1 focus:ring-grey-200 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={cleanup}
                  >
						X
					</button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
				{ showSpinner && (
<div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
				)}
{ showButtons && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={ () => {
							//doVote("1");
							doVote(true);
					}
					}
                  >
                    Yes&nbsp;
<svg xmlns="http://www.w3.org/2000/svg" fill="transparent" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
</svg>
                  </button>
)}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
{ showButtons && (
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={ () => {
							//doVote("0");
							doVote(false);
					}
					}
                  >
                    No&nbsp;
<svg xmlns="http://www.w3.org/2000/svg" fill="transparent" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
</svg>
                  </button>
)}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

