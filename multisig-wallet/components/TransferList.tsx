import React from 'react'

type TransferListT = {
	transfers: any
	approveTransfer: any
}

export default function TransferList({transfers, approveTransfer}: TransferListT) {
	return (
		<div>
			<h2>Transfer List</h2>
			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Amount</th>
						<th>To</th>
						<th>Approvals</th>
						<th>Sent</th>
					</tr>
				</thead>
				<tbody>
					{transfers.map((transfer: any) => (
						<tr key={transfer.id}>
							<td>{transfer.id}</td>
							<td>{transfer.amount}</td>
							<td>{transfer.to}</td>
							<td>{transfer.approvals}</td>
							<td>{transfer.sent ? 'yes' : 'no'}</td>

							<td>
								<button onClick={() => approveTransfer(transfer.id)}>Approve</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
