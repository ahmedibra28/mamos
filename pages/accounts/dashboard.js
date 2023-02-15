import React, { useEffect, useState } from 'react'
import apiHook from '../../api'
import DatePicker from 'react-datepicker'
import { Message, Spinner } from '../../components'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

import { currency } from '../../utils/currency'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const listItem = (title, amount) => {
    return (
      <li className='list-group-item d-flex justify-content-between align-items-start'>
        <div className='ms-2 me-auto'>
          <div className='fw-bold'>{title}</div>
        </div>
        <span
          className={`badge bg-primary rounded-pill ${
            title === 'Net Profit' ? 'bg-success' : ''
          }`}
        >
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
      </div>

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant='danger'>{getApi?.error}</Message>
      ) : (
        <div className='row'>
          <div className='col-12'></div>
          <div className='col-lg-5 col-md-8 col-12 mx-auto'>
            <ol className='list-group'>
              {listItem('Overweight', getApi?.data?.totalOverWeight)}
              {listItem('Demurrage', getApi?.data?.totalDemurrage)}
              {listItem('Container', getApi?.data?.totalContainer)}
              {listItem('Expense', getApi?.data?.totalPayment)}
              {listItem('Pick Up Cost', getApi?.data?.totalPickUpCost)}
              {listItem('Pick Up Price', getApi?.data?.totalPickUpPrice)}
              {listItem('Drop Off Cost', getApi?.data?.totalDropOffCost)}
              {listItem('Drop Off Price', getApi?.data?.totalDropOffPrice)}
              {listItem('Amount', getApi?.data?.totalAmount)}
              {listItem('Receipt', getApi?.data?.totalReceipt)}
            </ol>
            <ol className='list-group mt-3'>
              {listItem('Gross Profit', getApi?.data?.totalGrossProfit)}
              {listItem('Net Profit', getApi?.data?.totalNetProfit)}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
