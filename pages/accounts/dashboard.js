import React from 'react'
import apiHook from '../../api'

import { Message, Spinner } from '../../components'

const Accounts = () => {
  const getApi = apiHook({
    key: ['accounts-dashboard'],
    method: 'GET',
    url: `accounts/dashboard`,
  })?.get

  return (
    <div>
      <h5 className='text-center fw-bold'>Profit & Loss Statement</h5>
      <p className='text-center'>
        For the period from 01/01/2022 to 31/12/2022
      </p>
      <hr />

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant='danger'>{getApi?.error}</Message>
      ) : (
        <div className='row gy-3'>
          {getApi?.data?.map((accT, i) => (
            <div key={i} className='col-lg-4 col-md-6 col-12'>
              <div className='card'>
                <div
                  className='card-header bg-primary text-light py-3 fw-bold d-flex justify-content-between'
                  style={{ fontSize: '80%' }}
                >
                  <span>{accT?.accountType?.toUpperCase()}</span>
                  <span>
                    {accT?.totalAmountAccounts?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>
                </div>
                <ul
                  className='list-group list-group-flush border-0'
                  style={{ fontSize: '80%' }}
                >
                  {accT?.accounts?.map((acc, i) => (
                    <li
                      key={i}
                      className='list-group-item d-flex justify-content-between border-0'
                    >
                      <span> {acc.name}</span>
                      <span>
                        {acc.totalAmountTransactions?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Accounts
