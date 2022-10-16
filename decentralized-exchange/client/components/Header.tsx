import React from 'react'
import {useAppData} from '../contexts'
import {getContracts} from '../helpers/utils'
import Dropdown from './Dropdown'

const Header = () => {
	const [appData, setAppDataImmer] = useAppData()

	// Q. Why container-fluid? Becoz it gives uniform padding across across the whole website without managing padding manually.
	// LEARN: card class uses flex system in bootstrap. card class gives the outer round light border, so sweet of bootstrap. ~Docs
	return (
		<header id='header' className='container-fluid'>
			<div className='card px-2 py-3 mt-3'>
				<div className='d-flex justify-content-start align-items-center'>
					<Dropdown />
					<div className='fs-2 ps-3'>Decentralized Exchange</div>
				</div>
				<div className='d-flex align-items-center'>
					<div className='fs-5 contract-address'>Contract Address: </div>
					<div className='fs-5 address'>{appData.contracts.dex.options.address}</div>
				</div>
			</div>
		</header>
	)
}

export default Header
