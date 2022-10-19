import React, {useEffect} from 'react'
import styled from 'styled-components'
import {hexToUtf8, toDecimal} from '../helpers/utils'

type HeaderT = {
	approvers: string[]
	quorum: number
	currentAccountAddress: string
	balancesMap: {
		[key: string]: string
	}
}

export default function Header({approvers, quorum, currentAccountAddress, balancesMap}: HeaderT) {
	console.log('shit balancemap:?', balancesMap)
	return (
		<AddressAndQuorum className='mx-auto'>
			<div className='fw-bold text-decoration-underline'>Quorum: {quorum}</div>
			<span className='fw-bold text-decoration-underline'>Approvers:</span>

			<ul className='list-group'>
				{approvers?.map((approver, idx) => (
					<li className='list-group-item border-primary text-primary' key={idx}>
						{approver}
						{' ' + balancesMap[approver] + 'ETH '}
						{currentAccountAddress === approver && (
							<span className='bg-primary text-white rounded-5 px-3 py-1'>My Account</span>
						)}
					</li>
				))}
			</ul>
		</AddressAndQuorum>
	)
}

const AddressAndQuorum = styled.div`
	text-align: center;
`
