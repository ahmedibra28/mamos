import Navigation from './Navigation'
import Head from 'next/head'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Mamos Cargo</title>
        <meta property='og:title' content='Mamos Cargo' key='title' />
      </Head>
      <Navigation />
      <main className='container'>{children}</main>
      <Footer />
    </>
  )
}
