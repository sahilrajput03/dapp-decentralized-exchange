import {BN} from 'bn.js'
import React from 'react'

type TransferListT = {
	transfers: any
	approveTransfer: any
	walletBalance: string
}

const disabledMessage = 'Too High'

export default function TransferList({transfers, approveTransfer, walletBalance}: TransferListT) {
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
						let buttonMessg = 'Approve'

						if (transfer.sent) {
							buttonMessg = 'Success'
						} else {
							if (new BN(transfer.amount).gt(new BN(walletBalance))) buttonMessg = disabledMessage
						}
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
											disabled={transfer.sent || buttonMessg === disabledMessage}
											className={`btn ${buttonMessg === disabledMessage ? 'btn-secondary' : 'btn-primary'} ${
												transfer.sent ? 'disabled' : ''
											}`}
											onClick={() => approveTransfer(transfer.id)}
										>
											{buttonMessg}
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
