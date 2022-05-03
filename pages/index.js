import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import { FaBook, FaHandHoldingUsd, FaSearch } from 'react-icons/fa'

function Home() {
  return (
    <div>
      <Head>
        <title>Mamos Cargo</title>
        <meta property='og:title' content='Mamos Cargo' key='title' />
      </Head>

      <div className='row mt-5'>
        <div className='col-md-8 col-12'>
          <h1 className='fw-bold display-4'>TRACK A SHIPMENT</h1>
          <h4 className='fw-light'>Finding your freight, fast.</h4>

          <div className='btn-group'>
            <Link href='/booking'>
              <a className='btn btn-primary btn-lg rounded-3'>BOOK NOW</a>
            </Link>

            <Link href='/track'>
              <a className='btn btn-light btn-lg rounded-3 ms-3'>
                <FaHandHoldingUsd className='mb-1' /> TRACK NOW
              </a>
            </Link>
          </div>

          {/* <div className='input-group mb-3'>
            <button
              className='btn btn-primary dropdown-toggle'
              type='button'
              data-bs-toggle='dropdown'
              aria-expanded='false'
            >
              Tracking Option
            </button>
            <ul className='dropdown-menu'>
              <li>
                <a className='dropdown-item' href='#'>
                  Booking number
                </a>
              </li>
              <li>
                <a className='dropdown-item' href='#'>
                  Container / Bill of lading
                </a>
              </li>
            </ul>
            <input
              type='text'
              className='form-control'
              aria-label='Text input with dropdown button'
              placeholder='Enter tracking number'
              aria-describedby='track'
            />
            <button className='input-group-text custom-text-primary' id='track'>
              <FaSearch className='mb-1' />
            </button>
          </div> */}
          <p className='mt-3 text-muted'>
            If you have any questions regarding the results of your shipment
            tracking results, please contact your local MAMOS team. By using the
            shipment tracking service you agree to the terms of use of
            mamosbusiness.com.
          </p>
        </div>
        {/* <div className='col-md-4 col-12 mt-5'>
          <Link href='/booking'>
            <a className='btn btn-primary btn-lg rounded-3 form-control mt-2'>
              <FaBook className='mb-1' /> BOOK NOW
            </a>
          </Link>
          <br />
          <Link href='/quote/request'>
            <a className='btn btn-light btn-lg rounded-3 form-control mt-2'>
              <FaHandHoldingUsd className='mb-1' /> REQUEST A QUOTE
            </a>
          </Link>
        </div> */}
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
