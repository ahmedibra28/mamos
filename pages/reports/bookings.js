import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useReportsHook from '../../utils/api/reports'
import { Message, Pagination, Spinner } from '../../components'

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
        <title>Permissions</title>
        <meta property='og:title' content='Permissions' key='title' />
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

            <div className='col-auto'>search input goes here...</div>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <span>table</span>
            </thead>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Bookings)), {
  ssr: false,
})
