import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import useOrdersHook from '../../utils/api/orders'
import { Spinner, Message } from '../../components'

import OrderTableView from '../../components/OrderTableView'

const OrderOrders = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { postOrdersList } = useOrdersHook({})

  const { data, isLoading, isError, error, mutateAsync } = postOrdersList

  const searchHandler = (e) => {
    e.preventDefault()
    mutateAsync({ startDate, endDate })
  }

  // OrderTableView
  const table = {
    header: ['Name', 'Address', 'Phone', 'Email'],
    body: ['name', 'address', 'phone', 'user.email'],
    createdAt: 'createdAt',
    data: data,
  }

  const name = 'Orders List'
  const label = 'Order'
  const modal = 'userOrder'
  const searchPlaceholder = 'Search by name'
  const addBtn = false

  return (
    <>
      <Head>
        <title>Orders</title>
        <meta property='og:title' content='Orders' key='title' />
      </Head>

      <OrderTableView
        table={table}
        searchHandler={searchHandler}
        name={name}
        modal={modal}
        label={label}
        searchPlaceholder={searchPlaceholder}
        searchInput={true}
        addBtn={false}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(OrderOrders)), {
  ssr: false,
})
