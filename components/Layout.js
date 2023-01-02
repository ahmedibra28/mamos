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
      <div className='d-flex justify-content-between'>
        <main
          className='container py-2'
          style={{ minHeight: 'calc(100vh - 120px)' }}
        >
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}
