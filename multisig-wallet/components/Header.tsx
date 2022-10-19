import React, {useEffect} from 'react'
import styled from 'styled-components'
import {hexToUtf8, toDecimal} from '../helpers/utils'
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
	return (
		<AddressAndQuorum className='mx-auto'>
			<div className='fw-bold text-decoration-underline'>Quorum: {quorum}</div>
			<span className='fw-bold text-decoration-underline'>Approvers:</span>

			<ul className='list-group'>
				{approvers?.map((approver, idx) => (
					<li className='list-group-item border-primary text-primary text-end d-flex justify-content-end' key={idx}>
						{currentAccountAddress === approver && (
							<div className='bg-primary text-white rounded-5 px-3 py-1 me-2 fw-bold'>My Account</div>
						)}
						{approver}
						<div className='bg-primary text-white rounded-5 px-3 py-1 ms-2'>{[balancesMap[approver] + ' ETH']}</div>
					</li>
				))}
			</ul>
		</AddressAndQuorum>
	)
}

const AddressAndQuorum = styled.div`
	text-align: center;
`
