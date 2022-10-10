import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {getWeb3, getMsWallet} from '../helpers/utils'
import type {Web3InstanceType} from '../helpers/utils'
import ClientOnly from '../components/ClientOnly'
import {useEffect, useState} from 'react'

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

const Content = () => {
	const [web3, setWeb3] = useState<Web3InstanceType>(undefined)
	const [accounts, setAccounts] = useState<addressType>(undefined)
	const [wallet, setWallet] = useState<any>(undefined)
	const [approvers, setApprovers] = useState(undefined)
	const [quorum, setQuorum] = useState(undefined)

	useEffect(() => {
		async function init() {
			const web3 = getWeb3()
			const accounts = await web3.eth.getAccounts()
			const wallet = await getMsWallet(web3)
			setWeb3(web3)
			setAccounts(accounts)
			setWallet(wallet)

			// contract instance
			const approvers = await wallet.methods.getApprovers().call()
			console.log({approvers})
		}
		init()
	}, [])

	console.log({web3, accounts, wallet})

	if (!web3 || !accounts || !wallet) {
		return <div>Loading...</div>
	}

	return <main className={styles.main}>Multisig Dapp</main>
}

export default Home
