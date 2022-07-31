import React from 'react'
import useReportsHook from '../../../utils/api/reports'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Message, Spinner } from '../../../components'

const ArrivedBookedShipments = () => {
  const { query } = useRouter()
  const { id } = query

  const { getArrivedBookedShipments } = useReportsHook({
    page: 1,
    id,
  })

  const { data, isLoading, isError, error } = getArrivedBookedShipments

  return (
    <>
      <Head>
        <title>Arrived Booked Shipments Report</title>
        <meta
          property='og:title'
          content='Arrived Booked Shipments Report'
          key='title'
        />
      </Head>

      {isError && <Message variant='danger'>{error}</Message>}

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='table-responsive bg-light p-3 mt-2'>
          data will go here...
        </div>
      )}
    </>
  )
}

export default ArrivedBookedShipments
