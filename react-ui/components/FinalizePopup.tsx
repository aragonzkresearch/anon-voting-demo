import { VOTING_ADDR, SIGNING_TEXT, N_LEVELS } from "../hooks/settings";
import { AnonVote, buildAnonVote } from "clientlib";
import { ethers } from "ethers";
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function FinalizePopup({open, close, id}) {
	const [showSuccess, setShowSuccess] = useState(false);

	const cancelButtonRef = useRef(null)

	const voteFinalize = async () => {
		try {
			const currentChain = await window.ethereum.request({ method: 'eth_chainId' });

			const web3gw = new ethers.providers.Web3Provider(window.ethereum)
			const signer = await web3gw.getSigner();

			// Get stuff from the chain
			const av = await buildAnonVote(currentChain, N_LEVELS);
			await av.connect(web3gw, VOTING_ADDR);

			let finalized = await av.closeProcess(id, signer);

			setShowSuccess(true);
		} catch (err) {
			console.error(err);
		}
	};

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={close}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
						Finalize process
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-m text-black-500">
							Close out this process?
                        </p>
                        <p className="text-m text-gray-500">
                          Process Id:&nbsp; {id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						{showSuccess && (
							<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
								<strong className="font-bold">Success!</strong>
								<span className="block sm:inline">&nbsp; Finalization sent for process ID: {id}</span>
								<span className="absolute top-0 bottom-0 right-0 px-4 py-3"></span>
							</div>
						)}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						{showSuccess && (
           			       <button
                   			 type="button"
       			             className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
               			     onClick={close}
             			     >
               			     Close&nbsp;
       			           </button>
						)}
           		   </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
			{!showSuccess && (
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={close}
                  >
                    Cancel&nbsp;
                  </button>
			)}
                  </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
			{!showSuccess && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={voteFinalize}
                  >
                    Finalize&nbsp;
<svg xmlns="http://www.w3.org/2000/svg" fill="transparent" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
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

