import React, {useState} from 'react'
import {tokenType, useAppData} from '../contexts'

// withdraw: from smart contract to metamask
// deposit: from metamask to smart contract

const DIRECTION = {
	WITHDRAW: 'WITHDRAW',
	DEPOSIT: 'DEPOSIT',
}

const Walllet = () => {
	const [direction, setDirection] = useState(DIRECTION.DEPOSIT)
	const [amount, setAmount] = useState('')
	const [appData, setAppDataImmer, {deposit, withdraw, faucet}] = useAppData()

	const onSubmit = async (e: any) => {
		let status

		e.preventDefault()
		if (direction === DIRECTION.DEPOSIT) {
			status = await deposit(Number(amount))
			alert('Deposit successful.')
			setAmount('')
		} else {
			status = await withdraw(Number(amount))
			alert('Withdraw successful.')
			setAmount('')
		}

		if (!status) {
			console.error('Some error occured in deposit/withdraw funciton ~Sahil')
		}
	}

	return (
		<div id='wallet' className='card px-4 pt-3 pb-5 mt-3'>
			<h2 className='card-title fw-bold border-primary border-bottom border-5'>Wallet</h2>
			{/* <h3>Token balance for {appData?.user?.selectedToken?.ticker}</h3> */}
			<h3>Token balances</h3>
			<div className='form-group row'>
				<label htmlFor='wallet' className='col-sm-4 col-form-label'>
					Wallet {'(' + appData?.user?.selectedToken?.ticker + ' Tokens)'}
				</label>
				<div className='col-sm-8'>
					<input className='form-control' id='wallet' disabled value={appData?.user?.balances?.tokenWallet} />
				</div>
			</div>
			<div className='form-group row mt-3'>
				<label htmlFor='contract' className='col-sm-4 col-form-label'>
					Dex Tokens
				</label>
				<div className='col-sm-8'>
					<input className='form-control' id='wallet' disabled value={appData?.user?.balances?.tokenDex} />
				</div>
			</div>
			<h3 className='mt-3'>Transfer {appData?.user?.selectedToken?.ticker}</h3>
			<form id='transfer' onSubmit={(e) => onSubmit(e)}>
				<div className='form-group row'>
					<label htmlFor='direction' className='col-sm-4 col-form-label'>
						Direction
					</label>
					<div className='col-sm-8'>
						<div id='direction' className='btn-group' role='group'>
							<button
								type='button'
								className={`btn btn-secondary ${direction === DIRECTION.DEPOSIT ? 'active' : ''}`}
								onClick={() => setDirection(DIRECTION.DEPOSIT)}
							>
								Deposit
							</button>
							<button
								type='button'
								className={`btn btn-secondary ${direction === DIRECTION.WITHDRAW ? 'active' : ''}`}
								onClick={() => setDirection(DIRECTION.WITHDRAW)}
							>
								Withdraw
							</button>
						</div>
					</div>
				</div>
				<div className='form-group row mt-3'>
					<label htmlFor='amount' className='col-sm-4 col-form-label'>
						Amount
					</label>
					<div className='col-sm-8'>
						<div className='input-group mb-3'>
							<input
								id='amount'
								type='text'
								className='form-control hide__arrows'
								placeholder='Please enter token amount'
								onChange={(e) => {
									let v = e.target.value
									const isNotNumber = isNaN(Number(v))

									if (isNotNumber) return alert('Please use numeric input for amount.')

									return setAmount(v)
								}}
								value={amount}
							/>
							<div className='input-group-append'>
								<span className='input-group-text'>
									{direction === DIRECTION.DEPOSIT ? appData?.user?.selectedToken?.ticker : 'DEX'}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className='text-right'>
					<button type='submit' className='btn btn-primary'>
						{`Transfer  ${
							direction === DIRECTION.DEPOSIT
								? `${appData?.user?.selectedToken?.ticker} → DEX`
								: `DEX → ${appData?.user?.selectedToken?.ticker}`
						}`}
					</button>
				</div>
			</form>
			<footer onClick={faucet} className="blockquote-footer text-end" style={{cursor: 'pointer'}}>Faucet: Click here to add 10,000 tokens to your {appData?.user?.selectedToken?.ticker} wallet.</footer>
		</div>
	)
}

export default Walllet
