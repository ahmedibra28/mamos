import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import useActivitiesHook from '../../../utils/api/activities'
import { Spinner, Message } from '../../../components'
import { useRouter } from 'next/router'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const OrderActivityDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const { getOrderActivitiesById } = useActivitiesHook({
    id,
  })

  const { data, isLoading, isError, error } = getOrderActivitiesById

  const loadingOnTrack = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Loading Container On Track</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  const containerInPort = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Container In Port</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  const checkingVGM = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Checked VGM</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  const instructionForShipments = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Instruction For Shipments</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  const clearanceCertificate = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Customer Clearance Certificate</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  const paymentDetails = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Payment Details</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  const submitStatus = (value) => (
    <div
      className={`card shadow my-2 border border-${
        value ? 'success' : 'danger'
      }`}
    >
      <div className='card-body'>
        <div className='card-text d-flex justify-content-between align-items-center'>
          <span>Submitted Booking</span>
          {value ? (
            <FaCheckCircle className={`fs-4 text-success`} />
          ) : (
            <FaTimesCircle className={`fs-4 text-danger`} />
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Order Activity Details {data?.trackingNo}</title>
        <meta
          property='og:title'
          content={`Order Activity Details ${data?.trackingNo}`}
          key='title'
        />
      </Head>

      {isError && <Message variant='danger'>{error}</Message>}

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='bg-light p-3 my-2'>
          <p className='text-center'>Booking Activities Check List</p>
          <div className='row'>
            <div className='col-lg-4 col-6 col-12 mx-auto'>
              {loadingOnTrack(data?.process?.loadingOnTrack)}
              {containerInPort(data?.process?.containerInPort)}
              {checkingVGM(data?.process?.checkingVGM)}
              {instructionForShipments(data?.process?.instructionForShipments)}
              {clearanceCertificate(data?.process?.clearanceCertificate)}
              {paymentDetails(data?.process?.paymentDetails)}
              {submitStatus(
                data?.status === 'confirmed' || data?.status === 'arrived'
                  ? true
                  : false
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(OrderActivityDetails)), {
  ssr: false,
})
