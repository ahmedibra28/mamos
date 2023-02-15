import React from 'react'
import withAuth from '../../../HOC/withAuth'
import dynamic from 'next/dynamic'
import apiHook from '../../../api'
import { Spinner, Message } from '../../../components'
import moment from 'moment'
import { useRouter } from 'next/router'

const TransactionDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const getApi = apiHook({
    key: [`transactions-${id}`],
    method: 'GET',
    url: `accounts/transactions/${id}`,
  })?.get

  // const currency = (amount) =>
  //   amount?.toLocaleString('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //   })

  const recPay = (item) => {
    if ([2022, 2023].includes(item?.account?.code)) {
      return (
        <span className='text-danger'>
          {` - ` +
            item?.amount?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
        </span>
      )
    } else {
      return item?.amount?.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    }
  }

  let amount = 0
  const balance = (item) => {
    if ([2022, 2023].includes(item?.account?.code)) {
      amount = amount - item?.amount
    } else {
      amount = amount + item?.amount
    }

    return (
      <span className='text-muted'>
        {amount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </span>
    )
  }

  return (
    <div>
      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant='danger'> {getApi?.error} </Message>
      ) : (
        <div className='table-responsive bg-light p-3 mt-2'>
          <div className='d-flex align-items-center flex-column mb-2'>
            <h3 className='fw-light text-muted'>
              Transactions
              <sup className='fs-6'> [{getApi?.data?.length}] </sup> -{' '}
              {getApi?.data?.[0]?.vendor?.name}
            </h3>
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
                <th>Balance</th>
                <th>Description</th>
                <th>DateTime</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.map((item, i) => (
                <tr key={i}>
                  <td>{item?.account?.code}</td>
                  <td>{item?.account?.name}</td>
                  <td>
                    {item?.vendor?.name}
                    {item?.Customer?.name}
                  </td>
                  {/* <td>
                    {item?.transportation}
                    {item?.order}
                  </td> */}
                  <td>{recPay(item)}</td>
                  {/* <td>{currency(item?.discount)}</td> */}
                  <td>{balance(item)}</td>
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

export default dynamic(() => Promise.resolve(withAuth(TransactionDetails)), {
  ssr: false,
})
