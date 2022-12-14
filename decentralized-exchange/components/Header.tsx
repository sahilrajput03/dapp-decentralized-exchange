import React from 'react'
import {useAppData} from '../contexts'
import {getContracts} from '../helpers/utils'
import Dropdown from './Dropdown'
import config from 'config'

const {dexAddress, networkName} = config

const Header = () => {
	const [appData, setAppDataImmer] = useAppData()

	// Q. Why container-fluid? Becoz it gives uniform padding across across the whole website without managing padding manually.
	// LEARN: card class uses flex system in bootstrap. card class gives the outer round light border, so sweet of bootstrap. ~Docs
	return (
		<header id='header' className='container-fluid'>
			<div className='card px-2 py-3 mt-3'>
				<div className='d-flex justify-content-start align-items-center'>
					<Dropdown />
					<div className='fs-1 ms-3 fw-bold border-secondary border-bottom border-1'>Decentralized Exchange</div>
				</div>
				<div className='d-flex align-items-center fs-6 justify-content-end'>
					<div className='contract-address'>Your Address: </div>
					<div className='address ps-1'>{appData.user?.accounts?.[0]}</div>
				</div>

				<div className='d-flex align-items-center'>
					<div className='fs-5 contract-address'>Contract Address: </div>
					<div className='fs-5 address ps-1'>{appData.contracts?.dex.options.address}</div>
				</div>
				{networkName === 'goerli' && (
					<div>
						View on{' '}
						<a target={'_blank'} href={'https://goerli.etherscan.io/address/' + dexAddress} rel='noreferrer'>
							goerli.etherscan.io
						</a>
					</div>
				)}
			</div>
		</header>
	)
}

export default Header
