import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useReportsHook from '../../utils/api/reports'
import { Message, Pagination, Spinner } from '../../components'
import { FaCheckCircle, FaLightbulb } from 'react-icons/fa'

const ShippingStatus = () => {
  const [page, setPage] = useState(1)

  const { getShippingStatusReport } = useReportsHook({ page })
  const { data, isLoading, isError, error, refetch } = getShippingStatusReport

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <>
      <Head>
        <title>Shipping Status Report</title>
        <meta
          property='og:title'
          content='Shipping Status Report'
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
              Shipping Status Report List
              <sup className='fs-6'> [{data?.total}] </sup>
            </h3>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Status</th>
                <th>Sh. Reference</th>
                <th>Cargo Type</th>
                <th>Storage Free Gate In</th>
                <th>Shipping Instruction</th>
                <th>VGM Date</th>
                <th>Departure Date</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((book) => (
                <tr key={book?._id}>
                  <td>
                    <FaLightbulb className='text-warning' />
                    <FaLightbulb className='text-success' />
                    <FaLightbulb className='text-danger' />
                  </td>
                  <td>{book?.reference}</td>
                  <td>{book?.cargoType}</td>
                  <td>{book?.storageFreeGateInDate?.slice(0, 10)}</td>
                  <td>{book?.shippingInstructionDate?.slice(0, 10)}</td>
                  <td>{book?.vgmDate?.slice(0, 10)}</td>
                  <td>{book?.departureDate?.slice(0, 10)}</td>
                  <td>{book?.createdAt?.slice(0, 10)}</td>
                  <td>
                    <button className='btn btn-primary btn-sm rounded-pill'>
                      <FaCheckCircle className='mb-1' /> Departed
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

export default dynamic(() => Promise.resolve(withAuth(ShippingStatus)), {
  ssr: false,
})
