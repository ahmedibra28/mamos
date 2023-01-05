import React, { useEffect, useState } from 'react'
import withAuth from '../../../HOC/withAuth'
import dynamic from 'next/dynamic'
import apiHook from '../../../api'
import { Spinner, Pagination, Message, Search } from '../../../components'
import moment from 'moment'

const Transaction = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const getApi = apiHook({
    key: ['transactions'],
    method: 'GET',
    url: `accounts/transactions?page=${page}&q=${q}&limit=${25}`,
  })?.get

  useEffect(() => {
    getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const searchHandler = (e) => {
    e.preventDefault()
    getApi?.refetch()
    setPage(1)
  }

  const currency = (amount) =>
    amount?.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })

  return (
    <div>
      <div className='ms-auto text-end'>
        <Pagination data={getApi?.data} setPage={setPage} />
      </div>

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant='danger'> {getApi?.error} </Message>
      ) : (
        <div className='table-responsive bg-light p-3 mt-2'>
          <div className='d-flex align-items-center flex-column mb-2'>
            <h3 className='fw-light text-muted'>
              Transactions
              <sup className='fs-6'> [{getApi?.data?.total}] </sup>
            </h3>

            <div className='col-auto'>
              <Search
                placeholder='Search by name'
                setQ={setQ}
                q={q}
                searchHandler={searchHandler}
              />
            </div>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Acc. Code</th>
                <th>Account</th>
                <th>Vendor/Customer</th>
                {/* <th>Reference</th> */}
                <th>Amount</th>
                {/* <th>Discount</th> */}
                <th>Description</th>
                <th>DateTime</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item, i) => (
                <tr key={i}>
                  <td>{item?.account?.code}</td>
                  <td>{item?.account?.name}</td>
                  <td>
                    {item?.vendor?.name}
                    {item?.customer?.name}
                  </td>
                  {/* <td>
                    {item?.transportation}
                    {item?.order}
                  </td> */}
                  <td>{currency(item?.amount)}</td>
                  {/* <td>{currency(item?.discount)}</td> */}
                  <td>{item?.description}</td>
                  <td>
                    {moment(item?.date || item?.createdAt).format('YYYY-MM-DD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Transaction)), {
  ssr: false,
})
