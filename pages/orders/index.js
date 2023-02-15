import { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useOrdersHook from '../../utils/api/orders'
import { Spinner, Message, Pagination } from '../../components'
import moment from 'moment'
import Link from 'next/link'
import { customLocalStorage } from '../../utils/customLocalStorage'

const OrderOrders = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { postOrdersList } = useOrdersHook({
    page,
  })

  const { data, isLoading, isError, error, mutateAsync } = postOrdersList

  useEffect(() => {
    if (startDate && endDate) {
      mutateAsync({ startDate, endDate, status })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const searchHandler = (e) => {
    e.preventDefault()
    mutateAsync({ startDate, endDate, status })
  }

  useEffect(() => {
    if (customLocalStorage()?.userAccessRoutes?.role === 'LOGISTIC') {
      mutateAsync({
        startDate: moment().subtract(90, 'days'),
        endDate: moment().format(),
        status: 'Pending',
      })
      setStartDate(moment().subtract(90, 'days').format('YYYY-MM-DD'))
      setEndDate(moment().format('YYYY-MM-DD'))
      setStatus('Pending')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // OrderTableView
  const table = {
    data: data,
  }

  return (
    <>
      <Head>
        <title>Orders</title>
        <meta property='og:title' content='Orders' key='title' />
      </Head>

      <div className='ms-auto text-end'>
        <Pagination data={table.data} setPage={setPage} />
      </div>

      <div className='table-responsive bg-light p-3 mt-2'>
        <div className='d-flex align-items-center flex-column mb-2'>
          <h3 className='fw-light text-muted'>
            Booking Orders List
            <sup className='fs-6'> [{table.data?.total || 0}] </sup>
          </h3>

          <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='form-control'
            />
          </div>
          <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='form-control my-2'
            />
          </div>
          <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
            <select
              type='date'
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='form-control mb-2'
            >
              <option value=''>-----------</option>
              {['Pending', 'Confirmed', 'Arrived', 'cancelled'].map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className='col-12'>
              <button
                className='btn btn-outline-primary form-control'
                onClick={searchHandler}
              >
                SEARCH
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <td>Booking No.</td>
                <td>Booked By</td>
                <td>Buyer Email</td>
                <td>Booking Date</td>
                <td>T. Reference</td>
                <td>Status</td>
                <td>Details</td>
              </tr>
            </thead>

            <tbody>
              {table?.data?.data?.map((item) => {
                return (
                  <tr key={item._id}>
                    <td>
                      {item?.TrackingNo === 'N/A' ? (
                        <span className='badge bg-danger'>Not Provided</span>
                      ) : (
                        item?.TrackingNo
                      )}
                    </td>
                    <td>{item?.createdBy?.name}</td>
                    <td>{item?.buyer?.buyerEmail}</td>
                    <td>{moment(item?.createdAt).format('lll')}</td>
                    <td>{item?.other?.transportation?.reference}</td>
                    <td>
                      <span>
                        {item?.status === 'Pending' && (
                          <span className='badge bg-warning'>
                            {item?.status}
                          </span>
                        )}
                        {item?.status === 'Confirmed' && (
                          <span className='badge bg-info'>{item?.status}</span>
                        )}
                        {item?.status === 'Arrived' && (
                          <span className='badge bg-success'>
                            {item?.status}
                          </span>
                        )}
                        {item?.status === 'cancelled' && (
                          <span className='badge bg-danger'>
                            {item?.status}
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/orders/details/${item?._id}`}
                        className='badge bg-primary p-2 text-decoration-none'
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(OrderOrders)), {
  ssr: false,
})
