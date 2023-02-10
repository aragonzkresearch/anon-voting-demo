import CloseProcess from "../components/CloseProcess";
import ProcessList from "../components/ProcessList";
import FinalizePopup from "../components/FinalizePopup";
import { Fragment, useRef, useState } from 'react';

export default function Finalize() {
  const [open, setOpen] = useState(false)
  const [procId, setProcId] = useState()

    let handleCallback = (childData) => {
		setProcId(childData);
		setOpen(!open)
    }

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
			<div className="sm:max-w-lg">
            <h3 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Finalize the voting process
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              Selecting one of the voting processes from the list will allow you to close it. Of course, the voting period end must have been reached.
            </p>
            <p className="mt-4 text-xl text-gray-500">
              Anyone can trigger a finalization of a completed election.
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <div className="border-t border-gray-200">
			<ProcessList
				clickAction={handleCallback}
				actionIcon={'finalize'}
			/>
          </div>
        </div>
      </div>
      </div>
		<FinalizePopup
			open={open}
			close={() => setOpen(false)}
			id={procId}
		/>
    </>
  )
}

