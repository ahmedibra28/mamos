import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { FaArrowAltCircleLeft } from 'react-icons/fa'
import Head from 'next/head'
// import useOrders from '../../api/orders'

import useOrders from '../../../api/orders'
import Message from '../../../components/Message'
import Loader from 'react-loader-spinner'
import moment from 'moment'

const Details = () => {
  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails } = useOrders('', '', id)

  const { data, isLoading, isError, error } = getOrderDetails

  console.log(data && data)

  return (
    <div className='container py-3'>
      <Head>
        <title>Order Details</title>
        <meta property='og:title' content='Order Details' key='title' />
      </Head>
      <div className='row'>
        <div className='col'>
          <button
            onClick={() => router.back()}
            className='btn btn-primary btn-sm rounded-pill'
          >
            <FaArrowAltCircleLeft className='mb-1' /> Go Back
          </button>
        </div>
        <div className='col'>
          <h3 className='fw-light font-monospace'>Order Details</h3>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='row font-monospace'>
          <div className='row'>
            <div className='col'>Shipment No.</div>
            <div className='col'>{data.trackingNo}</div>
          </div>

          <div className='row'>
            <div className='col'>Booked Date</div>
            <div className='col'>
              {moment(data.createdAt).format('MMM Do YY')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), { ssr: false })
