import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import useReportsHook from '../../../utils/api/reports'
import useTransportationsHook from '../../../utils/api/transportations'
import { Message, Pagination, Spinner } from '../../../components'
import { FaSearch } from 'react-icons/fa'
import Link from 'next/link'

const ArrivedShipments = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { getArrivedShipmentsReport } = useReportsHook({ page, q })
  const { updateArrivedShipmentToConfirm } = useTransportationsHook({
    page: '',
  })

  const { data, isLoading, isError, error, refetch } = getArrivedShipmentsReport
  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    isSuccess: isSuccessUpdate,
    error: errorUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateArrivedShipmentToConfirm

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const searchHandler = (e) => {
    e.preventDefault()
    refetch()
    setPage(1)
  }

  const confirmArrivalHandler = (id) => {
    mutateAsyncUpdate({ _id: id })
  }

  return (
    <>
      <Head>
        <title>Arrived Shipments Report</title>
        <meta
          property='og:title'
          content='Arrived Shipments Report'
          key='title'
        />
      </Head>

      {isSuccessUpdate && (
        <Message variant='success'>
          Shipment has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

      {isError && <Message variant='danger'>{error}</Message>}

      <div className='ms-auto text-end'>
        <Pagination data={data} setPage={setPage} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='table-responsive bg-light p-3 mt-2'>
          <div className='d-flex align-items-center flex-column mb-2'>
            <h3 className='fw-light text-muted'>
              Arrived Shipments Report List
              <sup className='fs-6'> [{data?.total}] </sup>
            </h3>

            <div className='col-auto'>
              <form onSubmit={searchHandler}>
                <div className='input-group'>
                  <input
                    type='month'
                    className='form-control'
                    aria-label='Month'
                    onChange={(e) => setQ(e.target.value)}
                    value={q}
                  />
                  <div className='input-group-append'>
                    <button type='submit' className='btn btn-outline-secondary'>
                      <FaSearch />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Name</th>
                <th>Shipment Reference</th>
                <th>Departure Date</th>
                <th>Arrival Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((transport) => (
                <tr key={transport?._id}>
                  <td>{transport?.name}</td>
                  <td>{transport?.reference}</td>
                  <td>{transport?.departureDate?.slice(0, 10)}</td>
                  <td>{transport?.arrivalDate?.slice(0, 10)}</td>

                  <td>
                    <button
                      onClick={() => confirmArrivalHandler(transport._id)}
                      className={`btn btn-sm ${
                        transport.status === 'arrived'
                          ? 'btn-outline-success'
                          : 'btn-success'
                      }`}
                      disabled={
                        isLoadingUpdate || transport.status === 'arrived'
                      }
                    >
                      {isLoadingUpdate ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        <>Confirm Arrival</>
                      )}
                    </button>
                    <Link href={`arrived-shipments/${transport._id}`}>
                      <a className='btn btn-primary btn-sm ms-2'>Details</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(ArrivedShipments)), {
  ssr: false,
})
