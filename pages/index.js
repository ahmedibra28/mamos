import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'

const Home = () => {
  return (
    <div className='container'>
      <p className='text-center mt-5 text-muted'>
        Modern Dashboard Coming Soon
      </p>
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
