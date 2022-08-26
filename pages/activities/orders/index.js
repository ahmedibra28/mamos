import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import useActivitiesHook from '../../../utils/api/activities'
import { Message, Pagination, Spinner } from '../../../components'
import { FaSearch } from 'react-icons/fa'
import Link from 'next/link'

const Orders = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { getOrderActivities } = useActivitiesHook({ page, q })
  const { data, isLoading, isError, error, refetch } = getOrderActivities

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
        <title>Order Activity</title>
        <meta property='og:title' content='Order Activity' key='title' />
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
              Order Activities List
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
                <th>Sh. Reference</th>
                <th>B. Reference</th>
                <th>Booked Date</th>
                <th>Departure Date</th>
                <th>Cargo Type</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((order) => (
                <tr key={order?._id}>
                  <td>{order?.other?.transportation?.reference}</td>
                  <td>{order?.trackingNo}</td>
                  <td>{order?.createdAt?.slice(0, 10)}</td>
                  <td>
                    {order?.other?.transportation?.departureDate?.slice(0, 10)}
                  </td>
                  <td>{order?.other?.cargoType}</td>
                  <td>
                    <span>
                      {order?.status === 'pending' && (
                        <span className='badge bg-warning'>
                          {order?.status}
                        </span>
                      )}
                      {order?.status === 'confirmed' && (
                        <span className='badge bg-info'>{order?.status}</span>
                      )}
                      {order?.status === 'arrived' && (
                        <span className='badge bg-success'>
                          {order?.status}
                        </span>
                      )}
                      {order?.status === 'cancelled' && (
                        <span className='badge bg-danger'>{order?.status}</span>
                      )}
                    </span>
                  </td>
                  <td>{order?.price?.totalPrice}</td>
                  <td>
                    <Link href={`orders/${order._id}`}>
                      <a className='btn btn-warning btn-sm'>Details</a>
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

export default dynamic(() => Promise.resolve(withAuth(Orders)), {
  ssr: false,
})
