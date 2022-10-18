import * as local from './config-local'
import * as mumbai from './config-mumbai'
import * as goerli from './config-goerli'

let config: any

const BC_NETWORK = process.env.NEXT_PUBLIC_BC_NETWORK

switch (BC_NETWORK) {
	case 'local':
		console.log('Using network: local')
		config = local
		break
	case 'goerli':
		console.log('Using network: goerli')
		config = goerli
		break
	case 'mumbai':
		console.log('Using network: mumbai')
		config = mumbai
		break
	default:
		throw new Error('Config file for: ' + BC_NETWORK + ' netowrk not found')
}

console.log('Uisng network with addresses:', config)

export const walletAddress = config.walletAddress
export const network = config.networkName
