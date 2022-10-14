import {createContext, useContext, useEffect, useState, ReactNode} from 'react'
import produce from 'immer'
import {getWeb3, getContracts} from '../helpers/utils'

const AppDataContext = createContext<any>({loading: true})

export const useAppData = (): [AppDataType, immerSetter] => useContext(AppDataContext)

interface Props {
	children?: ReactNode
	// any props that come into the component
}
type AppDataType = {
	web3?: any
	contracts?: any
	tokens?: any // array of token
	user?: {
		accounts?: any
		selectedToken?: any
	}
}

type immerCallback = (appData: AppDataType) => void
type immerSetter = (callback: immerCallback) => void

const initialAppData = {
	user: {
		selectedToken: null,
	},
}

export function AppDataProvider({children}: Props) {
	const _state = useState<AppDataType>(initialAppData)
	const [appData, setAppData] = _state
	const setAppDataImmer: immerSetter = (cb) => setAppData((data) => produce(data, cb))

	useEffect(() => {
		async function onPageLoad() {
			const web3: any = await getWeb3()
			const accounts = await web3.eth.getAccounts()
			const contracts = await getContracts(web3)

			const rawTokens = await contracts.dex.methods.getTokens().call()
			Object.assign(window, {rawTokens})

			const tokens = rawTokens.map((token: any) => ({...token, ticker: web3.utils.hexToUtf8(token.ticker)})) // bytes32 => ascii (readable format)
			// token[0]: {"ticker": "DAI","tokenAddress": "0x37a0B612Efe75775474071950A3A55944Bcc2D5B"}

			setAppDataImmer((state) => {
				Object.assign(state, {web3, contracts, tokens, user: {accounts, selectedToken: tokens[0]}})
			})
			// TODO: to be cleaned
			// setWeb3(web3)
			// setAccounts(accounts)
			// setContracts(contracts)

			// * FOR REFERENCE
			// const val = await wallet.methods.createTransfer(transfer.amount, transfer.to).send({from: accounts[0]}) // .send() is for `sending data` to contract
			// const approvers = await wallet.methods.getApprovers().call()
		}
		onPageLoad()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// NOTE: you *might* need to memoize this value
	// Learn more in http://kcd.im/optimize-context
	return <AppDataContext.Provider value={[appData, setAppDataImmer]}> {children} </AppDataContext.Provider>
}
