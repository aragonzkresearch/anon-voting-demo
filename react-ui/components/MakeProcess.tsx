export default function MakeProcess() {
  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
			<div className="sm:max-w-lg">
            <h3 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Get the process started
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              Let's create a secure voting process on the Ethereum blockchain.
            </p>
          </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form action="#" method="POST">
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
                      <label htmlFor="merkel-root" className="block text-sm font-medium text-gray-700">
                        Merkel Root
                      </label>
                      <input
                        type="text"
                        name="merkel-root"
                        id="merkel-root"
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
                </div>

                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Create Voting Process
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
