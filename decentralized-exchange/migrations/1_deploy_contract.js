const fs = require('fs')

// @ts-ignore
const {artifacts} = global
const Dai = artifacts.require('mocks/DaiT.sol')
const Bat = artifacts.require('mocks/Bat.sol')
const Rep = artifacts.require('mocks/Rep.sol')
const Zrx = artifacts.require('mocks/Zrx.sol')
const Dex = artifacts.require('Dex.sol')

const SIDE = {
	BUY: 0,
	SELL: 1,
}

// @ts-ignore
var web3

const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX'].map((ticker) => web3.utils.fromAscii(ticker))

module.exports = async function (deployer, network, accounts) {
	console.log(`Using network {{ File: ${__filename} }} ~Sahil`, network)
	// process.exit(0)
	
	const [trader1, trader2, trader3, trader4, _] = accounts

	await Promise.all([Dai, Bat, Rep, Zrx, Dex].map((Contract) => deployer.deploy(Contract)))

	const [dai, bat, rep, zrx, dex] = await Promise.all([Dai, Bat, Rep, Zrx, Dex].map((Contract) => Contract.deployed()))

	// Write to config-*network*.js file for frontend use of the dex contract
	writeContractAddressToFile(dex, network)

	await Promise.all([
		dex.addToken(DAI, dai.address),
		dex.addToken(BAT, bat.address),
		dex.addToken(REP, rep.address),
		dex.addToken(ZRX, zrx.address),
	])

	const amount = web3.utils.toWei('1000')
	const seedTokenBalance = async (token, trader) => {
		await token.faucet(trader, amount)
		await token.approve(dex.address, amount, {from: trader})
		const ticker = await token.symbol() // const ticker = await token.name() // ~~Sahil In newer version of ERC20 Openzeppelin contract, you need to call `symbol()` to get the symbol/ticker name becoz `name()` will give you the full name of the coin say `Dai Stable Coin`.
		console.log(`INFO: ~Sahil: Calling method ${ticker}.faucet(${trader}, ${amount})`)
		await dex.deposit(amount, web3.utils.fromAscii(ticker), {from: trader})
	}

	const tokens = [dai, bat, rep, zrx]
	const traders = [trader1, trader2, trader3, trader4]

	// USING SERIAL EXECUTION FOR SEEDING TOKEN BALANCES
	for (const token of tokens) {
		for (const trader of traders) {
			await seedTokenBalance(token, trader)
		}
	}

	const increaseTime = async (seconds) => {
		await web3.currentProvider.send(
			{
				jsonrpc: '2.0',
				method: 'evm_increaseTime',
				params: [seconds],
				id: 0,
			},
			() => {}
		)
		await web3.currentProvider.send(
			{
				jsonrpc: '2.0',
				method: 'evm_mine',
				params: [],
				id: 0,
			},
			() => {}
		)
	}

	// Source of below sample trades code: https://github.com/jklepatch/eattheblocks/blob/master/blockchain-masterclass/dex-3-frontend/5-seed-orders/migrations/2_deploy_contracts.js

	//create trades
	await dex.createLimitOrder(BAT, 1000, 10, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(BAT, 1000, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(BAT, 1200, 15, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(BAT, 1500, 14, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(BAT, 1500, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(BAT, 2000, 12, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(BAT, 2000, SIDE.SELL, {from: trader2})

	await dex.createLimitOrder(REP, 1000, 2, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(REP, 1000, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(REP, 500, 4, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(REP, 500, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(REP, 800, 2, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(REP, 800, SIDE.SELL, {from: trader2})
	await increaseTime(1)
	await dex.createLimitOrder(REP, 1200, 6, SIDE.BUY, {from: trader1})
	await dex.createMarketOrder(REP, 1200, SIDE.SELL, {from: trader2})

	// more limit orders
	await dex.createLimitOrder(BAT, 1400, 10, SIDE.BUY, {from: trader1})
	await dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader2})
	await dex.createLimitOrder(BAT, 1000, 12, SIDE.BUY, {from: trader2})

	await dex.createLimitOrder(REP, 3000, 4, SIDE.BUY, {from: trader1})
	await dex.createLimitOrder(REP, 2000, 5, SIDE.BUY, {from: trader1})
	await dex.createLimitOrder(REP, 500, 6, SIDE.BUY, {from: trader2})

	await dex.createLimitOrder(ZRX, 4000, 12, SIDE.BUY, {from: trader1})
	await dex.createLimitOrder(ZRX, 3000, 13, SIDE.BUY, {from: trader1})
	await dex.createLimitOrder(ZRX, 500, 14, SIDE.BUY, {from: trader2})

	await dex.createLimitOrder(BAT, 2000, 16, SIDE.SELL, {from: trader3})
	await dex.createLimitOrder(BAT, 3000, 15, SIDE.SELL, {from: trader4})
	await dex.createLimitOrder(BAT, 500, 14, SIDE.SELL, {from: trader4})

	await dex.createLimitOrder(REP, 4000, 10, SIDE.SELL, {from: trader3})
	await dex.createLimitOrder(REP, 2000, 9, SIDE.SELL, {from: trader3})
	await dex.createLimitOrder(REP, 800, 8, SIDE.SELL, {from: trader4})

	await dex.createLimitOrder(ZRX, 1500, 23, SIDE.SELL, {from: trader3})
	await dex.createLimitOrder(ZRX, 1200, 22, SIDE.SELL, {from: trader3})
	await dex.createLimitOrder(ZRX, 900, 21, SIDE.SELL, {from: trader4})
}

function writeContractAddressToFile(dex, networkName) {
	let config = `
export const dexAddress = '${dex.address}'
export const networkName = '${networkName}'
// (Alert: WORKS FOR GOERLI CONTRACTS ONLY) View txns @ goerli.etherscan.io: https://goerli.etherscan.io/address/${dex.address}
`.trim()

	let data = JSON.stringify(config)
	const isLocal = (networkName === 'development' || networkName === 'develop')
	const TARGET_FILE_PATH = `./config/config-${isLocal ? 'local' : networkName}.ts`
	fs.writeFileSync(TARGET_FILE_PATH, JSON.parse(data))
}

//! Singe using any of below method of using `Promise.all` doesn't seem to work, so above dumb code rocks for truffle for now. ~Sahil

// Parallel way1 - From me: (doesn't work throw nonce mismatch error)
// await Promise.all([trader1, trader2, trader3, trader4].map((trader) => seedTokenBalance(dai, trader)))
// await Promise.all([trader1, trader2, trader3, trader4].map((trader) => seedTokenBalance(bat, trader)))
// await Promise.all([trader1, trader2, trader3, trader4].map((trader) => seedTokenBalance(rep, trader)))
// await Promise.all([trader1, trader2, trader3, trader4].map((trader) => seedTokenBalance(zrx, trader)))

// Parallel way2 - From author: (doesn't work throw nonce mismatch error)
// await Promise.all([dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader1)))
// await Promise.all([dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader2)))
// await Promise.all([dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader3)))
// await Promise.all([dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader4)))

// ! Seeding balance to to tokens via DUMB code (dumb code works good but its too verbose to scale)
// await seedTokenBalance(dai, trader1)
// await seedTokenBalance(dai, trader2)
// await seedTokenBalance(dai, trader3)
// await seedTokenBalance(dai, trader4)
// await seedTokenBalance(bat, trader1)
// await seedTokenBalance(bat, trader2)
// await seedTokenBalance(bat, trader3)
// await seedTokenBalance(bat, trader4)
// await seedTokenBalance(rep, trader1)
// await seedTokenBalance(rep, trader2)
// await seedTokenBalance(rep, trader3)
// await seedTokenBalance(rep, trader4)
// await seedTokenBalance(zrx, trader1)
// await seedTokenBalance(zrx, trader2)
// await seedTokenBalance(zrx, trader3)
// await seedTokenBalance(zrx, trader4)

// ! since below Promise.all code faile so for now using below dumb code with truffle.
// ! Error thrown is somewhat related to: https://www.google.com/search?q=after+consuming+all+gas&oq=after+consuming+all+gas&aqs=chrome..69i57j33i160l3.3914j0j1&sourceid=chrome&ie=UTF-8
//create orders
// await Promise.all([
// 	dex.createLimitOrder(BAT, 1400, 10, SIDE.BUY, {from: trader1}),
// 	dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader2}),
// 	dex.createLimitOrder(BAT, 1000, 12, SIDE.BUY, {from: trader2}),

// 	dex.createLimitOrder(REP, 3000, 4, SIDE.BUY, {from: trader1}),
// 	dex.createLimitOrder(REP, 2000, 5, SIDE.BUY, {from: trader1}),
// 	dex.createLimitOrder(REP, 500, 6, SIDE.BUY, {from: trader2}),

// 	dex.createLimitOrder(ZRX, 4000, 12, SIDE.BUY, {from: trader1}),
// 	dex.createLimitOrder(ZRX, 3000, 13, SIDE.BUY, {from: trader1}),
// 	dex.createLimitOrder(ZRX, 500, 14, SIDE.BUY, {from: trader2}),

// 	dex.createLimitOrder(BAT, 2000, 16, SIDE.SELL, {from: trader3}),
// 	dex.createLimitOrder(BAT, 3000, 15, SIDE.SELL, {from: trader4}),
// 	dex.createLimitOrder(BAT, 500, 14, SIDE.SELL, {from: trader4}),

// 	dex.createLimitOrder(REP, 4000, 10, SIDE.SELL, {from: trader3}),
// 	dex.createLimitOrder(REP, 2000, 9, SIDE.SELL, {from: trader3}),
// 	dex.createLimitOrder(REP, 800, 8, SIDE.SELL, {from: trader4}),

// 	dex.createLimitOrder(ZRX, 1500, 23, SIDE.SELL, {from: trader3}),
// 	dex.createLimitOrder(ZRX, 1200, 22, SIDE.SELL, {from: trader3}),
// 	dex.createLimitOrder(ZRX, 900, 21, SIDE.SELL, {from: trader4}),
// ])
// :::::::OLD contract code beloww:::::::

// writeContractAddressToFile(contract, network)
// @ts-ignore
// Sending 10_000 wei to our contract
// await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10_000}) // 10_000 wei

// const {artifacts} = global
// var Wallet = artifacts.require('MultiSigWallet')
// const fs = require('fs')

// module.exports = async function (deployer, network, accounts) {
// 	// accounts i.e, 3rd argument is the exact same list of accounts returned from web3.eth.getAccounts(). Source: https://trufflesuite.com/docs/truffle/getting-started/running-migrations/#available-accounts
// 	// console.log('GOT _network:?', network); // development, goerli

// 	// deployment steps (Deploy a single contract with constructor arguments)
// 	await deployer.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2) // quorum = 2
// 	const wallet = await Wallet.deployed() // get info of deployed contract instance
// 	writeContractAddressToFile(wallet, network) // Using nodejs api to write contract address to a file for usage in frontend
// 	// @ts-ignore
// 	// Sending 10_000 wei to our contract
// 	await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10_000}) // 10_000 wei

// 	// USING THEN() CALLS
// 	// deployer
// 	// 	.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2)
// 	// 	.then(() => {
// 	// 		return Wallet.deployed()
// 	// 	})
// 	// 	.then((wallet) => {
// 	// 		// `wallet` get info of deployed contract instance
// 	// 		// console.log('boaaay?', wallet.address) // Works good enough
// 	// 		// @ts-ignore
// 	// 		return web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10_000}) // 10_000 wei
// 	// 	})
// }

// // DOCS: Read more about deployment options @ https://trufflesuite.com/docs/truffle/getting-started/running-migrations/#deployerdeploycontract-args-options

// function writeContractAddressToFile(wallet, networkName) {
// 	let config = `
// export const walletAddress = '${wallet.address}'
// export const networkName = '${networkName}'
// // (Alert: WORKS FOR GOERLI CONTRACTS ONLY) View txns @ goerli.etherscan.io: https://goerli.etherscan.io/address/${wallet.address}
// `.trim()

// 	let data = JSON.stringify(config)
// 	const TARGET_FILE_PATH = `./client/config/config-${networkName === 'development' ? 'local' : networkName}.ts`
// 	fs.writeFileSync(TARGET_FILE_PATH, JSON.parse(data))
// }

// // #MASSIVE ISSUE# NETWORKS FIELD IN NOT POPULATED IN ARTIFACTS:
// // https://ethereum.stackexchange.com/questions/36612/truffle-does-not-add-networks-to-build-contracts-contract-json-after-migration
// // https://stackoverflow.com/questions/48609913/unhandled-rejection-error-this-contract-object-doesnt-have-address-set-yet-pl
// // https://stackoverflow.com/questions/70575902/there-is-no-data-networks-in-smart-contract-json
