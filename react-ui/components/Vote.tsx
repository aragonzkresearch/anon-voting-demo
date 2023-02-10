import CastVote from "../components/CastVote";
import ProcessList from "../components/ProcessList";
import { Fragment, useRef, useState } from 'react';

export default function Vote() {
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
              Time to do some voting
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              Choose one of the processes from the list if you would like to place your vote. Of course, you must be in the census for the chosen process.
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <div className="border-t border-gray-200">
			<ProcessList
				clickAction={ handleCallback }
				actionIcon={"vote"}
			/>
          </div>
        </div>
      </div>
      </div>
		<CastVote
			open={open}
			close={() => setOpen(false)}
			id={procId}
		/>
    </>
  )
}

