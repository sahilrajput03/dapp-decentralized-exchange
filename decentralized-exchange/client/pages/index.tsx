import type {NextPage} from 'next'
import Head from 'next/head'
import styles from 'styles/Home.module.css'
import ClientOnly from 'components/ClientOnly'
import config from 'config'
import {useAppData} from 'contexts'
import Header from 'components/Header'
import Walllet from 'components/Walllet'
import NewOrder from 'components/NewOrder'
import AllOrders from 'components/AllOrders'
import MyOrders from 'components/MyOrders'
import AllTrades from 'components/AllTrades'
import * as f from 'flatted'

// console.log('got config?', config)
const {dexAddress, networkName} = config
// console.log('got address?', dexAddress, networkName)

const Home: NextPage = () => {
	return (
		<div className={styles.container}>
			<Head>
				<title>Decentralized Exchange Dapp</title>
				<meta name='description' content='Decentralized Exchange Dapp' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<Content />

			{/* <ClientOnly>
				<Content />
			</ClientOnly> */}
		</div>
	)
}

const DebugAppData = () => {
	const [appData] = useAppData()

	// Disable Showing debug data in dom
	return null

	return (
		<ClientOnly>
			<pre>{JSON.stringify({...appData, web3: undefined, contracts: undefined, listener: undefined}, null, 2)}</pre>
		</ClientOnly>
	)

	// return <pre>{JSON.stringify({})}</pre>
}

const Content = () => {
	const [appData] = useAppData()

	if (!appData.user?.selectedToken) {
		return <div>Loading...</div>
	}

	return (
		<main className={styles.main}>
			<DebugAppData />

			<Header />
			<main className='container-fluid'>
				<div className='row'>
					<div className='col-sm-5 first-col'>
						<Walllet />
						{/* Show NewOrder component for non-dai token is selected in UI. */}
						{appData.user.selectedToken.ticker !== 'DAI' && <NewOrder />}
					</div>

					<div className='col-sm-7 second-col'>
						{appData.user.selectedToken.ticker !== 'DAI' && (
							<>
								<AllTrades />
								<AllOrders />
								<MyOrders />
							</>
						)}
					</div>
				</div>
			</main>

			<BasicInfo network={networkName} address={dexAddress} />
		</main>
	)
}

export default Home

function BasicInfo({network, address}: any) {
	return (
		<div>
			{network === 'local' && <pre>{allAddresses}</pre>}
			{network === 'goerli' && (
				<div>
					<h2>View Transactions</h2>
					View transaction @ goerli.etherscan.io:{' '}
					<a href={'https://goerli.etherscan.io/address/' + address}>Click here</a>
				</div>
			)}
		</div>
	)
}

const allAddresses = `
Accounts:
(1) 0xb94b0d0c8ec9cd9734b3e2a18c5a6ee31881397a
(2) 0xe8658c5bb8a42257f8a82c12d5ae041972f0813a
(3) 0xa918513dedc13a3461996a803c907996fe1bf1e1
(4) 0x7fcf46b5f90ed0adca5e689b9387b6c7edfb8026
(5) 0x7f473cd57263d3155ac2a73f821e7e87d64acbbd
(6) 0x1417e64e14cdbcd0383878b98869ff2e807ec9a0
(7) 0x07af00cadcf7fba8f9846ccd9089355da99adcb8
(8) 0xc1431fa70f73dce0a9ee66563418f687ce528a51
(9) 0x6ea88ccd547e9ae601d8ef94ece32debc195bc29
(10) 0xb822b8209834a938fcbd7b52421d600581db291e
	`.trim()

const allPrivateKeys = `
Private Keys:
(1) 778e18360f003aabd6dbbccd9c4b43a236863bbe2665b8dd0f6996cece8233b0
(2) 0e91790a3212c6ce2b954beb04f05408fbcd8ab91bcc45ccfdd1dcc5da7eed1a
(3) 5b1568a69de1df02385284bb7257347f30ccac2e6e5e82697385893e2a5b721d
(4) a52ef149e7e1cfb3f99c23f9b16feb48d5d661198860b9d951ce66b7458906d4
(5) 0ef18b56bc2c7f50a6f55691e514cc15a58fed1c6cc26e3022a94adc83bfb1df
(6) 0a9c05c066363ef3396baff5f051585b08a2e189f7df54ed9cae35997a497767
(7) 5bdcdcdae7c222d9377eb53b65005654d697f47012f91283de4eb18a64e9f905
(8) 5c98c3b46b88e0a49889d31010c67cf1d93b116c3e9c7a2350aa72d4807e3f2c
(9) 4db644c38b25eeb136abe2cbb52a05e84169271211dc834108582f87af976401
(10) f7e9746e6fcb21c2dcac6c882fffd79df6d0b434474d9cfab0c511ba7761adea
`
