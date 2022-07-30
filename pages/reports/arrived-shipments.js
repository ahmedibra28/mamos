import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useReportsHook from '../../utils/api/reports'
import { Message, Pagination, Spinner } from '../../components'
import { FaSearch, FaEdit } from 'react-icons/fa'

const ArrivedShipments = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const { getArrivedShipmentsReport } = useReportsHook({ page, q })
  const { data, isLoading, isError, error, refetch } = getArrivedShipmentsReport

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
        <title>Arrived Shipments Report</title>
        <meta
          property='og:title'
          content='Arrived Shipments Report'
          key='title'
        />
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
                <th>Buyer Mobile</th>
                <th>Buyer Name</th>
                <th>B. Reference</th>
                <th>Booked Date</th>
                <th>Departure Date</th>
                <th>Cargo Type</th>
                <th>Total Amount</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((book) => (
                <tr key={book?._id}>
                  <td>{book?.buyer?.buyerMobileNumber}</td>
                  <td>{book?.buyer?.buyerName}</td>
                  <td>{book?.trackingNo}</td>
                  <td>{book?.createdAt?.slice(0, 10)}</td>
                  <td>
                    {book?.other?.transportation?.departureDate?.slice(0, 10)}
                  </td>
                  <td>{book?.other?.cargoType}</td>
                  <td>{book?.price?.totalPrice}</td>
                  <td>
                    <button className='btn btn-outline-primary btn-sm'>
                      {' '}
                      <FaEdit className='mb-1' /> UPDATE{' '}
                    </button>
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
