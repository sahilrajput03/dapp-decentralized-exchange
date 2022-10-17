// vid 61
import Web3 from 'web3'

// `Wallet` is a contract abstraction
import Dex from '../abis/Dex.json'
import ERC20 from '../abis/ERC20.json'
import config from '../config/'

const {dexAddress} = config

if (!dexAddress) throw '`dexAddress` not found, please make sure you have it in config file.'

declare global {
	interface Window {
		ethereum: any
		web3: any
	}
}

let web3Base = new Web3(null) // This is to extract type ~Sahil
export type web3Type = typeof web3Base

const getWeb3 = (): Promise<web3Type> => {
	// will return web3 instance
	// return Web3('http://localhost:9545') // ~Author used this
	// return new Web3('http://127.0.0.1:9545') // WORKED THOUGH // `truffle develop` command show this address for the node

	return new Promise(async (resolve, reject) => {
		if (window.ethereum) {
			const web3 = new Web3(window.ethereum) // Web3() accepts a provider but its intelligent enought to convert a url to provider internall as well like we did previously (above url of local ganache node)
			const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
			resolve(web3)
			// Returning coz I don't need to wait for load function to be fired in this case.
			console.warn('~Sahil: wow wow: You do not need `load` event to load ethereum.')
			return
		}

		// not firing the load event is not related to `async` keyword. TESTED! ~Sahil
		window.addEventListener('load', async () => {
			alert('yo1.2')
			if (window.ethereum) {
				alert('yo1.3')
				const web3 = new Web3(window.ethereum) // Web3() accepts a provider but its intelligent enought to convert a url to provider internall as well like we did previously (above url of local ganache node)
				alert('yo1.4')

				try {
					// Deprecated way // await window.ethereum.enable() // will be deprecated told by Metamask in browser console and asks to use below `eth_requestAccounts` way to get access to accounts. ~Sahil
					// Request account access if needed // Current best practise to connect to MetaMask in chrome: https://ethereum.stackexchange.com/a/92097/106687
					const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
					// console.log('accounts?', {accounts}) // Learn: accounts is an array of strings

					resolve(web3)
				} catch (error) {
					alert('User denied access to metamask wallet.')
					reject(error)
				}
			} else if (window.web3) {
				alert('got here luck?')
				resolve(window.web3) // old vesion of metamask simply provider a provider directly
			} else {
				reject('Must install metamask')
			}
		})
	})
}

// LEARN:
// `web3.utils.hexToUtf8()` converts bytes32(hex) => ascii(human readable)

// Got this custom type
let contractBase = new web3Base.eth.Contract([])
export type contractType = typeof contractBase
export type getContractsReturnType = {
	[key: string]: contractType
}

const getContracts = async (web3: web3Type): Promise<getContractsReturnType> => {
	// returning contract instance
	const dex = new web3.eth.Contract(Dex.abi as any, dexAddress)

	const rawTokens = await dex.methods.getTokens().call()
	// console.log('got tokens?', tokens) // should be: [{ticker, tokenAddress}, {...}, {...}]
	const tokenContracts = rawTokens.reduce(
		(acc: any, token: any) => ({
			...acc,
			[web3.utils.hexToUtf8(token.ticker)]: new web3.eth.Contract(ERC20.abi as any, token.tokenAddress),
		}),
		{}
	)

	return {dex, ...tokenContracts}
	// return new web3.eth.Contract(Wallet.abi) //? This throws error: Error: This contract object doesn't have address set yet, please set an address first
}

export {getWeb3, getContracts}
