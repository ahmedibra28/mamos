import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import {
  FaFileDownload,
  FaPlus,
  FaInfoCircle,
  FaTimesCircle,
  FaChevronCircleDown,
  FaCheckCircle,
  FaUsers,
} from 'react-icons/fa'
import useOrders from '../../api/orders'
import { CSVLink } from 'react-csv'
import Pagination from '../../components/Pagination'
import moment from 'moment'
import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../../components/Confirm'
import { Access, UnlockAccess } from '../../utils/UnlockAccess'

const Orders = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const {
    getOrders,
    deleteOrder,
    updateDeliveredOrder,
    updateStatusCargo,
    updateStatusCargoToComplete,
  } = useOrders(page, search)

  useEffect(() => {
    refetch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const { data, isLoading, isError, error, refetch } = getOrders
  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deleteOrder

  const {
    isLoading: isLoadingDelivered,
    isError: isErrorDelivered,
    error: errorDelivered,
    isSuccess: isSuccessDelivered,
    mutateAsync: deliveredMutateAsync,
  } = updateDeliveredOrder

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateStatusCargo

  const { mutateAsync: updateStatusToCompleteMutateAsync } =
    updateStatusCargoToComplete

  const searchHandler = (e) => {
    e.preventDefault()
    refetch()
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const orderReceivedConfirmHandler = (id) => {
    deliveredMutateAsync(id)
  }

  return (
    <>
      <Head>
        <title>Order</title>
        <meta property='og:title' content='Order' key='title' />
      </Head>

      {isSuccessDelete && (
        <Message variant='success'>
          Order has been cancelled successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      {isSuccessDelivered && (
        <Message variant='success'>
          Order has been delivered successfully.
        </Message>
      )}
      {isErrorDelivered && <Message variant='danger'>{errorDelivered}</Message>}

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
                        ${order.status === 'Completed' && 'bg-success'}
                        `}
                      >
                        {order.status}
                      </td>
                      <td>{moment(order.createdAt).format('MMM Do')}</td>

                      <td className='btn-group'>
                        <Link href={`/orders/details/${order._id}`}>
                          <a className='btn btn-primary btn-sm rounded-pill'>
                            <FaInfoCircle />
                          </a>
                        </Link>

                        {!order.isDelivered && UnlockAccess(Access.agent) && (
                          <button
                            className='btn btn-success btn-sm rounded-pill ms-1'
                            onClick={() =>
                              orderReceivedConfirmHandler(order._id)
                            }
                            disabled={isLoadingDelivered}
                          >
                            {isLoadingDelivered ? (
                              <span className='spinner-border spinner-border-sm' />
                            ) : (
                              <span>
                                <FaCheckCircle />
                              </span>
                            )}
                          </button>
                        )}
                        {order.isDelivered && UnlockAccess(Access.agent) && (
                          <Link href={`/orders/delivery/${order._id}`}>
                            <a className='btn btn-light btn-sm rounded-pill ms-1'>
                              <FaUsers />
                            </a>
                          </Link>
                        )}

                        {!UnlockAccess(Access.admin_logistic_agent) && (
                          <button
                            className='btn btn-danger btn-sm rounded-pill ms-1'
                            onClick={() => deleteHandler(order._id)}
                            disabled={isLoadingDelete}
                          >
                            {isLoadingDelete ? (
                              <span className='spinner-border spinner-border-sm' />
                            ) : (
                              <span>
                                <FaTimesCircle />
                              </span>
                            )}
                          </button>
                        )}
                        {UnlockAccess(Access.admin_logistic) &&
                          order.status !== 'Completed' && (
                            <div
                              disabled={isLoadingDelete}
                              className='dropdown ms-1'
                            >
                              <button
                                className='btn btn-success dropdown-toggles btn-sm rounded-pill'
                                type='button'
                                id='more'
                                data-bs-toggle='dropdown'
                                aria-expanded='false'
                              >
                                <FaChevronCircleDown />
                              </button>
                              <ul
                                className='dropdown-menu border-0'
                                aria-labelledby='more'
                              >
                                {order.status === 'Pending' && (
                                  <li>
                                    <Link
                                      href={`/orders/update/invoice/${order._id}`}
                                    >
                                      <a
                                        className='dropdown-item btn-sm'
                                        type='button'
                                      >
                                        Invoice
                                      </a>
                                    </Link>
                                  </li>
                                )}
                                {order.cargoType === 'AIR' &&
                                  order.status === 'Pending' && (
                                    <li>
                                      <Link
                                        href={`/orders/update/edit-air-cargo/${order._id}`}
                                      >
                                        <a
                                          className='dropdown-item btn-sm'
                                          type='button'
                                        >
                                          AIR Cargo
                                        </a>
                                      </Link>
                                    </li>
                                  )}
                                {order.cargoType === 'LCL' &&
                                  order.status === 'Pending' && (
                                    <li>
                                      <Link
                                        href={`/orders/update/edit-lcl-cargo/${order._id}`}
                                      >
                                        <a
                                          className='dropdown-item btn-sm'
                                          type='button'
                                        >
                                          LCL Cargo
                                        </a>
                                      </Link>
                                    </li>
                                  )}
                                {order.cargoType === 'FCL' &&
                                  order.status === 'Pending' && (
                                    <li>
                                      <Link
                                        href={`/orders/update/edit-fcl-cargo/${order._id}`}
                                      >
                                        <a
                                          className='dropdown-item btn-sm'
                                          type='button'
                                        >
                                          FCL Cargo
                                        </a>
                                      </Link>
                                    </li>
                                  )}
                                {order.status === 'Pending' && (
                                  <li>
                                    <button
                                      onClick={() =>
                                        updateMutateAsync(order._id)
                                      }
                                      className='dropdown-item btn-sm'
                                      type='button'
                                    >
                                      Confirm
                                    </button>
                                  </li>
                                )}
                                {order.status === 'Shipped' && (
                                  <li>
                                    <button
                                      onClick={() =>
                                        updateStatusToCompleteMutateAsync(
                                          order._id
                                        )
                                      }
                                      className='dropdown-item btn-sm'
                                      type='button'
                                    >
                                      Arrived
                                    </button>
                                  </li>
                                )}
                                {order.status === 'Pending' && (
                                  <li>
                                    <button
                                      onClick={() => deleteHandler(order._id)}
                                      className='dropdown-item btn-sm'
                                      type='button'
                                    >
                                      Cancel Order
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
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
