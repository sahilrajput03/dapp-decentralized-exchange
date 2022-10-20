import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {getWeb3, getMsWallet, utf8ToHex, hexToUtf8, toDecimal, toBN, fromWei} from '../helpers/utils'
import type {Web3InstanceType} from '../helpers/utils'
import ClientOnly from '../components/ClientOnly'
import {useEffect, useRef, useState} from 'react'
import Header from '../components/Header'
import NewTransfer from '../components/NewTransfer'
import TransferList from '../components/TransferList'
import type {transferT} from '../components/NewTransfer'
import {network, walletAddress} from '../config'
import styled from 'styled-components'
import Web3 from 'web3'

// hex to ascii

// Convert eth value upto 2 decimals
const twoDecimalsETH = (m: string) => {
	let tuple = m.split('.')
	if (tuple.length === 1) return tuple // do try to get two decimals if there is no decimal

	tuple[1] = tuple[1].slice(0, 2)
	return tuple[0] + '.' + tuple[1]
}

const Home: NextPage = () => {
	return (
		<div className={styles.container}>
			<Head>
				<title>MultiSig Dapp</title>
				<meta name='description' content='Multisig Dapp' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<ClientOnly>
				<Content />
			</ClientOnly>
		</div>
	)
}

type addressType = string[] | undefined
type quorumType = number | undefined
type approversType = string[] | undefined

// networkId/chainId ~Sahil
// ChainIds: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids
const chainId_chainName: any = {
	'1': 'Ethereum Main Network (Mainnet)',
	'3': 'Ropsten Test Network',
	'4': 'Rinkeby Test Network',
	'5': 'Goerli Test Network',
	'42': 'Kovan Test Network',
	'80001': 'mumbai',
}

interface balancesMapType {
	[key: string]: string
}

