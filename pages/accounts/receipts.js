import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import { Spinner, Message, Pagination, Search } from '../../components'
import { dynamicInputSelect, inputNumber } from '../../utils/dynamicForm'
import FormView from '../../components/FormView'
import apiHook from '../../api'
import { currency } from '../../utils/currency'
import moment from 'moment'

const Receipts = () => {
  const [edit, setEdit] = useState(false)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({})

  const getApi = apiHook({
    key: ['receipts'],
    method: 'GET',
    url: `accounts/receipts?page=${page}&q=${q}&limit=${25}`,
  })?.get

  const postApi = apiHook({
    key: ['receipts'],
    method: 'POST',
    url: `accounts/receipts`,
  })?.post

  const postSearchCustomerApi = apiHook({
    key: ['search-customer', watch().customer],
    method: 'POST',
    url: `accounts/search-customer`,
  })?.post

  useEffect(() => {
    if (watch().customer) {
      postSearchCustomerApi.mutateAsync({ customer: watch().customer })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch().customer])

  const getCustomerApi = apiHook({
    key: ['customers'],
    method: 'GET',
    url: `auth/users?page=${1}&q=&limit=${250}`,
  })?.get

  const name = 'Receipt List'
  const label = 'Receipt'
  const modal = 'receipt'

  // FormView
  const formCleanHandler = () => {
    reset()

    setEdit(false)
  }

  useEffect(() => {
    if (postApi?.isSuccess) {
      formCleanHandler()
      getApi?.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postApi?.isSuccess])

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

  const submitHandler = (data) => {
    postApi?.mutateAsync({
      _id: data?.customer,
      amount: data?.amount,
    })
  }

  const form = [
    dynamicInputSelect({
      register,
      errors,
      label: 'Customer',
      name: 'customer',
      placeholder: 'Select customer',
      value: 'name',
      data: getCustomerApi?.data?.data?.filter(
        (v) => v.confirmed && !v.blocked
      ),
    }),
    postSearchCustomerApi?.data?.amount > 0 &&
      postSearchCustomerApi?.data?.customer &&
      watch().customer && (
        <div className='col-12'>
          <div className='border p-3 mb-2 mt-1'>
            <div className='mb-1'>
              <span className='text-muted'>Customer: </span>
              <span className='fw-bold text-muted'>
                {postSearchCustomerApi?.data?.customer}
              </span>
            </div>
            <div className='mb-1'>
              <span className='text-muted'>Amount: </span>
              <span className='fw-bold text-muted'>
                {currency(postSearchCustomerApi?.data?.amount)}
              </span>
            </div>
          </div>
        </div>
      ),
    inputNumber({
      register,
      errors,
      label: 'Amount',
      name: 'amount',
      placeholder: 'Enter amount',
      max: Number(postSearchCustomerApi?.data?.amount),
    }),
  ]

  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Receipts</title>
        <meta property='og:title' content='Receipts' key='title' />
      </Head>

      {postApi?.isSuccess && (
        <Message variant='success'>
          {`${label} has been paid successfully.`}
        </Message>
      )}
      {postApi?.isError && (
        <Message variant='danger'> {postApi?.error}</Message>
      )}

      <div className='ms-auto text-end'>
        <Pagination data={getApi?.data} setPage={setPage} />
      </div>

      <FormView
        edit={edit}
        formCleanHandler={formCleanHandler}
        form={form}
        isLoadingUpdate={false}
        isLoadingPost={postApi?.isLoading}
        handleSubmit={handleSubmit}
        submitHandler={submitHandler}
        modal={modal}
        label={label}
        modalSize={modalSize}
      />

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant='danger'> {getApi?.error} </Message>
      ) : (
        <div className='table-responsive bg-light p-3 mt-2'>
          <div className='d-flex align-items-center flex-column mb-2'>
            <h3 className='fw-light text-muted'>
              {name}
              <sup className='fs-6'> [{getApi?.data?.total || 0}] </sup>
            </h3>
            <button
              className='btn btn-outline-primary btn-sm shadow my-2'
              data-bs-toggle='modal'
              data-bs-target={`#${modal}`}
            >
              Add New {label}
            </button>

            <div className='col-auto'>
              <Search
                placeholder={`Search ${label}...`}
                setQ={setQ}
                q={q}
                searchHandler={searchHandler}
              />
            </div>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Customer/Customer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item, i) => (
                <tr key={i}>
                  <td>{item?.createdBy?.name}</td>
                  <td>
                    <span className='bg-warning badge'>{item?.type}</span>
                  </td>
                  <td>{moment(item?.createdAt).format('YYYY-MM-DD')}</td>
                  <td>{currency(item?.amount)}</td>
                  <td>{item?.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Receipts)), {
  ssr: false,
})
