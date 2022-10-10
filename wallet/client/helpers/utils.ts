// vid 61
import Web3 from 'web3'

// `Wallet` is a contract abstraction
import Wallet from '../contracts/MultiSigWallet.json'
import {walletAddress} from '../contracts/walletAddress'

const getWeb3 = () => {
	// will return web3 instance
	// return Web3('http://localhost:9545') // ~Author used this
	return new Web3('http://127.0.0.1:9545') // `truffle develop` command show this address for the node
}
export type Web3InstanceType = ReturnType<typeof getWeb3> | undefined
// export type MsWalletInstanceType = undefined

const getMsWallet = async (web3: any) => {
	// getting networkId from contract absration
	const networkId = await web3.eth.net.getId()

	// LEARN: We use networkId to extract information from the contract artifact
	const contractDeployment: any = {address: walletAddress}
	// const contractDeployment: any = Wallet.networks[networkId] //? (DOES NOT WORK) Time spend on this 2 HOURS

	// returning contract instance
	return new web3.eth.Contract(Wallet.abi, contractDeployment && contractDeployment.address)
	// return new web3.eth.Contract(Wallet.abi) // throws error: Error: This contract object doesn't have address set yet, please set an address first
}

export {getWeb3, getMsWallet}
