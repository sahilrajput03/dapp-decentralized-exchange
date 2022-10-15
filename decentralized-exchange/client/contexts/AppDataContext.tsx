import {createContext, useContext, useEffect, useState, ReactNode} from 'react'
import produce from 'immer'
import {getWeb3, getContracts} from '../helpers/utils'

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
	web3?: any
	contracts?: any
	tokens?: tokenType[] // array of token
	orders?: {
		buy?: any
		sell?: any
	}
	user?: {
		accounts?: any
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
	user: {},
}

// LEARN: web3.utils.hextToUtf8()	=> hex (bytes32) => utf8 (ascii) (readable format)
// LEARN: web3.utils.fromAscii() 	=> utf8 (ascii)  => hex (bytes32)  (readable format)

export function AppDataProvider({children}: Props) {
	const _state = useState<AppDataType>(initialAppData)
	const [appData, setAppData] = _state
	const setAppDataImmer: immerSetter = (cb) => setAppData((data) => produce(data, cb))

	// Destructured for easy access
	const {contracts, user, web3} = appData

	const getBalances = async (account: any, token: tokenType, contracts: any, web3: any) => {
		const tokenDex = await contracts.dex.methods.traderBalances(account, web3.utils.fromAscii(token.ticker)).call()
		const tokenWallet = await contracts[token.ticker!].methods.balanceOf(account).call()
		return {tokenDex, tokenWallet}
	}

	useEffect(() => {
		async function onPageLoad() {
			const web3: any = await getWeb3()
			const accounts = await web3.eth.getAccounts()
			const contracts = await getContracts(web3)

			const rawTokens = await contracts.dex.methods.getTokens().call()
			// For easy debugging
			Object.assign(window, {rawTokens, _web3: web3}) // it seems metamask injects this `web3` in window object by default ~Sahil

			const tokens = rawTokens.map((token: any) => ({...token, ticker: web3.utils.hexToUtf8(token.ticker)}))
			// token[0]: {"ticker": "DAI","tokenAddress": "0x37a0B612Efe75775474071950A3A55944Bcc2D5B"}

			const balances = await getBalances(accounts[0], tokens[0], contracts, web3)
			const selectedToken = tokens[0]
			// const selectedToken = tokens[1] ///// TODO: REMOVE BELOW LATER (for easy debugging in ui)
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
	}, [])

	useEffect(() => {
		// Reload balances and orders
		const init = async () => {
			if (!user?.selectedToken) return

			const selectedToken = user?.selectedToken
			const balances = await getBalances(user.accounts[0], selectedToken, contracts, web3)
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

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.selectedToken])

	/**Deposit Function */ /** //TODO: TEST IF YOU CAN MOVE THESE FUNCTIONS DEFINITION BELOW THE RETURN STATEMENT AND TEST THAT. AND ALSO MOVE ALL THE FUNCITONS (like: withdraw, createMarketOrder, createLimitOrder) THERE FOR GOOD CODE READABILITY.  */
	const deposit: depositFnT = async (amount) => {
		if (!user?.selectedToken?.ticker) {
			alert('user/selectedToken/ticker is undefined')
			return false
		}

		await contracts[user.selectedToken.ticker].methods
			.approve(contracts.dex.options.address, amount)
			.send({from: user.accounts[0]})
		const tikerNameHexBytes32 = web3.utils.fromAscii(user.selectedToken.ticker)
		// TODO: check the computed value here
		console.log('tikerNameHexBytes32', tikerNameHexBytes32)
		await contracts.dex.methods.deposit(amount, tikerNameHexBytes32).send({from: user.accounts[0]})
		const balances = await getBalances(user.accounts[0], user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			if (!appData.user) return alert('user property is undefined..')
			appData.user.balances = balances
		})
		return true
	}
	/**Withdraw Function */
	const withdraw: withdrawFnT = async (amount: number) => {
		if (!user?.selectedToken?.ticker) {
			alert('user/selectedToken/ticker is undefined')
			return false
		}

		await contracts.dex.methods
			.withdraw(amount, web3.utils.fromAscii(user.selectedToken.ticker))
			.send({from: user.accounts[0]})
		const balances = await getBalances(user.accounts[0], user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			if (!appData.user) return alert('user property is undefined..')
			appData.user.balances = balances
		})

		return true
	}
	const getOrders = async (token: tokenType, contracts: any, web3: any) => {
		const [buy, sell] = await Promise.all([
			contracts.dex.methods.getOrders(web3.utils.fromAscii(token.ticker), SIDE.BUY).call(),
			contracts.dex.methods.getOrders(web3.utils.fromAscii(token.ticker), SIDE.SELL).call(),
		])
		return {buy, sell}
	}

	const createMarketOrder: createMarketOrderFnT = async (amount, side) => {
		if (!user?.selectedToken?.ticker) {
			alert('user/selectedToken/ticker not found!')
			return false
		}

		await contracts.dex.methods
			.createMarketOrder(web3.utils.fromAscii(user.selectedToken.ticker), amount, side)
			.send({from: user.accounts[0]})
		const orders = await getOrders(user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			Object.assign(appData, {orders})
		})
		return true
	}

	const createLimitOrder: createLimitOrderFnT = async (amount, price, side) => {
		if (!user?.selectedToken?.ticker) {
			alert('user/selectedToken/ticker not found!')
			return false
		}

		await contracts.dex.methods
			.createLimitOrder(web3.utils.fromAscii(user.selectedToken.ticker), amount, price, side)
			.send({from: user.accounts[0]})
		const orders = await getOrders(user.selectedToken, contracts, web3)
		setAppDataImmer((appData) => {
			Object.assign(appData, {orders})
		})
		return true
	}
	/**Packing Functions Together for passing in third item for access via `useAppData()` */
	const others = {deposit, withdraw, createMarketOrder, createLimitOrder}

	// NOTE: you *might* need to memoize this value
	// Learn more in http://kcd.im/optimize-context
	return <AppDataContext.Provider value={[appData, setAppDataImmer, others]}> {children} </AppDataContext.Provider>
}
