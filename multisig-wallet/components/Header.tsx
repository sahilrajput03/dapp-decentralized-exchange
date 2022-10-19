import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {commify, hexToUtf8, toDecimal} from '../helpers/utils'
import {network, walletAddress} from '../config'

type HeaderT = {
	approvers: string[]
	quorum: number
	currentAccountAddress: string
	balancesMap: {
		[key: string]: string
	}
}

export default function Header({approvers, quorum, currentAccountAddress, balancesMap}: HeaderT) {
	const [showAmounts, setShowAmounts] = useState(false)

	return (
		<AddressAndQuorum className='mx-auto'>
			<div className='fw-bold text-decoration-underline'>Quorum: {quorum}</div>
			<span className='fw-bold text-decoration-underline'>Approvers:</span>

			<ul className='list-group'>
				{approvers?.map((approver, idx) => {
					const isMyAcc = currentAccountAddress === approver
					return (
						<li className='list-group-item border-primary text-primary text-end' key={idx}>
							{approver} {isMyAcc && <span className='bg-primary text-white rounded-5 px-3 py-1'>My Account</span>}
							{showAmounts && (
								<Amount className={`text-white rounded-5 px-2 py-1 ms-auto mt-1 ${isMyAcc ? 'bg-primary' : 'bg-secondary'}`}>
									{commify(balancesMap[approver]) + ' WEI'}
								</Amount>
							)}
						</li>
					)
				})}
			</ul>
			<ShowAccountBalances className='btn btn-primary mt-4 rounded-5' onClick={() => setShowAmounts(!showAmounts)}>
				{showAmounts ? 'Hide' : 'Show'} Account Balances
			</ShowAccountBalances>
		</AddressAndQuorum>
	)
}

const ShowAccountBalances = styled.div`
	width: min-content;
	white-space: nowrap;
`

const Amount = styled.div`
	width: min-content;
	white-space: nowrap;
`

const AddressAndQuorum = styled.div`
	text-align: center;
`
