import { Census, buildCensus } from "../hooks/census";

export default function MakeCensus() {

	const createCensus = async () => {
		const nLevels = 16;
		try {
			let census = await buildCensus(nLevels);
	
			let keyList = document.getElementById('keylist').value;
			let keyArray = keyList.split('\n');

			await census.addKeys(keyArray);

			let proof = await census.generateProof(0);
	
			document.getElementById('census-root').value = proof.censusRoot;
		} catch (err) {
			console.error(err);
		}
	};

	function copyRoot() {
		// Get the text field
		var copyText = document.getElementById("census-root");

		// Select the text field
		copyText.select();
		copyText.setSelectionRange(0, 99999); // For mobile devices

		// Copy the text inside the text field
		navigator.clipboard.writeText(copyText.value);
	}

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
			<div className="shadow sm:max-w-lg sm:rounded-md px-4 py-5 bg-white bg-opacity-50">
            <h3 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Build the vote census
            </h3>
            <p className="mt-4 text-xl text-gray-500">
              If you've gathered all of the keys from the voters, you can now build the census needed for the voting process
            </p>
          </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
			<form onSubmit={(event) => event.preventDefault()}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">

				<div className="sm:max-w-lg">
            		<p className="mt-4 text-xl text-gray-500">
             		 Fill in the list of keys to create the census from
            		</p>
                  </div>
                  <div>
                    <label htmlFor="keylist" className="block text-sm font-medium text-gray-700">
                      List of Keys
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="keylist"
                        name="keylist"
                        rows={12}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        defaultValue={''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      One key per line, please. Otherwise this won't work
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="census-root" className="block text-sm font-medium text-gray-700">
                        Census Merkel Root
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span onClick={copyRoot} style={{cursor: 'grab'}} className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
</svg>
                        </span>
                        <input
                          type="text"
                          name="census-root"
                          id="census-root"
                          className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
					onClick={ createCensus }
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Create Census
                  </button>
                </div>
              </div>
			</form>
          </div>
        </div>
      </div>

      </div>
    </>
  )
}

