import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import {
  FaArrowAltCircleLeft,
  FaCircle,
  FaShip,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa'
import Head from 'next/head'
import useOrders from '../../../api/orders'
import useContainers from '../../../api/containers'
import Message from '../../../components/Message'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import { Access, UnlockAccess } from '../../../utils/UnlockAccess'
import { useForm } from 'react-hook-form'
import { staticInputSelect } from '../../../utils/dynamicForm'

const Details = () => {
  const router = useRouter()
  const { id } = router.query

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const { getOrderDetails, deliveryMode } = useOrders('', '', id)
  const { getContainers } = useContainers()

  const { data, isLoading, isError, error } = getOrderDetails

  const {
    isLoading: isLoadingDeliveryMode,
    isError: isErrorDeliveryMode,
    error: errorDeliveryMode,
    isSuccess: isSuccessDeliveryMode,
    mutateAsync: deliveryModeMutateAsync,
  } = deliveryMode

  const submitHandler = (d) => {
    deliveryModeMutateAsync({
      _id: id,
      mode: d.mode,
      buyer: data && data.buyer,
    })
  }

  const deliveryOptions = [
    { name: 'We did not contact the customer yet!' },
    { name: 'Customer did not answer the call' },
    { name: 'Customer is not available' },
    { name: 'Customer got the orders successfully' },
  ]

  return (
    <div className='container py-3 font-monospace'>
      <Head>
        <title>Delivery Info</title>
        <meta property='og:title' content='Delivery Info' key='title' />
      </Head>

      {isSuccessDeliveryMode && (
        <Message variant='success'>
          Group has been Created successfully.
        </Message>
      )}
      {isErrorDeliveryMode && (
        <Message variant='danger'>{errorDeliveryMode}</Message>
      )}
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
          <h3 className='fw-light'>Delivery Info</h3>
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
        data &&
        data.trackingNo && (
          <>
            <div className='row gy-3'>
              <div className='col-md-6 col-12'>
                <div className='card'>
                  <div className='card-body font-monospace'>
                    <div>
                      <strong>Name: </strong>{' '}
                      <span>{data.buyer.buyerName}</span>
                    </div>
                    <div>
                      <strong>Mobile Number: </strong>{' '}
                      <span>{data.buyer.buyerMobileNumber}</span>
                    </div>

                    <div>
                      <strong>Email: </strong>{' '}
                      <span>{data.buyer.buyerEmail}</span>
                    </div>
                    <div>
                      <strong>Address: </strong>{' '}
                      <span>{data.buyer.buyerAddress}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(submitHandler)} className='p-3'>
                    {staticInputSelect({
                      register,
                      label: 'Delivery Mode',
                      errors,
                      name: 'mode',
                      data: deliveryOptions,
                    })}
                    <button
                      type='submit'
                      className='btn btn-primary '
                      disabled={isLoadingDeliveryMode}
                    >
                      {isLoadingDeliveryMode ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), { ssr: false })
