import {useAppData} from 'contexts'
import React from 'react'
import Moment from 'react-moment'

const AllOrders = () => {
	const [appData, setAppDataImmer] = useAppData()
	const {orders} = appData

	if (!orders) return null

	const renderList = (orders: any, side: string, className: string) => {
		return (
			<>
				<table className={`table table-striped mb-0 order-list ${className}`}>
					<thead>
						<tr className='table-title order-list-title'>
							<th colSpan={3}>{side}</th>
						</tr>
						<tr>
							<th>amount</th>
							<th>price</th>
							<th>date</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order: any) => (
							<tr key={order.id}>
								<td>{order.amount - order.filled}</td>
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
		<div className='card px-4 pt-3 pb-5 mt-3'>
			<h2 className='card-title fw-bold border-primary border-bottom border-5'>All orders</h2>
			<div className='row'>
				<div className='col-sm-6'>{renderList(orders.buy, 'Buy', 'order-list-buy')}</div>
				<div className='col-sm-6'>{renderList(orders.sell, 'Sell', 'order-list-sell')}</div>
			</div>
		</div>
	)
}

export default AllOrders
