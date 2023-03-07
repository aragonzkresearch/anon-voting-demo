import { VOTING_ADDR, N_LEVELS } from "../hooks/settings";
import { AnonVote, buildAnonVote } from "clientlib";
import { BigNumber, ethers, utils } from "ethers";
import React, { useState, useEffect } from 'react';

/* Sample Process
	processID: processID,
	creator: process.creator,
	topic: process.topic,
	startBlock: process.startBlockNum,
	endBlock: process.endBlockNum,
	censusRoot: process.censusRoot,
	minMajority: process.minMajority,
	minTurnout: process.minTurnout,
	closed: process.closed,
	yesVotes: process.yesVotes,
	noVotes: process.noVotes,
*/

export default function ProcessList({clickAction, actionIcon}) {
  const [needData, setNeedData] = useState(true);
  const [processes, setProcesses] = useState([]);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
	setNeedData(true);

	const fetchData = async () => {
		// POTENTIAL PROBLEM, only during testing, I think.
		// ISSUE: https://hardhat.org/hardhat-network/docs/metamask-issue
		const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
		const web3gw = new ethers.providers.Web3Provider(window.ethereum)

		// Get stuff from the chain
		const av = await buildAnonVote(currentChain, N_LEVELS);
		await av.connect(web3gw, VOTING_ADDR);

		const processList = await av.getProcesses();

		if (needData && processList.length > 0 ) {
			setProcesses(processList);
		}
		setNeedData(false);
	}

	// call the function
	fetchData().catch(console.error);

	// cancel any future `setData`
	return () => setNeedData(false);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="-my-2 border-transparent overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 border-transparent align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
				<p className="mt-4 text-xl text-gray-500">
					Just choose a process and {actionIcon}
				</p>
			</div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="relative px-6 py-3">
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					Process
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					Votes For
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					Votes Against
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					StartBlock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					EndBlock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					Creator
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
					CensusRoot
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(needData) && (
                  <tr>
					<td></td>
                    <td colSpan={8} className="px-6 py-4 whitespace-nowrap align-middle text-sm font-medium">
						Loading Data ...
					</td>
                  </tr>
				)}
                {(!needData && processes.length === 0) && (
                  <tr>
					<td></td>
                    <td colSpan={8} className="px-6 py-4 whitespace-nowrap align-middle text-sm font-medium">
						No Data Found...
					</td>
                  </tr>
				)}
                {(processes.length > 0) && processes.map(process => (
                  <tr key={process.processID} onClick={ () => { !process.closed && clickAction(process.processID, process.censusRoot.toString());}} style={{cursor: 'pointer'}} className="hover:hover:bg-indigo-100">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      			  {actionIcon === "vote" && (
<svg xmlns="http://www.w3.org/2000/svg" fill="antiquewhite" viewBox="0 0 20 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
</svg>
)}
      			  {actionIcon === "vote" && (
<svg xmlns="http://www.w3.org/2000/svg" fill="tan" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
</svg>
)}
      			  {actionIcon === "finalize" && (
<svg xmlns="http://www.w3.org/2000/svg" fill="antiquewhite" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
</svg>
)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{process.topic}</div>
                      <div className="text-xs font-small text-gray-500">ID: {process.processID}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={process.closed ? "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" :
                      	"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"} >
                        {process.closed ? "Closed" : "Open"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{process.yesVotes.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{process.noVotes.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{process.startBlock.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{process.endBlock.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{process.creator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{process.censusRoot.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
