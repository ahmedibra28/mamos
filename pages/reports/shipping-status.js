import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useReportsHook from '../../utils/api/reports'
import { Message, Pagination, Spinner } from '../../components'
import moment from 'moment'
import { getDays } from '../../utils/helper'
import Image from 'next/image'

const ShippingStatus = () => {
  const [page, setPage] = useState(1)

  const { getShippingStatusReport } = useReportsHook({ page })
  const { data, isLoading, isError, error, refetch } = getShippingStatusReport

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const storageFreeGateInDate = (date) => {
    const today = moment().format('YYYY-MM-DD')

    const days = getDays(today, date)

    if (days < 4 && days >= 0)
      return <Image src='/success.png' width='40' height='14' alt='success' />

    if (days >= 4 && days <= 7)
      return <Image src='/warning.png' width='40' height='14' alt='warning' />

    if (days >= 8)
      return <Image src='/danger.png' width='40' height='14' alt='danger' />

    return <Image src='/dark.png' width='40' height='14' alt='dark' />
  }

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
                <th>Shipment Reference</th>
                <th>Storage Free Gate In</th>
                <th>Shipping Instruction</th>
                <th>VGM Date</th>
                <th>Departure Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((book) => (
                <tr key={book?._id}>
                  <td style={{ paddingTop: '0.4rem' }}>
                    {storageFreeGateInDate(book?.storageFreeGateInDate)}
                  </td>
                  <td>{book?.reference}</td>
                  <td>{book?.storageFreeGateInDate}</td>
                  <td>{book?.shippingInstructionDate}</td>
                  <td>{book?.vgmDate}</td>
                  <td>{book?.departureDate}</td>
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
