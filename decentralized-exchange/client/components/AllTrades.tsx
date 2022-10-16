import {useAppData} from 'contexts'
import produce from 'immer'
import React from 'react'
import Moment from 'react-moment'
import {ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis} from 'recharts'

const AllTrades = () => {
	const [appData, setAppDataImmer] = useAppData()

	const trades = appData?.trades ?? []

	console.log('trades?', trades)

	const renderList = (trades: any[], className: string) => {
		const latestTradesFirst = produce(trades, (trades) => {
			trades.sort((a, b) => b.date - a.date)
		})

		return (
			<>
				<table className={`table table-striped trade-list mb-0 ${className}`}>
					<thead>
						<tr>
							<th>amount</th>
							<th>price</th>
							<th>date</th>
						</tr>
					</thead>
					<tbody>
						{latestTradesFirst.map((trade) => (
							<tr key={trade.tradeId}>
								<td>{trade.amount}</td>
								<td>{trade.price}</td>
								<td>
									<Moment fromNow>{parseInt(trade.date) * 1000}</Moment>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		)
	}

	const renderChart = (trades: any) => {
		return (
			<ResponsiveContainer width='100%' height={200}>
				<LineChart data={trades}>
					<Line type='monotone' dataKey='price' stroke='#741cd7' />
					<CartesianGrid stroke='#000000' />
					<XAxis
						dataKey='date'
						tickFormatter={(dateStr) => {
							const date = new Date(parseInt(dateStr) * 1000)
							return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
						}}
					/>
					<YAxis dataKey='price' />
				</LineChart>
			</ResponsiveContainer>
		)
	}

	return (
		<div className='card px-4 pt-3 pb-5'>
			<h2 className='card-title'>All trades</h2>
			<div className='row'>
				<div className='col-sm-12'>
					{renderChart(trades)}
					{renderList(trades, 'trade-list')}
				</div>
			</div>
		</div>
	)
}

export default AllTrades
