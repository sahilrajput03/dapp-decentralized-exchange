import * as localConfig from './config-local'
import * as mumbaiConfig from './config-mumbai'
import * as goerliConfig from './config-goerli'

let config: any

const BC_NETWORK = process.env.NEXT_PUBLIC_BC_NETWORK

switch (BC_NETWORK) {
	case 'local':
		console.log('Using network: local')
		config = localConfig
		break
	case 'goerli':
		console.log('Using network: goerli')
		config = goerliConfig
		break
	case 'mumbai':
		console.log('Using network: mumbai')
		config = mumbaiConfig
		break
	default:
		throw new Error('Config file for: ' + BC_NETWORK + ' netowrk not found')
}

console.log('Using network with addresses:', config)

export default config
