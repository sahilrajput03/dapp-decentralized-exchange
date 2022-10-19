import React, {useState} from 'react'
import styled from 'styled-components'
import {toWei} from '../helpers/utils'

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

		// createTransfer({...transfer, amount: toWei(transfer.amount)})
		createTransfer(transfer)
	}

	return (
		<NewTransferDiv className='mx-auto p-2 mt-5'>
			<h2>Create transfer</h2>
			<form action='' onSubmit={submit}>
				<div className='input-group mb-3'>
					<input
						className='form-control form-control-inline'
						id='amount'
						type='text'
						placeholder='Enter amount here'
						onChange={(e) => updateTransfer(e, 'amount')}
					/>
					<span className='input-group-text bg-primary text-white'>WEI</span>
				</div>
				<input
					className='form-control form-control-inline mb-3'
					id='to'
					type='text'
					placeholder='Enter recepient address'
					onChange={(e) => updateTransfer(e, 'to')}
				/>
				<button className='btn btn-primary w-100' type='submit'>
					Submit
				</button>
			</form>
		</NewTransferDiv>
	)
}

// width: min-content;
const NewTransferDiv = styled.div`
	width: 100%;
	max-width: 500px;
`
