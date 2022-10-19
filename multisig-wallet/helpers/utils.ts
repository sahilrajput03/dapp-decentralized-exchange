// vid 61
import Web3 from 'web3'

// `Wallet` is a contract abstraction
import Wallet from '../abis/MultiSigWallet.json'
import * as config from '../config/'
import commify from './commify'

export {commify}
export const {toDecimal, toBN, fromWei, fromUtf8, fromAscii, toWei} = Web3.utils
export const utf8ToHex = Web3.utils.fromAscii
export const hexToUtf8 = Web3.utils.hexToUtf8

const {walletAddress} = config

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
				reject('Please install metamask in your browser to use this app.')
			}
		})
	})
}
export type Web3InstanceType = ReturnType<typeof getWeb3> | undefined
// export type MsWalletInstanceType = undefined //? I can't find the type for the wallet :( ~Sahil

const getMsWallet = async (web3: any) => {
	// getting networkId from contract absration
	// const networkId = await web3.eth.net.getId()

	// LEARN: We use networkId to extract information from the contract artifact
	const contractDeployment: any = {address: walletAddress}
	// const contractDeployment: any = Wallet.networks[networkId] //? (DOES NOT WORK) Time spend on this 3 HOURS

	// returning contract instance
	return new web3.eth.Contract(Wallet.abi, contractDeployment && contractDeployment.address)
	// return new web3.eth.Contract(Wallet.abi) //? This throws error: Error: This contract object doesn't have address set yet, please set an address first
}

export {getWeb3, getMsWallet}
