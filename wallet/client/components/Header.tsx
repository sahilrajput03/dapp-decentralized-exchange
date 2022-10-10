import React from 'react'

type HeaderT = {
	approvers: string[]
	quorum: number
}

export default function Header({approvers, quorum}: HeaderT) {
	return (
		<header>
			<ul>
				<li>Approvers:{approvers.join(', ')}</li>
				<li>Quorum: {quorum}</li>
			</ul>
		</header>
	)
}
