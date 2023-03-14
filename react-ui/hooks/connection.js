const isConnected = async () => {
	const accounts = await ethereum.request({method: 'eth_accounts'});       
	if (accounts.length) {
		return true;
	} else {
		return false;
	}
}

export { isConnected }
