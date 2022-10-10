// @ts-ignore
const {artifacts} = global
var Wallet = artifacts.require('MultiSigWallet')

module.exports = async function (deployer, _network, accounts) {
	// accounts i.e, 3rd argument is the exact same list of accounts returned from web3.eth.getAccounts(). Source: https://trufflesuite.com/docs/truffle/getting-started/running-migrations/#available-accounts
	
	// deployment steps (Deploy a single contract with constructor arguments)
	await deployer.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2) // quorum = 2
	const wallet = await Wallet.deployed() // get info of deployed contract instance

	// @ts-ignore
	await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10_000}) // 10_000 wei
}

// DOCS: Read more about deployment options @ https://trufflesuite.com/docs/truffle/getting-started/running-migrations/#deployerdeploycontract-args-options