import {useAppData} from 'contexts'
import React, {useState} from 'react'

const ORDER_TYPE = {
	LIMIT: 'LIMIT',
	MARKET: 'MARKET',
}

const SIDE = {
	BUY: 0,
	SELL: 1,
}

type OrderType = {
	type?: string
	side?: number
	amount?: string
	price?: string
}

const initialOrderState = {
	type: ORDER_TYPE.LIMIT,
	side: SIDE.BUY,
	amount: '',
	price: '',
}

const NewOrder = () => {
	const [appData, setAppDataImmer, {createMarketOrder, createLimitOrder}] = useAppData()
	const [order, setOrder] = useState<OrderType>(initialOrderState)
	const onSubmit = async (e: any) => {
		e.preventDefault()
		if (!order.amount) return alert('Please enter the amount.')
		if (typeof order.side === 'undefined') return alert('Please choose the transction type i.e., BUY or SELL.')

		let isSuccessful
		if (order.type === ORDER_TYPE.MARKET) {
			isSuccessful = await createMarketOrder(Number(order.amount), order.side)
			if (isSuccessful) alert('Market Order successful.')
		} else {
			if (!order.price) return alert('Please enter the price for the trade.')

			isSuccessful = await createLimitOrder(Number(order.amount), order.price, order.side)
			if (isSuccessful) alert('Limit Order successful.')
		}

		// Reset new order form state if order successful
		if (isSuccessful) setOrder(initialOrderState)
	}

	return (
		<div id='orders' className='card px-4 pt-3 pb-5 mt-3'>
			<h2 className='card-title'>New Order</h2>
			<form onSubmit={onSubmit}>
				{/* ORDER_TYPE{LIMIT/MARKET} INPUT */}
				<div className='form-group row'>
					<label htmlFor='type' className='col-sm-4 col-form-label'>
						Type
					</label>
					<div className='col-sm-8'>
						<div id='type' className='btn-group' role='group'>
							<button
								type='button'
								className={`btn btn-secondary ${order.type === ORDER_TYPE.LIMIT ? 'active' : ''}`}
								onClick={() => setOrder((order) => ({...order, type: ORDER_TYPE.LIMIT}))}
							>
								Limit
							</button>
							<button
								type='button'
								className={`btn btn-secondary ${order.type === ORDER_TYPE.MARKET ? 'active' : ''}`}
								onClick={() => setOrder((order) => ({...order, type: ORDER_TYPE.MARKET}))}
							>
								Market
							</button>
						</div>
					</div>
				</div>

				{/* SIDE{BUY/SELL} INPUT */}
				<div className='form-group row mt-3'>
					<label htmlFor='side' className='col-sm-4 col-form-label'>
						Side
					</label>
					<div className='col-sm-8'>
						<div id='side' className='btn-group' role='group'>
							<button
								type='button'
								className={`btn btn-secondary ${order.side === SIDE.BUY ? 'active' : ''}`}
								onClick={() => setOrder((order) => ({...order, side: SIDE.BUY}))}
							>
								Buy
							</button>
							<button
								type='button'
								className={`btn btn-secondary ${order.side === SIDE.SELL ? 'active' : ''}`}
								onClick={() => setOrder((order) => ({...order, side: SIDE.SELL}))}
							>
								Sell
							</button>
						</div>
					</div>
				</div>

				{/* Amount INPUT */}
				<div className='form-group row mt-3'>
					<label className='col-sm-4 col-form-label' htmlFor='order-amount'>
						Amount
					</label>
					<div className='col-sm-8'>
						<input
							type='text'
							className='form-control'
							id='order-amount'
							placeholder='Please enter token amount'
							value={order.amount}
							onChange={({target: {value}}) => setOrder((order) => ({...order, amount: value}))}
						/>
					</div>
				</div>

				{/* Price INPUT (Show only for LIMIT order) */}
				{order.type === ORDER_TYPE.MARKET ? null : (
					<div className='form-group row mt-3'>
						<label className='col-sm-4 col-form-label' htmlFor='order-amount'>
							Price
						</label>
						<div className='col-sm-8'>
							<input
								type='text'
								className='form-control'
								id='order-price'
								placeholder='Please enter price for the trade For e.g. 8'
								value={order.price}
								onChange={({target: {value}}) => setOrder((order) => ({...order, price: value}))}
							/>
						</div>
					</div>
				)}
				<div className='text-right mt-3'>
					<button type='submit' className='btn btn-primary'>
						{/* {Submit} */}
						{order.side === 0 ? 'Buy DEX' : 'Sell DEX'}
					</button>
				</div>
				{/* <pre>{JSON.stringify(order, null, 2)}</pre> */}
			</form>
		</div>
	)
}

export default NewOrder
