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
				<div className='col-sm-3 flex'>
					<Dropdown />
				</div>
				<div className='col-sm-3 flex'></div>
				<div className='col-sm-9'>
					<h1 className='header-title'>
						Dex -
						<span className='contract-address'>
							Contract Address: <span className='address'>{appData.contracts.dex.options.address}</span>
						</span>
					</h1>
				</div>
			</div>
		</header>
	)
}

export default Header
