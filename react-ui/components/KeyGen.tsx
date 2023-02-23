import { AnonVote, buildAnonVote } from "../hooks/anonvote";

export default function KeyGen() {

	const getPubKey = async () => {
		if (window.ethereum) {
			try {
				const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
				const signer = accounts[0]

				//const chainID=5777;
				// POTENTIAL PROBLEM, only during testing, I think.
				// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
				const currentChain = await ethereum.request({ method: 'eth_chainId' });
				const nLevels=16;

				const av = await buildAnonVote(currentChain, nLevels);

				const msgText = "ANONVOTE KEY GENERATION SECRET";
				try {
					const msg = `0x${Buffer.from(msgText, 'utf8').toString('hex')}`;
					const sign = await ethereum.request({
						method: 'personal_sign',
						params: [msg, signer, 'Example password'],
					});
	
					const {privateKey, publicKey, compressedPublicKey } = await av.generateKey(sign);

					document.getElementById('private-address').value = privateKey;
					//document.getElementById('public-address').value = compressedPublicKey;
					document.getElementById('public-address').value = publicKey;
				} catch (err) {
					console.error(err);
				}
			} catch (error) {
				console.log({ error })
			}
		}
	};

	function copyAddress() {
		// Get the text field
		var copyText = document.getElementById("public-address");

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
              First you'll need the keys
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
              Click on the "Connect to Metamask" button to get started.
            </p>
                    <div className="col-span-6">
                      <label htmlFor="private-address" className="block text-sm font-medium text-gray-700">
                        Private Key
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>
                        </span>
                      <input
                        type="password"
                        name="private-address"
                        id="private-address"
                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="public-address" className="block text-sm font-medium text-gray-700">
                        Public Key
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span onClick={copyAddress} style={{cursor: 'grab'}} className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
</svg>
                        </span>
                      <input
                        type="text"
                        name="public-address"
                        id="public-address"
                        className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    </div>
            <p className="mt-4 text-m text-gray-500">
              This Public Key is what you provide to the creator of the voting process. Copy it and send it to them.
            </p>
                  </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    onClick={ getPubKey }
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Generate Keys
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

