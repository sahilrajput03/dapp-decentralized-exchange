import React from 'react'

type TransferListT = {
	transfers: any
	approveTransfer: any
}

const quorum = 2

export default function TransferList({transfers, approveTransfer}: TransferListT) {
	return (
		<div>
			<h2 className='mt-5'>Transfer List</h2>
			<table className='table'>
				<thead>
					<tr>
						<th>Id</th>
						<th>Amount</th>
						<th>To</th>
						<th>Approvals</th>
						<th>Sent</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{transfers.map((transfer: any) => {
						return (
							<>
								<tr key={transfer.id}>
									<td>{transfer.id}</td>
									<td>{transfer.amount}</td>
									<td>{transfer.to}</td>
									<td>{transfer.approvals}</td>
									<td>{transfer.sent ? 'yes' : 'no'}</td>

									<td>
										<button
											disabled={transfer.sent}
											className={`btn btn-primary ${transfer.sent ? 'disabled' : ''}`}
											onClick={() => approveTransfer(transfer.id)}
										>
											Approve
										</button>
									</td>
								</tr>
							</>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
