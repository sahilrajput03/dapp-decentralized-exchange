import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {AppDataProvider} from '../contexts/AppDataContext'
import {useEffect} from 'react'
import 'bootstrap/dist/css/bootstrap.css'

function MyApp({Component, pageProps}: AppProps) {
	useEffect(() => {
		// @ts-ignore
		import('bootstrap/dist/js/bootstrap') // Load bootstrap javascript
	}, [])

	return (
		<>
			<AppDataProvider>
				<Component {...pageProps} />
			</AppDataProvider>
		</>
	)
}

export default MyApp

// Adding bootstrap to nextjs project? Source: https://dev.to/anuraggharat/adding-bootstrap-to-nextjs-39b2
// Step1: Install bootstrap: `npm i bootstrap` to nextjs project.
// Step2: Add `import 'bootstrap/dist/css/bootstrap.css'` to `_app.js` file.
// Step3: Add `useEffect(() => {import('bootstrap/dist/js/bootstrap')}, [])` to `_app.js` file.
