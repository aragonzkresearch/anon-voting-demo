import Link from "next/link";
import Image from "next/image";

import { UserIcon, UserGroupIcon } from '@heroicons/react/20/solid'

export default function Instructions() {
  return (
    <div className="bg-transparent">
      <div className="mx-auto max-w-7xl py-14 sm:px-6 sm:py-32 lg:px-8 rounded">
      <div className="px-4 py-5 sm:px-6 bg-white/95">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Website Instructions</h2>
        <p className="mt-1 max-w-2xl text-m text-gray-500">These are the steps a user must go through to vote in this system.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>

          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-6">
            <dt className="flex text-sm font-medium text-gray-500 justify-center">
               <UserGroupIcon className="h-8 w-8 flex-shrink-0 text-indigo-800" aria-hidden="true" />
			</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-7 sm:mt-0">
       			 <h3 className="text-base font-semibold leading-6 text-gray-900">Key Generation</h3>
		        <p className="mt-1 max-w-2xl text-m text-gray-600">Each user that would like to take part in a voting process needs to generate a compatible voting key.</p>
              <ul role="list" className="divide-y divide-gray-200 rounded-md border border-transparent">
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <div className="flex w-0 flex-1 items-center"></div>
                  <div className="ml-4 flex-shrink-0">
				<Link href="/keygen">
              	  <div style={{cursor: 'pointer'}} className="rounded-md bg-grey-200 px-2.5 py-0.5 text-indigo-600 border border-indigo-600 hover:text-black hover:bg-white font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
               		 Go to Key Generation<span aria-hidden="true">→</span>
					</div>
				</Link>
                  </div>
                </li>
			</ul>
			</dd>
          </div>

          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-6">
            <dt className="flex text-sm font-medium text-gray-500 justify-center">
               <UserIcon className="h-8 w-8 flex-shrink-0 text-indigo-800" aria-hidden="true" />
			</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-7 sm:mt-0">
       			 <h3 className="text-base font-semibold leading-6 text-gray-900">Census Creation</h3>
		        <p className="mt-1 max-w-2xl text-m text-gray-600">One user gathers all of the keys of participants and creates a census.</p>
              <ul role="list" className="divide-y divide-gray-200 rounded-md border border-transparent">
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <div className="flex w-0 flex-1 items-center"></div>
                  <div className="ml-4 flex-shrink-0">
				<Link href="/makeCensus">
              	  <div style={{cursor: 'pointer'}} className="rounded-md bg-grey-200 px-2.5 py-0.5 text-indigo-600 border border-indigo-600 hover:text-black hover:bg-white font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
               		 Go to Census Creation<span aria-hidden="true">→</span>
					</div>
				</Link>
                  </div>
                </li>
			</ul>
			</dd>
          </div>

          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-6">
            <dt className="flex text-sm font-medium text-gray-500 justify-center">
               <UserIcon className="h-8 w-8 flex-shrink-0 text-indigo-800" aria-hidden="true" />
			</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-7 sm:mt-0">
       			 <h3 className="text-base font-semibold leading-6 text-gray-900">Process Creation</h3>
		        <p className="mt-1 max-w-2xl text-m text-gray-600">One user, ordinarily the one that created the census, can create a voting process.</p>
              <ul role="list" className="divide-y divide-gray-200 rounded-md border border-transparent">
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <div className="flex w-0 flex-1 items-center"></div>
                  <div className="ml-4 flex-shrink-0">
				<Link href="/makeProcess">
              	  <div style={{cursor: 'pointer'}} className="rounded-md bg-grey-200 px-2.5 py-0.5 text-indigo-600 border border-indigo-600 hover:text-black hover:bg-white font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
               		 Go to Process Creation<span aria-hidden="true">→</span>
					</div>
				</Link>
                  </div>
                </li>
			</ul>
			</dd>
          </div>

          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-6">
            <dt className="flex text-sm font-medium text-gray-500 justify-center">
               <UserGroupIcon className="h-8 w-8 flex-shrink-0 text-indigo-800" aria-hidden="true" />
			</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-7 sm:mt-0">
       			 <h3 className="text-base font-semibold leading-6 text-gray-900">Cast a Vote</h3>
		        <p className="mt-1 max-w-2xl text-m text-gray-600">Each user that is included in the census for a given process, can individually cast their ZK encrypted vote.</p>
              <ul role="list" className="divide-y divide-gray-200 rounded-md border border-transparent">
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <div className="flex w-0 flex-1 items-center"></div>
                  <div className="ml-4 flex-shrink-0">
				<Link href="/vote">
              	  <div style={{cursor: 'pointer'}} className="rounded-md bg-grey-200 px-2.5 py-0.5 text-indigo-600 border border-indigo-600 hover:text-black hover:bg-white font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
               		 Go to Voting<span aria-hidden="true">→</span>
					</div>
				</Link>
                  </div>
                </li>
			</ul>
			</dd>
          </div>

          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-6">
            <dt className="flex text-sm font-medium text-gray-500 justify-center">
               <UserGroupIcon className="h-8 w-8 flex-shrink-0 text-indigo-800" aria-hidden="true" />
			</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-7 sm:mt-0">
       			 <h3 className="text-base font-semibold leading-6 text-gray-900">Finalize a Process</h3>
		        <p className="mt-1 max-w-2xl text-m text-gray-600">Anyone can initialize a process finalization once the process end block has passed.</p>
              <ul role="list" className="divide-y divide-gray-200 rounded-md border border-transparent">
                <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                  <div className="flex w-0 flex-1 items-center"></div>
                  <div className="ml-4 flex-shrink-0">
				<Link href="/finalize">
              	  <div style={{cursor: 'pointer'}} className="rounded-md bg-grey-200 px-2.5 py-0.5 text-indigo-600 border border-indigo-600 hover:text-black hover:bg-white font-semibold leading-7 text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
               		 Go to Finalize<span aria-hidden="true">→</span>
					</div>
				</Link>
                  </div>
                </li>
			</ul>
			</dd>
          </div>

        </dl>
      </div>
    </div>
    </div>
  )
}
