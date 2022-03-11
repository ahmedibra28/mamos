import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
import { FaCircle, FaShip } from 'react-icons/fa'
import useTracks from '../api/tracks'
import { useForm } from 'react-hook-form'
import { inputText } from '../utils/dynamicForm'
import moment from 'moment'

const Track = () => {
  const { getOrderTrack } = useTracks()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const {
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    error: errorSearch,
    isSuccess: isSuccessSearch,
    data,
    mutateAsync: addMutateAsync,
  } = getOrderTrack

  const submitHandler = async (data) => {
    addMutateAsync(data)
  }

  return (
    <>
      <Head>
        <title>Tracking</title>
        <meta property='og:title' content='Tracking' key='title' />
      </Head>
      {isSuccessSearch && (
        <Message variant='success'>
          Order track has been found successfully.
        </Message>
      )}
      {isErrorSearch && <Message variant='danger'>{errorSearch}</Message>}

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row g-0 d-flex justify-content-center'>
          <div className='col-auto'>
            {inputText({ register, label: 'Name', errors, name: 'name' })}
          </div>
          <div className='col-auto'>
            <button
              type='submit'
              className='btn btn-primary btn-lg mt-4'
              disabled={isLoadingSearch}
            >
              {isLoadingSearch ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </form>

      {isLoadingSearch ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isErrorSearch ? (
        <Message variant='danger'>{errorSearch}</Message>
      ) : (
        <div className='row'>
          <div className='col-auto mx-auto'>
            <h3
              className={`
                        ${data && data.status === 'Pending' && 'bg-warning'} 
                        ${data && data.status === 'Canceled' && 'bg-danger'}
                        ${data && data.status === 'Shipped' && 'bg-primary'}
                        ${data && data.status === 'Completed' && 'bg-success'}
                         px-3 py-2 text-center text-light `}
            >
              {data && data.status}
            </h3>
            {data &&
              data.shipment &&
              data.shipment.tradelane &&
              data.shipment.tradelane.map((event) => (
                <div
                  key={event._id}
                  className='card font-monospace bg-transparent border-0  '
                >
                  <div className='card-body'>
                    <div
                      className='row mx-auto'
                      style={{ marginBottom: '-32px' }}
                    >
                      <div className='col-auto'>
                        <div className='left'>
                          <h6 className='fw-light text-muted'>
                            {moment(event.dateTime).format('MMM Do')}
                          </h6>
                          <h6 className='fw-light text-muted'>
                            {moment(event.dateTime).format('LT')}
                          </h6>
                        </div>
                      </div>
                      <div className='col-auto border border-success border-bottom-0 border-end-0 border-top-0 pb-4'>
                        <div className='right'>
                          <h6 className='card-title fw-light'>
                            {event.actionType}
                          </h6>
                          <div className='position-relative'>
                            <FaCircle
                              className={`border border-success rounded-pill position-absolute mt-2 ${
                                event.isActiveLocation
                                  ? 'text-success'
                                  : 'text-light'
                              }`}
                              style={{ marginLeft: '-20' }}
                            />
                          </div>
                          <h1 className='card-title fs-4'>{event.location}</h1>
                          <div className='card-text'>
                            <h6 className='fw-light'>
                              <FaShip className='mb-1' /> {event.tradeType}
                            </h6>
                            <h6 className='fw-light'>{event.description}</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Track)), {
  ssr: false,
})
