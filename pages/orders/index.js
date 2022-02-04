import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import { FaFileDownload, FaPlus, FaInfoCircle } from 'react-icons/fa'
import useOrders from '../../api/orders'
import { CSVLink } from 'react-csv'
import Pagination from '../../components/Pagination'
import moment from 'moment'

const Orders = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { getOrders } = useOrders(page, search)

  useEffect(() => {
    refetch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const searchHandler = (e) => {
    e.preventDefault()
    refetch()
  }

  const { data, isLoading, isError, error, refetch } = getOrders

  return (
    <>
      <Head>
        <title>Order</title>
        <meta property='og:title' content='Order' key='title' />
      </Head>

      <div className='position-relative'>
        <button
          className='btn btn-primary position-fixed rounded-3 animate__bounceIn'
          style={{
            bottom: '20px',
            right: '25px',
          }}
          data-bs-toggle='modal'
          data-bs-target='#editOrderModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data.data : []} filename='order.csv'>
          <button
            className='btn btn-success position-fixed rounded-3 animate__bounceIn'
            style={{
              bottom: '60px',
              right: '25px',
            }}
          >
            <FaFileDownload className='mb-1' />
          </button>
        </CSVLink>
      </div>

      <div className='row mt-3'>
        <div className='col-md-4 col-6 m-auto'>
          <h3 className='fw-light font-monospace'>Orders</h3>
        </div>
        <div className='col-md-4 col-6 m-auto'>
          <Pagination data={data} setPage={setPage} />
        </div>

        <div className='col-md-4 col-12 m-auto'>
          <form onSubmit={(e) => searchHandler(e)}>
            <input
              type='text'
              className='form-control py-2'
              placeholder='Search by ID'
              name='search'
              value={search}
              onChange={(e) => (
                setSearch(e.target.value.toUpperCase()), setPage(1)
              )}
              autoFocus
            />
          </form>
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
        <>
          <div className='table-responsive '>
            <table className='table table-sm hover bordered table-striped caption-top '>
              <caption>
                {!isLoading && data ? data.total : 0} records were found
              </caption>
              <thead>
                <tr>
                  <th>Tracking No.</th>
                  {/* <th className='d-none d-sm-block'>Departure</th> */}
                  <th className='d-none d-sm-block'>Direction</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.data.map((order) => (
                    <tr key={order._id}>
                      <td>{order.trackingNo}</td>
                      <td className='d-none d-sm-block'>
                        {order.pickup &&
                          order.pickup.pickupCountry &&
                          order.pickup.pickupCountry.name}{' '}
                        -{' '}
                        {order.destination &&
                          order.destination.destCountry &&
                          order.destination.destCountry.name}
                      </td>

                      <td
                        className={`
                        ${order.status === 'Pending' && 'bg-warning'} 
                        ${order.status === 'Canceled' && 'bg-danger'}
                        ${order.status === 'Shipped' && 'bg-primary'}
                        ${order.status === 'Complete' && 'bg-success'}
                        `}
                      >
                        {order.status}
                      </td>
                      <td>{moment(order.createdAt).format('MMM Do')}</td>

                      <td className='btn-order'>
                        <Link href={`/orders/details/${order._id}`}>
                          <a className='btn btn-primary btn-sm rounded-pill'>
                            <FaInfoCircle />
                          </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Orders)), {
  ssr: false,
})
