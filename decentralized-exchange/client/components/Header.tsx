import React from 'react'
import {useAppData} from '../contexts'
import {getContracts} from '../helpers/utils'
import Dropdown from './Dropdown'

const Header = () => {
	const [appData, setAppDataImmer] = useAppData()

	return (
		<header id='header' className='card'>
			{/** card uses flex system in bootstrap ~Docs */}
			<div className='row'>
				<div className='col-sm-2 flex'>
					<Dropdown />
				</div>
				<div className='col-sm-10'>
					<div className='fs-2'>Decentralized Exchange</div>
				</div>

				<div className='d-flex align-items-center'>
					<div className='fs-3 contract-address'>Contract Address: </div>
					<div className='fs-4 address ps-1'>{appData.contracts.dex.options.address}</div>
				</div>
			</div>
		</header>
	)
}

export default Header
