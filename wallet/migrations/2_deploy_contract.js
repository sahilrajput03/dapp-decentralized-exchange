// @ts-ignore
const {artifacts} = global
var Wallet = artifacts.require('MultiSigWallet')
const fs = require('fs')

module.exports = async function (deployer, _network, accounts) {
	// accounts i.e, 3rd argument is the exact same list of accounts returned from web3.eth.getAccounts(). Source: https://trufflesuite.com/docs/truffle/getting-started/running-migrations/#available-accounts

	// deployment steps (Deploy a single contract with constructor arguments)
	await deployer.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2) // quorum = 2
	const wallet = await Wallet.deployed() // get info of deployed contract instance
	writeContractAddressToFile(wallet) // Using nodejs api to write contract address to a file for usage in frontend
	// @ts-ignore
	await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10_000}) // 10_000 wei

	// USING THEN() CALLS
	// deployer
	// 	.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2)
	// 	.then(() => {
	// 		return Wallet.deployed()
	// 	})
	// 	.then((wallet) => {
	// 		// `wallet` get info of deployed contract instance
	// 		// console.log('boaaay?', wallet.address) // Works good enough
	// 		// @ts-ignore
	// 		return web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10_000}) // 10_000 wei
	// 	})
}

// DOCS: Read more about deployment options @ https://trufflesuite.com/docs/truffle/getting-started/running-migrations/#deployerdeploycontract-args-options

function writeContractAddressToFile(wallet) {
	let config = `
export const walletAddress = '${wallet.address}'
`.trim()

	let data = JSON.stringify(config)
	const TARGET_FILE_PATH = './client/contracts/walletAddress.ts'
	fs.writeFileSync(TARGET_FILE_PATH, JSON.parse(data))
}

// #MASSIVE ISSUE# NETWORKS FIELD IN NOT POPULATED IN ARTIFACTS:
// https://ethereum.stackexchange.com/questions/36612/truffle-does-not-add-networks-to-build-contracts-contract-json-after-migration
// https://stackoverflow.com/questions/48609913/unhandled-rejection-error-this-contract-object-doesnt-have-address-set-yet-pl
// https://stackoverflow.com/questions/70575902/there-is-no-data-networks-in-smart-contract-json
