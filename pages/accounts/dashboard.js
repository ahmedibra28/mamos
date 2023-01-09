import React, { useEffect, useState } from 'react'
import apiHook from '../../api'
import DatePicker from 'react-datepicker'
import { Message, Spinner } from '../../components'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const Accounts = () => {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const getApi = apiHook({
    key: ['accounts-dashboard'],
    method: 'GET',
    url: `accounts/dashboard?start=${moment(startDate).format(
      'YYYY-MM-DD'
    )}&end=${moment(endDate).format('YYYY-MM-DD')}`,
  })?.get

  useEffect(() => {
    getApi?.refetch()
  }, [startDate, endDate])

  const currency = (amount) =>
    amount?.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })

  const listItem = (title, amount) => {
    return (
      <li className='list-group-item d-flex justify-content-between align-items-start'>
        <div className='ms-2 me-auto'>
          <div className='fw-bold'>{title}</div>
        </div>
        <span className='badge bg-primary rounded-pill'>
          {currency(amount)}
        </span>
      </li>
    )
  }

  return (
    <div>
      <h5 className='text-center fw-bold'>Profit & Loss Statement</h5>
      <p className='text-center'>
        For the period from {moment(startDate).format('YYYY-MM-DD')} to{' '}
        {moment(endDate).format('YYYY-MM-DD')}
      </p>
      <hr />

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant='danger'>{getApi?.error}</Message>
      ) : (
        <div className='row'>
          <div className='col-md-5 col-12 mx-auto'>
            <div className='row my-2'>
              <div className='col-6'>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className='form-control'
                />
              </div>
              <div className='col-6'>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className='form-control'
                />
              </div>
            </div>
          </div>
          <div className='col-12'></div>
          <div className='col-lg-5 col-md-8 col-12 mx-auto'>
            <ol className='list-group'>
              {listItem('Expenses', getApi?.data?.expense?.amount)}
              {listItem('Accounts Payable', getApi?.data?.ap?.amount)}
              {listItem('Accounts Receivable', getApi?.data?.ar?.amount)}
              {listItem('Sales', getApi?.data?.gos?.amount)}
              {listItem(
                'Payments',
                getApi?.data?.payment?.bank + getApi?.data?.payment?.cash
              )}
              {listItem(
                'Receipts',
                getApi?.data?.receipt?.bank + getApi?.data?.receipt?.cash
              )}
              {getApi?.data?.finalAP?.amount > 0 &&
                listItem(
                  'Final Accounts Payable',
                  getApi?.data?.finalAP?.amount
                )}
              {getApi?.data?.finalAR?.amount > 0 &&
                listItem(
                  'Final Accounts Receivable',
                  getApi?.data?.finalAR?.amount
                )}
              {listItem('Cash', getApi?.data?.cash?.amount)}
              {listItem('Bank', getApi?.data?.bank?.amount)}
              {listItem('Gross Income', getApi?.data?.grossIncome?.amount)}
              {listItem('Net Income', getApi?.data?.netIncome?.amount)}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
