import {createContext, useContext, useEffect, useState, ReactNode, useRef} from 'react'
import produce from 'immer'
import {
	getWeb3,
	getContracts,
	getContractsReturnType,
	utf8ToHex,
	hexToUtf8,
	toDecimal,
	toBN,
	fromWei,
} from '../helpers/utils'
import type {web3Type} from '../helpers/utils'
import Web3 from 'web3'

const SIDE = {
	BUY: 0,
	SELL: 1,
}

const AppDataContext = createContext<any>({loading: true})

type createMarketOrderFnT = (amount: number, side: number) => Promise<boolean>
type createLimitOrderFnT = (amount: number, price: string, side: number) => Promise<boolean>
type depositFnT = (amount: number) => Promise<boolean>
type withdrawFnT = (amount: number) => Promise<boolean>
type faucetFnT = () => Promise<void>

type others = {
	deposit: depositFnT
	withdraw: withdrawFnT
	createMarketOrder: createMarketOrderFnT
	createLimitOrder: createLimitOrderFnT
	faucet: faucetFnT
}

export const useAppData = (): [AppDataType, immerSetter, others] => useContext(AppDataContext)

interface Props {
	children?: ReactNode
	// any props that come into the component
}

export type tokenType = {
	ticker?: string
	tokenAddress?: string
}

type AppDataType = {
	appErrorMessg?: string
	web3?: web3Type
	contracts?: getContractsReturnType
	tokens?: tokenType[] // array of token
	trades?: any[]
	listener?: any // we listen to blockchain and manage above `trades[]` array with this listener
	orders?: {
		buy?: any
		sell?: any
	}
	user?: {
		accounts?: string[]
		selectedToken?: tokenType
		balances?: {
			tokenWallet?: string
			tokenDex?: string
		}
	}
}

type immerCallback = (appData: AppDataType) => void
type immerSetter = (callback: immerCallback) => void

const initialAppData = {
	appErrorMessg: '',
	web3: new Web3(null),
	user: {},
	trades: [],
}

const chainId_chainName: any = {
	'1': 'Ethereum Main Network (Mainnet)',
	'3': 'Ropsten Test Network',
	'4': 'Rinkeby Test Network',
	'5': 'Goerli Test Network',
	'42': 'Kovan Test Network',
	'80001': 'mumbai',
}

