import React, {useState} from 'react'

export type transferT = {amount?: string; to?: string}

type NewTransferProps = {createTransfer: (transfer: transferT) => Promise<void>}

export default function NewTransfer({createTransfer}: NewTransferProps) {
	const [transfer, setTransfer] = useState<transferT>({})

	const updateTransfer = (e: any, field: string) => {
		const value = e.target.value
		setTransfer({...transfer, [field]: value})
	}

	const submit = (e: any) => {
		e.preventDefault()
		if (!transfer.amount || !transfer.to) return alert('Please make sure you have entered amount and to address.')

		createTransfer(transfer)
	}

	return (
		<div>
			<h2>Create transfer</h2>
			<form action='' onSubmit={submit}>
				<label htmlFor='amount'>Amount</label>
				<input id='amount' type='text' placeholder='amount' onChange={(e) => updateTransfer(e, 'amount')} />
				<input id='to' type='text' placeholder='to (address)' onChange={(e) => updateTransfer(e, 'to')} />
				<button type='submit'>Submit</button>
			</form>
		</div>
	)
}
