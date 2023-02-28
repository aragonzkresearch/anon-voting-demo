import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";
import { Loading } from "./Loading";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';

import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'KeyGen', href: '/keygen', current: "keygen" },
  { name: 'BuildCensus', href: '/makeCensus', current: "makeCensus" },
  { name: 'MakeProcess', href: '/makeProcess', current: "makeProcess" },
  { name: 'Vote', href: '/vote', current: "vote" },
  { name: 'Finalize', href: '/finalize', current: "finalize" },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
	
export default function MenuBar({page}) {
  const {
    dispatch,
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();

  const listen = useListen();

  const showConnectButton = status !== "pageNotLoaded" && !wallet;

  const isConnected = status !== "pageNotLoaded" && typeof wallet === "string";

  const handleConnect = async () => {
    dispatch({ type: "loading" });
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      const balance = await window.ethereum!.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });
      dispatch({ type: "connect", wallet: accounts[0], balance });

      // we can register an event listener for changes to the users wallet
      listen();
    }
  };

  const handleDisconnect = () => {
    dispatch({ type: "disconnect" });
  };

  const handleAddUsdc = async () => {
    dispatch({ type: "loading" });

    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          symbol: "USDC",
          decimals: 18,
          image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=023",
        },
      },
    });
  };

  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
						<div className="h-8 w-8" style={{cursor: 'pointer'}}>
							<Link href="/" passHref>
								<a>
								<Image
									src="/favicon.png"
									height={50}
									width={50}
									alt="Aragon"
								/>
								</a>
							</Link>
						</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
					<Link href={item.href} key={item.name} passHref>
					<a
                      className={classNames(
                        currentRoute === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block px-3 py-2 rounded-md text-base font-medium'
                      )} >
                      {item.name}
					</a>
					</Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
      			  {showConnectButton && (
                  <button
            		onClick={status === "loading" ? handleDisconnect : handleConnect}
					className={`inline-flex justify-center rounded-md border border-white bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${!isMetamaskInstalled && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isMetamaskInstalled}
                  > 
            {status === "loading" ? <Loading /> : "Connect to Metamask"}
					</button>
					)}
      			  {!showConnectButton && (
                  <button
            		onClick={handleDisconnect}
                    className="inline-flex justify-center rounded-md border border-white bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  > 
            {status === "loading" ? <Loading /> : "Disconnect"}
					</button>
					)}
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        page === item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block px-3 py-2 rounded-md text-base font-medium'
                      )}
                      aria-current={page === item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
					<div className="flex items-end px-5">
      			  {showConnectButton && (
                  <button
            		onClick={handleConnect}
                    className="inline-flex justify-center rounded-md border border-white bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  > 
            {status === "loading" ? <Loading /> : "Connect to Metamask"}
					</button>
    			    )}
      			  {!showConnectButton && (
                  <button
            		onClick={handleDisconnect}
                    className="inline-flex justify-center rounded-md border border-white bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  > 
            {status === "loading" ? <Loading /> : "Disconnect"}
					</button>
					)}
              	  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

      </div>
    </>
  )
}

