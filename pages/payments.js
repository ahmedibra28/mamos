import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
import {
  FaCheckCircle,
  FaFileDownload,
  FaPenAlt,
  FaPlus,
  FaDollarSign,
  FaTrash,
} from 'react-icons/fa'
import moment from 'moment'
import usePayments from '../api/payments'

import { CSVLink } from 'react-csv'

import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../components/Confirm'
import { useForm } from 'react-hook-form'
import { inputCheckBox, inputNumber, inputText } from '../utils/dynamicForm'

const Payment = () => {
  const { getPayments, updatePayment, addPayment, deletePayment } =
    usePayments()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
    },
  })

  const { data, isLoading, isError, error } = getPayments

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updatePayment

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deletePayment

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = addPayment

  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)

  const formCleanHandler = () => {
    setEdit(false)
    reset()
  }

  useEffect(() => {
    if (isSuccessAdd || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessAdd, isSuccessUpdate])

  const deleteHandler = ({ paymentId, subPaymentId }) => {
    confirmAlert(Confirm(() => deleteMutateAsync({ paymentId, subPaymentId })))
  }

  const submitHandler = async (data) => {
    edit
      ? updateMutateAsync({
          _id: id,
          amount: data.subAmount,
        })
      : addMutateAsync(data)
  }

  const editHandler = (payment) => {
    setId(payment._id)
    setEdit(true)
    setValue('amount', payment.amount)
  }

  return (
    <>
      <Head>
        <title>Payment</title>
        <meta property='og:title' content='Payment' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Payment has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessAdd && (
        <Message variant='success'>
          Payment has been Created successfully.
        </Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>
          Payment has been deleted successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      <div
        className='modal fade'
        id='editPaymentModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editPaymentModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editPaymentModalLabel'>
                {edit ? 'Edit Payment' : 'Add Payment'}
              </h3>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
                onClick={formCleanHandler}
              ></button>
            </div>
            <div className='modal-body'>
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
                <form onSubmit={handleSubmit(submitHandler)}>
                  {inputNumber({
                    register,
                    label: 'Amount',
                    errors,
                    name: 'subAmount',
                  })}

                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary '
                      data-bs-dismiss='modal'
                      onClick={formCleanHandler}
                    >
                      Close
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary '
                      disabled={isLoadingAdd || isLoadingUpdate}
                    >
                      {isLoadingAdd || isLoadingUpdate ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='position-relative'>
        <button
          className='btn btn-primary position-fixed rounded-3 animate__bounceIn'
          style={{
            bottom: '20px',
            right: '25px',
          }}
          data-bs-toggle='modal'
          data-bs-target='#editPaymentModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data : []} filename='payment.csv'>
          <button
            className='btn btn-success position-fixed rounded-3 animate__bounceIn'
            style={{
              bottom: '60px',
              right: '25px',
            }}
          >
            <FaFileDownload className='mb-1' />
          </button>
        </CSVLink>
      </div>

      <div className='row mt-2'>
        <div className='col-md-4 col-6 me-auto'>
          <h3 className='fw-light font-monospace'>Payments</h3>
        </div>
      </div>

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
                  <th>Order#</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((payment) => (
                    <>
                      <tr key={payment._id}>
                        <td>{payment.order._id}</td>
                        <td>
                          {payment.order && payment.order.buyer.buyerName}
                        </td>
                        <td>
                          {payment.order &&
                            payment.order.buyer.buyerMobileNumber}
                        </td>
                        <td>{payment.paymentMethod}</td>
                        <td>
                          $
                          {payment.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        <td className='btn-payment'>
                          <button
                            className='btn btn-success btn-sm rounded-pill '
                            onClick={() => editHandler(payment)}
                            data-bs-toggle='modal'
                            data-bs-target='#editPaymentModal'
                          >
                            <FaDollarSign />
                          </button>
                        </td>
                      </tr>

                      {payment.payments.length > 0 &&
                        payment.payments.map((p) => (
                          <>
                            <tr key={p._id}>
                              <td colSpan={3}></td>
                              <td className='text-primary'>
                                {moment(p.date).format('ll')}
                              </td>
                              <td className='text-primary'>
                                $
                                {p.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td>
                                <button
                                  className='btn btn-danger btn-sm rounded-pill ms-1'
                                  onClick={() =>
                                    deleteHandler({
                                      paymentId: payment._id,
                                      subPaymentId: p._id,
                                    })
                                  }
                                  disabled={isLoadingDelete}
                                >
                                  {isLoadingDelete ? (
                                    <span className='spinner-border spinner-border-sm' />
                                  ) : (
                                    <span>
                                      {' '}
                                      <FaTrash />
                                    </span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          </>
                        ))}
                      {payment.payments.length > 0 && (
                        <tr>
                          <td colSpan={3}></td>
                          <td className='fw-bold'>Balance</td>
                          <td className='fw-bold text-danger'>
                            $
                            {(
                              payment.amount -
                              payment.payments.reduce(
                                (acc, cur) => (acc += cur.amount),
                                0
                              )
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Payment)), {
  ssr: false,
})
