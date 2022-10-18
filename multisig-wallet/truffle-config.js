/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation, and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * https://trufflesuite.com/docs/truffle/reference/configuration
 *
 * Hands-off deployment with Infura
 * --------------------------------
 *
 * Do you have a complex application that requires lots of transactions to deploy?
 * Use this approach to make deployment a breeze 🏖️:
 *
 * Infura deployment needs a wallet provider (like @truffle/hdwallet-provider)
 * to sign transactions before they're sent to a remote public node.
 * Infura accounts are available for free at 🔍: https://infura.io/register
 *
 * You'll need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. You can store your secrets 🤐 in a .env file.
 * In your project root, run `$ npm install dotenv`.
 * Create .env (which should be .gitignored) and declare your MNEMONIC
 * and Infura PROJECT_ID variables inside.
 * For example, your .env file will have the following structure:
 *
 * MNEMONIC = <Your 12 phrase mnemonic>
 * PROJECT_ID = <Your Infura project id>
 *
 * Deployment with Truffle Dashboard (Recommended for best security practice)
 * --------------------------------------------------------------------------
 *
 * Are you concerned about security and minimizing rekt status 🤔?
 * Use this method for best security:
 *
 * Truffle Dashboard lets you review transactions in detail, and leverages
 * MetaMask for signing, so there's no need to copy-paste your mnemonic.
 * More details can be found at 🔎:
 *
 * https://trufflesuite.com/docs/truffle/getting-started/using-the-truffle-dashboard/
 */

require('dotenv').config()
const {MNEMONIC, PR_KEY1, PR_KEY2, PR_KEY3, PROJECT_ID} = process.env
// Mnemonic from output of `truffle develop`
// # FYI: PROJECT_ID = INFURA's API_KEY (Infura team changed the names of the this value, source: from their documentation.)
if (!PROJECT_ID || !PR_KEY1 || !PR_KEY2 || !PR_KEY3) {
	console.error('Please make sure you have all the required environment files in .env file')
	process.exit(1)
}

const HDWalletProvider = require('@truffle/hdwallet-provider')

const path = require('path')
module.exports = {
	/**
	 * Networks define how you connect to your ethereum client and let you set the
	 * defaults web3 uses to send transactions. If you don't specify one truffle
	 * will spin up a managed Ganache instance for you on port 9545 when you
	 * run `develop` or `test`. You can ask a truffle command to use a specific
	 * network from the command line, e.g
	 *
	 * $ truffle test --network <network-name>
	 */

	contracts_build_directory: './abis',
	// contracts_build_directory: path.join(__dirname, 'client/contracts'),

	networks: {
		// Useful for testing. The `development` name is special - truffle uses it by default
		// if it's defined here and no other network is specified at the command line.
		// You should run a client (like ganache, geth, or parity) in a separate terminal
		// tab if you use this network and you must also set the `host`, `port` and `network_id`
		// options below to some value.
		//

		// ~Sahil: I uncommented below code to try to run my test events to be run against this development instance of gnache-server though and it seems to work though.
		development: {
			host: '127.0.0.1', // Localhost (DEFAULT: none)
			port: 9545, // Standard Ethereum port (DEFAULT: none)
			// Use 7545 port for a ganache node run via ganache.AppImage you run for a ui.
			// port: 9545, // Standard Ethereum port (DEFAULT: none)
			network_id: '*', // Any network (DEFAULT: none)
			websockets: true,
			// from: "", // default address to use for any transaction Truffle makes
			// disableConfirmationListener: true, // (TRIED TO IMPROVE PERFORMANCE WITH THIS) set to true to disable web3's confirmation listener // src: https://trufflesuite.com/docs/truffle/reference/configuration/
		},
		//
		// An additional network, but with some advanced options…
		// advanced: {
		//   port: 8777,             // Custom port
		//   network_id: 1342,       // Custom network
		//   gas: 8500000,           // Gas sent with each transaction (DEFAULT: ~6700000)
		//   gasPrice: 20000000000,  // 20 gwei (in wei) (DEFAULT: 100 gwei)
		//   from: <address>,        // Account to send transactions from (DEFAULT: accounts[0])
		//   websocket: true         // Enable EventEmitter interface for web3 (DEFAULT: false)
		// },
		//
		// Useful for deploying to a PUBLIC NETWORK.
		// Note: It's important to wrap the provider as a function to ensure truffle uses a new provider every time.
		// ~Sahil: vid 74
		goerli: {
			// provider: () => new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${PROJECT_ID}`), // FROM INITIAL TEMPLATE
			provider: () =>
				new HDWalletProvider({
					// mnemonic: MNEMONIC, // You either need mnemonic or private keys to generate addresses ~Author and Sahil
					privateKeys: [PR_KEY1, PR_KEY2, PR_KEY3],
					providerOrUrl: `https://goerli.infura.io/v3/${PROJECT_ID}`,
					numberOfAddresses: 3, // Default is 1; These three account addresses are available to the deployment script file (`wallet/migrations/2_deploy_contract.js`) and will utilise those addresses at that time accordingly as used in that file. ~Sahil
				}),
			network_id: 5, // Goerli's id (~Sahi: Chain id is also 5)
			confirmations: 2, // # of confirmations to wait between deployments. (DEFAULT: 0)
			timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/DEFAULT: 50)
			skipDryRun: true, // Skip dry run before migrations? (DEFAULT: false for public nets )
		},
		//
		// Useful for PRIVATE NETWORKS
		// private: {
		//   provider: () => new HDWalletProvider(MNEMONIC, `https://network.io`),
		//   network_id: 2111,   // This network is yours, in the cloud.
		//   production: true    // Treats this network as if it was a public net. (DEFAULT: false)
		// }
	},

	// Set default mocha options here, use special reporters, etc.
	mocha: {
		// This has no effect on delayed exiting of test execution ~Sahil. Truffle is bad at testing!
		// timeout: 100000
	},

	// Configure your compilers
	compilers: {
		solc: {
			version: '0.8.17', // Fetch exact version from solc-bin (DEFAULT: truffle's version)
			// docker: true,        // Use "0.5.1" you've installed locally with docker (DEFAULT: false)
			// settings: {          // See the solidity docs for advice about optimization and evmVersion
			//  optimizer: {
			//    enabled: false,
			//    runs: 200
			//  },
			//  evmVersion: "byzantium"
			// }
		},
	},

	// Truffle DB is currently disabled by default; to enable it, change enabled:
	// false to enabled: true. The default storage location can also be
	// overridden by specifying the adapter settings, as shown in the commented code below.
	//
	// NOTE: It is not possible to migrate your contracts to truffle DB and you should
	// make a backup of your artifacts to a safe location before enabling this feature.
	//
	// After you backed up your artifacts you can utilize db by running migrate as follows:
	// $ truffle migrate --reset --compile-all
	//
	// db: {
	//   enabled: false,
	//   host: "127.0.0.1",
	//   adapter: {
	//     name: "indexeddb",
	//     settings: {
	//       directory: ".db"
	//     }
	//   }
	// }
}