const Content = () => {
	const [web3, setWeb3] = useState<Web3InstanceType>(undefined)
	const [accounts, setAccounts] = useState<addressType>(undefined)
	const [wallet, setWallet] = useState<any>(undefined)
	const [approvers, setApprovers] = useState<approversType>(undefined)
	const [quorum, setQuorum] = useState<quorumType>(undefined)
	const [transfers, setTransfers] = useState(undefined)
	const appRef = useRef({isErrorReported: false, isNetworkChangeReported: false, isUserChangeReported: false})
	const [balancesMap, setBalancesMap] = useState<balancesMapType>({})
	const [appErrorMessg, setAppErrorMessg] = useState('')

	useEffect(() => {
		async function init() {
			try {
				Object.assign(window, {__web3ForUtilsOnly: Web3})
				// Detech if metmask is not installed, src: https://ethereum.stackexchange.com/a/122761/106687
				if (typeof window.ethereum === 'undefined') {
					throw new Error('no-metamask')
				}

				// DETECTING NETWORK CHAGNE IN METAMASK
				// `networkChanged` is deprecated: https://docs.metamask.io/guide/ethereum-provider.html#networkchanged-deprecated
				// window.ethereum.on('networkChanged', function(networkId: string){
				// 	alert(networkId) //
				//   });
				//
				// `chainChanged`: https://docs.metamask.io/guide/ethereum-provider.html#chainchanged
				// Metamask => We strongly recommend reloading the page on chain changes, unless you have good reason not to.
				// DETECTING NETWORK CHAGNE IN METAMASK: **LATEST**
				window.ethereum.on('chainChanged', (chainId: string) => {
					if (appRef.current.isNetworkChangeReported) return
					// alert(chainId)
					// alert(toDecimal(chainId))
					const chainName = chainId_chainName?.[toDecimal(chainId)]
					alert(chainName ? 'Network Changed to ' + chainName : 'Network with chainId ' + chainId)
					window.location.href = '' // refresh whole page
					appRef.current.isNetworkChangeReported = true
				})

				const web3: any = await getWeb3()
				const accounts = await web3.eth.getAccounts()
				const wallet = await getMsWallet(web3)
				const approvers = await wallet.methods.getApprovers().call()
				const quorum = await wallet.methods.quorum().call() // .call() is for `reading data` from contract
				const transfers = await wallet.methods.getTransfers().call() // .call() is for `reading data` from contract

				Object.assign(window, {_web3: web3})

				// TODO: In very future I can make these addresses to be fetched from the blockchain itself or may be i already have it there but i am too lazy rn.
				Object.assign(window, {approvers})

				// const accs = [
				// 	'0xF1C8471dF8772D9ACE6fa116d5C5f077A3b7AFe6',
				// 	'0xd2fCf98a201FA4319f5856503e9F05dF01eD2DDA',
				// 	'0xF67187621a1CE42EBCEC146d644a2C321E3EFa45',
				// ]

				const allAddresses = [...approvers, walletAddress]

				// Get balance of all users from blockchain (src: https://ethereum.stackexchange.com/a/88243/106687)
				let allBalances = await Promise.all(allAddresses.map((addr: any) => web3.eth.getBalance(addr)))
				let allBalancesMap: any = {}
				allBalances.forEach((b: any, idx: any) => {
					allBalancesMap[allAddresses[idx]] = b
				})
				setBalancesMap(allBalancesMap)

				// wei to ether convert
				// web3.utils.fromWei(number [, unit]) // docs: https://web3js.readthedocs.io/en/1.0/web3-utils.html

				setWeb3(web3)
				setAccounts(accounts)
				setWallet(wallet)
				setApprovers(approvers)
				setQuorum(quorum)
				setTransfers(transfers)

				// Source: https://ethereum.stackexchange.com/a/42810/106687
				window.ethereum.on('accountsChanged', function (accounts: string[]) {
					if (appRef.current.isUserChangeReported) return // report user once

					alert('User changed to:' + accounts[0])
					window.location.href = '' // refresh whole page
					appRef.current.isUserChangeReported = true
				})
			} catch (error: any) {
				if (appRef.current.isErrorReported) return // report to user for only once

				// alert(error.name) // Error
				const errorMessage1 =
					"Returned values aren't valid, did it run Out of Gas? You might also see this error if you are not using the correct ABI for the contract you are retrieving data from, requesting data from a block number that does not exist, or querying a node which is not fully synced."
				const errorMessage2 = 'no-metamask'
				const errMessage2 = 'JsonRpcEngine: Response has no error or result for request'
				if (error.message === errorMessage1 || error.message.startsWith(errMessage2)) {
					const eMessg1 = `Probably:
					1. You need to select goerli network in your metamask wallet.
					2. You are using wrong contract abi.`

					// alert(eMessg1)
					setAppErrorMessg(eMessg1)
				} else if (error.message === errorMessage2) {
					const eMessg2 = 'Please install metamask for your browser  '
					setAppErrorMessg(eMessg2)
				} else {
					const eMessg2 = `Unhandled Exception
					Kindly send me a screenshot of the next error message you see to me: sahilrajput03@gmail.com.
					Thanks in advance.`

					// alert(eMessg2)
					// alert(error.message)
					setAppErrorMessg(eMessg2 + error.message)
				}

				appRef.current.isErrorReported = true
			}
		}

		init()
	}, [])

	console.log({web3, accounts, wallet, approvers, quorum})

	const isAppLoading = !web3 || !accounts || !wallet || !approvers || !quorum || !transfers

	// if (true) {
	const AppLoading = (
		<div className='mx-auto mt-5' style={{width: '500px', textAlign: 'center'}}>
			{Boolean(appErrorMessg) ? (
				<h5 className='text-danger text-start' style={{whiteSpace: 'pre-line'}}>
					{appErrorMessg}
					{appErrorMessg.startsWith('Please install') && (
						<a target={'_blank'} href='https://metamask.io/' rel='noreferrer'>
							https://metamask.io/
						</a>
					)}
				</h5>
			) : (
				<>
					<Loader className='spinner-grow text-primary' role='status'>
						<span className='visually-hidden'>Loading...</span>
					</Loader>
					<h1>Loading</h1>
				</>
			)}
		</div>
	)

	const createTransfer = async (transfer: transferT) => {
		try {
			const k = await wallet.methods.createTransfer(transfer.amount, transfer.to).send({from: accounts?.[0]}) // .send() is for `sending data` to contract
			console.log({k})
			alert('Transfer request is created successfully.')
			window.location.href = '' // refresh whole page
		} catch (error: any) {
			console.log('error.name', error.name)
			console.log('error.message', error.message)
			window.location.href = '' // refresh whole page
		}
	}

	const approveTransfer = async (transferId: number) => {
		try {
			const m = await wallet.methods.approveTransfer(transferId).send({from: accounts?.[0]}) // .send() is for `sending data` to contract
			// const m = await wallet.methods.approveTransfer(transferId).send({from: accounts?.[0], gasLimit: 1 * 10 ** 6 }) // .send() is for `sending data` to contract
			console.log({m})
			alert('Transfer request approved.')
		} catch (error: any) {
			console.log('error.name', error.name)
			console.log('error.message', error.message)
		}
	}

	return (
		<>
			<Head>
				<title>MultiSig Wallet | Ethereum</title>
				<meta name='description' content='MultiSig Wallet | Ethereum' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className={styles.main + ' container my-5'}>
				<SimpleCard className='card rounded-5 mx-auto text-center p-5 pt-0 overflow-hidden shadow-lg'>
					<h1 className='h1 fw-bold bg-primary text-white py-4 mx-n5'>
						{' '}
						Multisig Wallet
						<li className='list-group-item border-primary text-primary text-end fs-5'>
							<div className='bg-primary text-white rounded-5 px-3 py-1' style={{height: '1.5rem'}}>
								{balancesMap?.[walletAddress] && 'Wallet Balance: ' + balancesMap?.[walletAddress] + ' WEI'}
							</div>
						</li>
					</h1>
					{isAppLoading ? (
						// {true ? (
						AppLoading
					) : (
						<>
							<Header
								approvers={approvers}
								quorum={quorum}
								currentAccountAddress={accounts[0]}
								balancesMap={balancesMap}
							/>
							<NewTransfer createTransfer={createTransfer} />
							<TransferList
								transfers={transfers}
								approveTransfer={approveTransfer}
								walletBalance={balancesMap[walletAddress]}
							/>
							{/* {network === 'local' || network === 'development' && <pre>{allAddresses}</pre>} */}
							{network === 'goerli' && (
								<div className='fst-italic mt-4'>
									View transaction on Blockchain -{' '}
									<a target={'_blank'} href={'https://goerli.etherscan.io/address/' + walletAddress} rel='noreferrer'>
										goerli.etherscan.io
									</a>
									<div className='d-flex justify-content-center'>
										MultiSig Wallet Address:<div className='ms-1'>{walletAddress}</div>
									</div>
								</div>
							)}
						</>
					)}
				</SimpleCard>
			</main>
		</>
	)
}

const SimpleCard = styled.div`
	width: 1000px;
`

const Loader = styled.div`
	width: 4rem;
	height: 4rem;
`

export default Home

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

const mnemonic = 'carry basket must lens sweet utility banner wash history appear car leisure'
