import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import Link from 'next/link'
const Ocean = () => {
  return (
    <div className='mt-1'>
      <div className='px-2'>
        <h1 className='display-6 text-center font-monospace'>
          Book A New Shipment
        </h1>

        <p className='text-center'>Please select your preferred cargo type</p>

        <div className='row g-3 mt-3'>
          <div className='col-md-4 col-12 mx-auto'>
            <Link href='/booking/ocean/fcl'>
              <a className='text-dark text-decoration-none'>
                <div className='card text-center rounded-0 shadow'>
                  <div className='card-body'>
                    <h1 className='card-title fs-4'>FCL</h1>
                    <p className='card-text'>Full Container Load</p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
          <div className='col-md-4 col-12 mx-auto'>
            <Link href='/booking/air/lcl'>
              <a className='text-dark text-decoration-none'>
                <div className='card text-center rounded-0 shadow'>
                  <div className='card-body'>
                    <h1 className='card-title fs-4'>LCL</h1>
                    <p className='card-text'>Less Container Load</p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Ocean)), { ssr: false })
