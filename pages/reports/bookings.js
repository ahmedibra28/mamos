import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useReportsHook from '../../utils/api/reports'
import { Message, Pagination, Spinner } from '../../components'
import { FaSearch } from 'react-icons/fa'
import { hide } from '../../utils/UnlockAccess'

const Bookings = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { getBookingsReport } = useReportsHook({ page, q })
  const { data, isLoading, isError, error, refetch } = getBookingsReport

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

  return (
    <>
      <Head>
        <title>Booking Report</title>
        <meta property='og:title' content='Booking Report' key='title' />
      </Head>

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
              Booking Report List
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
                <th>Shipment Reference</th>
                <th>Booking Reference</th>
                <th>Booked By</th>
                <th>Booked Date</th>
                <th>Departure Date</th>
                <th>Status</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((book) => (
                <tr key={book?._id}>
                  <td>{book?.other?.transportation?.reference}</td>
                  <td>
                    {book?.TrackingNo === 'N/A' ? (
                      <span className='badge bg-danger'>not provided</span>
                    ) : (
                      book?.TrackingNo
                    )}
                  </td>
                  <td>{book?.createdBy?.name}</td>
                  <td>{book?.createdAt?.slice(0, 10)}</td>
                  <td>
                    {book?.other?.transportation?.departureDate?.slice(0, 10)}
                  </td>
                  <td>
                    <span>
                      {book?.status === 'Pending' && (
                        <span className='badge bg-warning'>{book?.status}</span>
                      )}
                      {book?.status === 'Confirmed' && (
                        <span className='badge bg-info'>{book?.status}</span>
                      )}
                      {book?.status === 'Arrived' && (
                        <span className='badge bg-success'>{book?.status}</span>
                      )}
                      {book?.status === 'cancelled' && (
                        <span className='badge bg-danger'>{book?.status}</span>
                      )}
                    </span>
                  </td>
                  <td>
                    {hide(['LOGISTIC']) ? (
                      <span className='badge bg-danger'>N/A</span>
                    ) : (
                      book?.price?.totalPrice
                    )}{' '}
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

export default dynamic(() => Promise.resolve(withAuth(Bookings)), {
  ssr: false,
})
