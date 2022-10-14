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

const getWeb3 = () => {
	// will return web3 instance
	// return Web3('http://localhost:9545') // ~Author used this
	// return new Web3('http://127.0.0.1:9545') // WORKED THOUGH // `truffle develop` command show this address for the node

	return new Promise((resolve, reject) => {
		window.addEventListener('load', async () => {
			if (window.ethereum) {
				const web3 = new Web3(window.ethereum) // Web3() accepts a provider but its intelligent enought to convert a url to provider internall as well like we did previously (above url of local ganache node)
				try {
					await window.ethereum.enable()
					resolve(web3)
				} catch (error) {
					alert('User denied access to metamask wallet.')
					reject(error)
				}
			} else if (window.web3) {
				resolve(window.web3) // old vesion of metamask simply provider a provider directly
			} else {
				reject('Must install metamask')
			}
		})
	})
}

// LEARN:
// `web3.utils.hexToUtf8()` converts bytes32(hex) => ascii(human readable)

const getContracts = async (web3: any) => {
	// returning contract instance
	const dex = new web3.eth.Contract(Dex.abi, dexAddress)

	const rawTokens = await dex.methods.getTokens().call()
	// console.log('got tokens?', tokens) // should be: [{ticker, tokenAddress}, {...}, {...}]
	const tokenContracts = rawTokens.reduce(
		(acc: any, token: any) => ({
			...acc,
			[web3.utils.hexToUtf8(token.ticker)]: new web3.eth.Contract(ERC20.abi, token.tokenAddress),
		}),
		{}
	)

	return {dex, ...tokenContracts}
	// return new web3.eth.Contract(Wallet.abi) //? This throws error: Error: This contract object doesn't have address set yet, please set an address first
}

export {getWeb3, getContracts}
