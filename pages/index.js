import Head from 'next/head'
// import dynamic from 'next/dynamic'
// import withAuth from '../HOC/withAuth'
import {
  FaBook,
  FaHandHoldingUsd,
  FaSearchLocation,
  FaTruckLoading,
} from 'react-icons/fa'

function Home() {
  return (
    <div>
      <Head>
        <title>Mamos Cargo</title>
        <meta property='og:title' content='Mamos Cargo' key='title' />
      </Head>

      <div className='row mt-5'>
        <div className='col-md-4 col-12 mx-auto'>
          <div className='card text-center shadow py-2'>
            <FaTruckLoading className='card-img-top fs-1' />
            <div className='card-body'>
              <h5 className='card-title display-6'>e-Booking</h5>
            </div>
          </div>
        </div>
        <div className='col-md-4 col-12 mx-auto'>
          <div className='card text-center shadow py-2'>
            <FaSearchLocation className='card-img-top fs-1' />
            <div className='card-body'>
              <h5 className='card-title display-6'>Shipment Tracking</h5>
            </div>
          </div>
        </div>
        <div className='col-md-4 col-12 mx-auto'>
          <div className='card text-center shadow py-2'>
            <FaHandHoldingUsd className='card-img-top fs-1' />
            <div className='card-body'>
              <h5 className='card-title display-6'>Quote Price</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
export default Home
