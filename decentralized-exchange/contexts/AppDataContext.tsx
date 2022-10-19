import {createContext, useContext, useEffect, useState, ReactNode} from 'react'
import produce from 'immer'
import {getWeb3, getContracts, getContractsReturnType} from '../helpers/utils'
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

type others = {
	deposit: depositFnT
	withdraw: withdrawFnT
	createMarketOrder: createMarketOrderFnT
	createLimitOrder: createLimitOrderFnT
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
	web3: new Web3(null),
	user: {},
	trades: [],
}

// LEARN: hextToUtf8() :: hex/bytes32 => utf8/ascii (readable format) // you can use toAscii() or toUtf8() for this as well. Src: https://ethereum.stackexchange.com/a/8871/106687
// LEARN: fromAscii()  :: utf8/ascii  => hex/bytes32  (readable format)

export const utf8ToHex = Web3.utils.fromAscii
export const hexToUtf8 = Web3.utils.hexToUtf8

export function AppDataProvider({children}: Props) {
	const _state = useState<AppDataType>(initialAppData)
	const [appData, setAppData] = _state
	const setAppDataImmer: immerSetter = (cb) => setAppData((data) => produce(data, cb))

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

	useEffect(() => {
		async function onPageLoad() {
			// Source: https://ethereum.stackexchange.com/a/42810/106687
			window.ethereum.on('accountsChanged', function (accounts: string[]) {
				setAppDataImmer((appData) => {
					Object.assign(appData.user as any, {accounts})
				})
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
	const others = {deposit, withdraw, createMarketOrder, createLimitOrder}

	// NOTE: you *might* need to memoize this value
	// Learn more in http://kcd.im/optimize-context
	return <AppDataContext.Provider value={[appData, setAppDataImmer, others]}> {children} </AppDataContext.Provider>
}
