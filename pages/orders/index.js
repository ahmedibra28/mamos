import { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useOrdersHook from '../../utils/api/orders'
import { Spinner, Message, Pagination } from '../../components'
import moment from 'moment'
import { FaInfoCircle } from 'react-icons/fa'
import Link from 'next/link'

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
              {['pending', 'confirmed'].map((s) => (
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
                <td>Tracking ID</td>
                <td>Ordered By</td>
                <td>Order Date</td>
                <td>Transportation</td>
                <td>Cargo Type</td>
                <td>Status</td>
                <td>Details</td>
              </tr>
            </thead>

            <tbody>
              {table?.data?.data?.map((item) => {
                return (
                  <tr key={item._id}>
                    <td>{item?.trackingNo}</td>
                    <td>{item?.createdBy?.name}</td>
                    <td>{moment(item?.createdAt).format('lll')}</td>
                    <td>{item?.other?.transportationType}</td>
                    <td>{item?.other?.cargoType}</td>
                    <td>{item?.status}</td>
                    <td>
                      <Link href={`/orders/details/${item?._id}`}>
                        <a className='btn btn-warning btn-sm rounded-pill'>
                          <FaInfoCircle className='mb-1' /> Details
                        </a>
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
