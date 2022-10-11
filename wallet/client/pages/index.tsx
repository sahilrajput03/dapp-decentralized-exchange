import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {getWeb3, getMsWallet} from '../helpers/utils'
import type {Web3InstanceType} from '../helpers/utils'
import ClientOnly from '../components/ClientOnly'
import {useEffect, useState} from 'react'
import Header from '../components/Header'
import NewTransfer from '../components/NewTransfer'
import TransferList from '../components/TransferList'
import type {transferT} from '../components/NewTransfer'

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

const Content = () => {
	const [web3, setWeb3] = useState<Web3InstanceType>(undefined)
	const [accounts, setAccounts] = useState<addressType>(undefined)
	const [wallet, setWallet] = useState<any>(undefined)
	const [approvers, setApprovers] = useState<approversType>(undefined)
	const [quorum, setQuorum] = useState<quorumType>(undefined)
	const [transfers, setTransfers] = useState(undefined)

	useEffect(() => {
		async function init() {
			const web3 = await getWeb3()
			const accounts = await web3.eth.getAccounts()
			const wallet = await getMsWallet(web3)
			const approvers = await wallet.methods.getApprovers().call()
			const quorum = await wallet.methods.quorum().call() // .call() is for `reading data` from contract
			const transfers = await wallet.methods.getTransfers().call() // .call() is for `reading data` from contract

			setWeb3(web3)
			setAccounts(accounts)
			setWallet(wallet)
			setApprovers(approvers)
			setQuorum(quorum)
			setTransfers(transfers)
		}
		init()
	}, [])

	console.log({web3, accounts, wallet, approvers, quorum})

	if (!web3 || !accounts || !wallet || !approvers || !quorum || !transfers) {
		return <div>Loading...</div>
	}

	const createTransfer = async (transfer: transferT) => {
		try {
			const k = await wallet.methods.createTransfer(transfer.amount, transfer.to).send({from: accounts[0]}) // .send() is for `sending data` to contract
			console.log({k})
		} catch (error: any) {
			console.log('error.name', error.name)
			console.log('error.message', error.message)
		}
	}

	const approveTransfer = async (transferId: number) => {
		try {
			const m = await wallet.methods.approveTransfer(transferId).send({from: accounts[0]}) // .send() is for `sending data` to contract
			console.log({m})
		} catch (error: any) {
			console.log('error.name', error.name)
			console.log('error.message', error.message)
		}
	}

	return (
		<main className={styles.main}>
			Multisig Dapp
			<Header approvers={approvers} quorum={quorum} />
			<NewTransfer createTransfer={createTransfer} />
			<TransferList transfers={transfers} approveTransfer={approveTransfer} />
			<pre>{allAddresses}</pre>
		</main>
	)
}

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
