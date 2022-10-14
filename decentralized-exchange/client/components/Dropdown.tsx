import React, {useEffect, useState} from 'react'
import {useAppData} from '../contexts'

type OptionT = {
	value?: string
	label: string
}

const Dropdown = () => {
	const [appData, setAppDataImmer] = useAppData()

	const tokensOptions: OptionT[] = appData.tokens?.map((item: any) => ({label: item.ticker, value: item}))

	const [dropdownVisible, setDropdownVisible] = useState(false)

	const selectItem: any = (tokenOption: OptionT) => (e: any) => {
		setDropdownVisible(!dropdownVisible)
		setAppDataImmer((appData) => {
			if (!appData.user) return alert('user object not defined, please make sure its defined in state')

			appData.user.selectedToken = tokenOption.value
		})
	}

	const activeItem = {
		label: appData.user?.selectedToken.ticker,
		value: appData.user?.selectedToken.value,
	}
	// console.log('🚀 ~ file: Dropdown.tsx ~ line 40 ~ Dropdown ~ activeItem', activeItem)

	useEffect(() => {
		console.log('rendered...')
	})

	return (
		<div>
			<div className='dropdown ml-3'>
				<button
					className='btn btn-secondary dropdown-toggle'
					type='button'
					data-bs-toggle='dropdown'
					aria-expanded='false'
				>
					{activeItem?.label || 'Label not found'}
				</button>
				<ul className='dropdown-menu'>
					{!!tokensOptions &&
						tokensOptions.map((tokenOption, idx: number) => (
							<li key={idx + '8gh'}>
								<a
									className={`dropdown-item ${activeItem.label === tokenOption.label ? 'active' : ''}`}
									onClick={selectItem(tokenOption)}
								>
									{tokenOption.label}
								</a>
							</li>
						))}
				</ul>
			</div>
		</div>
	)
}

export default Dropdown
