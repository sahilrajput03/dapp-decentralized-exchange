import '../styles/globals.css'
import '../styles/globals.scss'
import type { AppProps } from 'next/app'
// NOTE: Since I am customizing bottstrap theme, I need to import it as module from my own global.scss, inspired from: https://getbootstrap.com/docs/4.0/getting-started/theming/
// import 'bootstrap/dist/css/bootstrap.css'
import { useEffect } from "react"

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
		// @ts-ignore
		import('bootstrap/dist/js/bootstrap') // Load bootstrap javascript
	}, [])
  return <Component {...pageProps} />
}

export default MyApp
