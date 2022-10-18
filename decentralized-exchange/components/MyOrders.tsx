import {useAppData} from 'contexts'
import {userAgent} from 'next/server'
import React from 'react'
import Moment from 'react-moment'

const MyOrders = () => {
	const [appData, setAppDataImmer] = useAppData()
	const {orders, user} = appData

	if (!orders || !user) return null

	const myBuyOrders = orders.buy.filter((o: any) => o.trader.toLowerCase() === user?.accounts?.[0].toLowerCase())
	const mySellOrders = orders.sell.filter((o: any) => o.trader.toLowerCase() === user?.accounts?.[0].toLowerCase())

	const renderList = (orders: any[], side: string, className: string) => {
		return (
			<>
				<table className={`table table-striped mb-0 order-list ${className}`}>
					<thead>
						<tr className='table-title order-list-title'>
							<th colSpan={3}>{side}</th>
						</tr>
						<tr>
							<th>amount/filled</th>
							<th>price</th>
							<th>date</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id}>
								<td>
									{order.amount}/{order.filled}
								</td>
								<td>{order.price}</td>
								<td>
									<Moment fromNow>{parseInt(order.date) * 1000}</Moment>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		)
	}

	return (
		<div id='order-list' className='card px-4 pt-3 pb-5 mt-3'>
			<h2 className='card-title'>My orders</h2>
			<div className='row'>
				<div className='col-sm-6'>{renderList(myBuyOrders, 'Buy', 'order-list-buy')}</div>
				<div className='col-sm-6'>{renderList(mySellOrders, 'Sell', 'order-list-sell')}</div>
			</div>
		</div>
	)
}

export default MyOrders