export function AppDataProvider({children}: Props) {
	const _state = useState<AppDataType>(initialAppData)
	const [appData, setAppData] = _state
	const setAppDataImmer: immerSetter = (cb) => setAppData((data) => produce(data, cb))
	const appRef = useRef({isErrorReported: false, isNetworkChangeReported: false, isUserChangeReported: false})

	if (typeof window !== 'undefined') {
		Object.assign(window as any, {appData})
	}

	// Destructured for easy access
	const {contracts, user, web3} = appData

	const getBalances = async (account: any, token: tokenType, contracts: any, web3: any) => {
		const tokenDex = await contracts?.dex.methods.traderBalances(account, utf8ToHex(token.ticker!)).call()
		const tokenWallet = await contracts[token.ticker!].methods.balanceOf(account).call()
		return {tokenDex, tokenWallet}
	}

	// Secret button to add funds out of thin air to my ERC20 tokens i.e., DAI, REP, BAT and ZRX.
	const faucet = async () => {
		try {
			const selectedToken = user?.selectedToken
			if (!selectedToken) return alert('no selected token')
			const userAcc = appData.user?.accounts?.[0]
			if (!userAcc) alert('no user account found')

			const amount = '10000'
			console.log('selected token methods', appData?.contracts?.[selectedToken.ticker!].methods)
			// console.log(appData?.contracts?.[selectedToken.ticker!].methods);
			// alert(selectedToken.ticker)
			await appData?.contracts?.[selectedToken.ticker!].methods.faucet(userAcc, amount).send({from: userAcc})
			window.location.href = ''
		} catch (error: any) {
			alert(error.message)
		}
	}

	useEffect(() => {
		async function onPageLoad() {
			try {
				// Detech if metmask is not installed, src: https://ethereum.stackexchange.com/a/122761/106687
				if (typeof window.ethereum === 'undefined') {
					throw new Error('no-metamask')
				}

				// Source: https://ethereum.stackexchange.com/a/42810/106687
				window.ethereum.on('accountsChanged', function (accounts: string[]) {
					alert('User changed to:' + accounts[0])
					window.location.href = '' // refresh whole page (recommended by metamask unless you have a special reason not to).
				})

				window.ethereum.on('chainChanged', (chainId: string) => {
					if (appRef.current.isNetworkChangeReported) return
					// alert(chainId)
					// alert(toDecimal(chainId))
					const chainName = chainId_chainName?.[toDecimal(chainId)]
					alert(chainName ? 'Network Changed to ' + chainName : 'Network with chainId ' + chainId)
					window.location.href = '' // refresh whole page
					appRef.current.isNetworkChangeReported = true
				})

				// alert('yo1')
				const web3 = await getWeb3()
				// alert('yo2')
				const accounts: string[] = await web3?.eth.getAccounts() // This is probabaly all the accounts user have in metamask IMO ~Sahil; // todo: Verify this.
				// alert('yo3')

				const contracts = await getContracts(web3)

				const rawTokens = await contracts?.dex.methods.getTokens().call()
				// For easy debugging
				Object.assign(window, {rawTokens, _web3: web3}) // it seems metamask injects this `web3` in window object by default ~Sahil

				const tokens = rawTokens.map((token: any) => ({...token, ticker: hexToUtf8(token.ticker)}))
				// token[0]: {"ticker": "DAI","tokenAddress": "0x37a0B612Efe75775474071950A3A55944Bcc2D5B"}

				const balances = await getBalances(accounts[0], tokens[0], contracts, web3)
				const selectedToken = tokens[0]
				// const selectedToken = tokens[1] ///// TODO: REMOVE BELOW LATER (for easy debugging in ui)
				listenToTrades(selectedToken, contracts, web3)
				const orders = await getOrders(selectedToken, contracts, web3)
				setAppDataImmer((state) => {
					Object.assign(state, {web3, contracts, tokens, orders, user: {balances, accounts, selectedToken}})
				})

				// * FOR REFERENCE FOR CALLING CONTRACT FUNCTIONS
				// const val = await wallet.methods.createTransfer(transfer.amount, transfer.to).send({from: accounts[0]}) // .send() is for `sending data` to contract
				// const approvers = await wallet.methods.getApprovers().call()
			} catch (error: any) {
				if (appRef.current.isErrorReported) return // report to user for only once

				// alert(error.name) // Error
				const errorMessage1 =
					"Returned values aren't valid, did it run Out of Gas? You might also see this error if you are not using the correct ABI for the contract you are retrieving data from, requesting data from a block number that does not exist, or querying a node which is not fully synced."
				const errMessage2 = 'JsonRpcEngine: Response has no error or result for request'
				const errorMessage3 = 'no-metamask'
				if (error.message === errorMessage1 || error.message.startsWith(errMessage2)) {
					const eMessg1 = `Probably:
					1. You need to select goerli network in your metamask wallet.
					2. You are using wrong contract abi.`

					// alert(eMessg1)
					setAppDataImmer((appData) => {
						appData.appErrorMessg = eMessg1
					})
				} else if (error.message === errorMessage3) {
					const eMessg2 = 'Please install metamask for your browser  '
					setAppDataImmer((appData) => {
						appData.appErrorMessg = eMessg2
					})
				} else {
					const eMessg2 = `Unhandled Exception
					Kindly send me a screenshot of  this page to me: sahilrajput03@gmail.com
					Thanks in advance.`

					// alert(eMessg2)
					// alert(error.message)
					console.log(error.message)

					setAppDataImmer((appData) => {
						appData.appErrorMessg = eMessg2
					})
				}

				appRef.current.isErrorReported = true
			}
		}
		onPageLoad()
		// eslint-disable-next-line react-hooks/exhaustive-deps

		return () => {
			if (!appData.listener) return console.log('~Sahil: appData listener not found.')

			appData.listener.unsubscribe()
			console.log('~Sahil: unsubscribed listener (onComponentMount sideEffect cleanup)')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		// Reload balances and orders
		const init = async () => {
			if (!user?.selectedToken) return

			const selectedToken = user?.selectedToken
			listenToTrades(selectedToken, contracts, web3)
			const balances = await getBalances(user.accounts?.[0], selectedToken, contracts, web3)
			const orders = await getOrders(selectedToken, contracts, web3)
			setAppDataImmer((appData) => {
				if (!appData.user) return

				// Object.assign(state, {web3, contracts, tokens, orders, user: {balances, accounts, selectedToken}})
				Object.assign(appData.user, {balances})
				Object.assign(appData, {orders})
			})
		}

		// Run only if user has selectedToken already (so don't run on page load).
		if (typeof user?.selectedToken !== 'undefined') {
			init()
		}

		return () => {
			if (!appData.listener) return console.log('~Sahil: appData listener not found.')

			appData.listener.unsubscribe()
			console.log('unsubscribed listener (selectedToken sideEffect cleanup)')
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.selectedToken])

	/**Deposit Function */ /** //TODO: TEST IF YOU CAN MOVE THESE FUNCTIONS DEFINITION BELOW THE RETURN STATEMENT AND TEST THAT. AND ALSO MOVE ALL THE FUNCITONS (like: withdraw, createMarketOrder, createLimitOrder) THERE FOR GOOD CODE READABILITY.  */
	const deposit: depositFnT = async (amount) => {
		if (!user?.selectedToken?.ticker) {
			console.log('user/selectedToken/ticker is undefined')
			return false
		}

		await contracts?.[user.selectedToken.ticker].methods
			.approve(contracts?.dex.options.address, amount)
			.send({from: user.accounts?.[0]})
		const tikerNameHexBytes32 = utf8ToHex(user.selectedToken.ticker)
		// TODO: check the computed value here
		console.log('tikerNameHexBytes32', tikerNameHexBytes32)
		await contracts?.dex.methods.deposit(amount, tikerNameHexBytes32).send({from: user.accounts?.[0]})
		const balances = await getBalances(user.accounts?.[0], user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			if (!appData.user) return console.log('user property is undefined..')
			appData.user.balances = balances
		})
		return true
	}
	/**Withdraw Function */
	const withdraw: withdrawFnT = async (amount: number) => {
		if (!user?.selectedToken?.ticker) {
			console.log('user/selectedToken/ticker is undefined')
			return false
		}

		await contracts?.dex.methods
			.withdraw(amount, utf8ToHex(user.selectedToken.ticker))
			.send({from: user?.accounts?.[0]})
		const balances = await getBalances(user.accounts?.[0], user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			if (!appData.user) return console.log('user property is undefined..')
			appData.user.balances = balances
		})

		return true
	}
	const getOrders = async (token: tokenType, contracts: any, web3: any) => {
		const [buy, sell] = await Promise.all([
			contracts?.dex.methods.getOrders(utf8ToHex(token.ticker!), SIDE.BUY).call(),
			contracts?.dex.methods.getOrders(utf8ToHex(token.ticker!), SIDE.SELL).call(),
		])
		return {buy, sell}
	}

	const createMarketOrder: createMarketOrderFnT = async (amount, side) => {
		if (!user?.selectedToken?.ticker) {
			console.log('user/selectedToken/ticker not found!')
			return false
		}

		await contracts?.dex.methods
			.createMarketOrder(utf8ToHex(user.selectedToken.ticker), amount, side)
			.send({from: user.accounts?.[0]})
		const orders = await getOrders(user.selectedToken, contracts, web3)

		const balances = await getBalances(user.accounts?.[0], user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			Object.assign(appData, {orders})
			Object.assign(appData.user as any, {balances})
		})
		return true
	}

	const createLimitOrder: createLimitOrderFnT = async (amount, price, side) => {
		if (!user?.selectedToken?.ticker) {
			console.log('user/selectedToken/ticker not found!')
			return false
		}

		await contracts?.dex.methods
			.createLimitOrder(utf8ToHex(user.selectedToken.ticker), amount, price, side)
			.send({from: user.accounts?.[0]})
		const orders = await getOrders(user.selectedToken, contracts, web3)
		const balances = await getBalances(user.accounts?.[0], user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			Object.assign(appData, {orders, balances})
			Object.assign(appData.user as any, {balances})
		})
		return true
	}

	// SIGNATURE OF NEWTRADE EVENT
	// event NewTrade( uint tradeId, uint orderId, bytes32 indexed ticker, address indexed trader1, address indexed trader2, uint amount, // AMOUNT IS THE NUMBER OF TOKENS REQUESTED FOR THE TRADE ~Sahil uint price, uint date);

	const listenToTrades = (token: tokenType, contracts: any, web3: any) => {
		const tradeIds = new Set()
		// Reset trades coz we don't want to accumulate trades of differet tokens to be same array i.e, on change of selectedToken we set empty the trades array.
		// setTrades([])// TODO: Remove
		setAppDataImmer((appData) => {
			if (!appData.trades) return console.log('~Sahil: setAppDataImmer() :: appData.trades is undefined.')

			appData.trades.splice(0) // delete all items from the array
		})

		// connection to blockchain
		const listener = contracts?.dex.events
			.NewTrade({
				filter: {ticker: utf8ToHex(token.ticker!)},
				fromBlock: 0, // in production we can use block of the deployment of the smart contract to listen from that smart contract.
			})
			.on('data', (newTrade: any) => {
				// To prevent duplicates i.e.,trade by using`tradeId` as identifier
				if (tradeIds.has(newTrade.returnValues.tradeId)) {
					return console.log('~Sahil: Prevented adding duplicate trade.')
				}
				tradeIds.add(newTrade.returnValues.tradeId)
				setAppDataImmer((appData) => {
					if (typeof appData.trades === 'undefined') return console.log('Trades undefined')

					appData.trades.push(newTrade.returnValues)
				})
			})
		setAppDataImmer((appData) => {
			Object.assign(appData, {listener})
		})
	}

	/**Packing Functions Together for passing in third item for access via `useAppData()` */
	const others = {deposit, withdraw, createMarketOrder, createLimitOrder, faucet}

	// NOTE: you *might* need to memoize this value
	// Learn more in http://kcd.im/optimize-context
	return <AppDataContext.Provider value={[appData, setAppDataImmer, others]}> {children} </AppDataContext.Provider>
}
