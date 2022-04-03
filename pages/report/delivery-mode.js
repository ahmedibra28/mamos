import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Loader from 'react-loader-spinner'
import useReports from '../../api/reports'
import Message from '../../components/Message'
import moment from 'moment'

const DeliveryMode = () => {
  const { getDeliveryModes } = useReports()

  const { data, isLoading, isError, error } = getDeliveryModes

  return (
    <>
      <Head>
        <title>Delivery Mode</title>
        <meta property='og:title' content='Delivery Mode' key='title' />
      </Head>

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
              <caption>{data && data.length} records were found</caption>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((mode) => (
                    <tr key={mode._id}>
                      <td>{mode.name}</td>
                      <td>{mode.mobile}</td>
                      <td>{mode.address}</td>
                      <td>{moment(mode.createdAt).format('ll')}</td>
                      <td>{mode.mode}</td>
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

export default dynamic(() => Promise.resolve(withAuth(DeliveryMode)), {
  ssr: false,
})
