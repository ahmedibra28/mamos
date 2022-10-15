import Navigation from './Navigation'
import Head from 'next/head'
import Footer from './Footer'
import Notice from './Notice'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Mamos Business</title>
        <meta property='og:title' content='Mamos Business' key='title' />
      </Head>
      <Notice />
      <Navigation />
      <main className='container py-2' style={{ minHeight: '70vh' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
