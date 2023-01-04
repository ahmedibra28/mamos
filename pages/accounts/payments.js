import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import { Spinner, Message } from '../../components'
import {
  dynamicInputSelect,
  inputEmail,
  inputNumber,
  inputText,
} from '../../utils/dynamicForm'
import FormView from '../../components/FormView'
import { FaCashRegister, FaInfoCircle } from 'react-icons/fa'
import apiHook from '../../api'
import Link from 'next/link'

const Payments = () => {
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)

  const getApi = apiHook({
    key: ['payments'],
    method: 'GET',
    url: `accounts/payments`,
  })?.get

  const getAccountApi = apiHook({
    key: ['accounts'],
    method: 'GET',
    url: `accounts/accounts`,
    url: `accounts/accounts?page=${1}&q=&limit=${250}`,
  })?.get

  const getVendorApi = apiHook({
    key: ['vendors'],
    method: 'GET',
    url: `setting/vendors?page=${1}&q=&limit=${250}`,
  })?.get

  const updateApi = apiHook({
    key: ['payments'],
    method: 'PUT',
    url: `accounts/payments`,
  })?.put

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({})

  useEffect(() => {
    if (updateApi?.isSuccess) formCleanHandler()
    getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateApi?.isSuccess])

  const editHandler = (item) => {
    setId(item._id)
    setValue('name', item?.name)
    setValue('email', item?.email)
    setValue('type', item?.type)
    setValue('totalAmount', item?.totalAmount)
    setEdit(true)
  }

  const name = 'Payable List'
  const label = 'Payment'
  const modal = 'payment'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data) => {
    edit
      ? updateApi?.mutateAsync({
          _id: id,
          totalAmount: data?.totalAmount,
          account: data?.account,
          amount: data?.amount,
          status: 'payments',
        })
      : updateApi?.mutateAsync({
          _id: data?.vendor,
          account: data?.account,
          amount: data?.amount,
          vendor: data?.vendor,
          status: 'accounts payable',
        })
  }

  const form = [
    edit &&
      inputText({
        register,
        errors,
        label: 'Name',
        name: 'name',
        placeholder: 'Enter name',
        disabled: true,
      }),
    edit &&
      inputEmail({
        register,
        errors,
        label: 'Email',
        name: 'email',
        placeholder: 'Enter email address',
        disabled: true,
      }),
    edit &&
      inputText({
        register,
        errors,
        label: 'Total Amount',
        name: 'totalAmount',
        placeholder: 'Enter total amount',
        disabled: true,
      }),
    !edit &&
      dynamicInputSelect({
        register,
        errors,
        label: 'Vendor',
        name: 'vendor',
        placeholder: 'Select vendor',
        value: 'name',
        data: getVendorApi?.data?.data?.filter(
          (v) => v.status === 'active' && v.type === 'government'
        ),
      }),
    dynamicInputSelect({
      register,
      errors,
      label: 'Account',
      name: 'account',
      placeholder: 'Select account',
      value: 'name',
      data: getAccountApi?.data?.data?.filter((acc) =>
        acc.status === 'active' && edit
          ? acc.type === 'custom'
          : acc.code === 21000
      ),
    }),
    inputNumber({
      register,
      errors,
      label: 'Amount',
      name: 'amount',
      placeholder: 'Enter amount',
      max: watch().totalAmount,
    }),
  ]

  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Payments</title>
        <meta property='og:title' content='Payments' key='title' />
      </Head>

      {updateApi?.isSuccess && (
        <Message variant='success'>
          {`${label} has been updated successfully.`}
        </Message>
      )}
      {updateApi?.isError && (
        <Message variant='danger'> {updateApi?.error}</Message>
      )}

      <FormView
        edit={edit}
        formCleanHandler={formCleanHandler}
        form={form}
        isLoadingUpdate={updateApi?.isLoading}
        isLoadingPost={false}
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
              <sup className='fs-6'> [{getApi?.data?.length}] </sup>
            </h3>
            <button
              className='btn btn-outline-primary btn-sm shadow my-2'
              data-bs-toggle='modal'
              data-bs-target={`#${modal}`}
            >
              Add New {label}
            </button>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Vendor/Customer</th>
                <th>Email</th>
                <th>Type</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.map((item, i) => (
                <tr key={i}>
                  <td>{item?.name}</td>
                  <td>{item?.email}</td>
                  <td>
                    <span className='bg-warning badge'>{item?.type}</span>
                  </td>
                  <td>
                    {item?.totalAmount?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>

                  <td>
                    <div className='btn-group'>
                      <button
                        className='btn btn-primary btn-sm rounded-pill'
                        onClick={() => editHandler(item)}
                        data-bs-toggle='modal'
                        data-bs-target={`#${modal}`}
                      >
                        <FaCashRegister className='mb-1' /> Pay
                      </button>
                      <Link
                        className='btn btn-success btn-sm rounded-pill ms-1'
                        href={`/accounts/transactions/${item?._id}`}
                      >
                        <FaInfoCircle className='mb-1' /> Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Payments)), {
  ssr: false,
})
