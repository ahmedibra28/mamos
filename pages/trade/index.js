import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import {
  FaCheckCircle,
  FaFileDownload,
  FaPenAlt,
  FaPlus,
  FaTimesCircle,
  FaTrash,
  FaPlusCircle,
  FaInfoCircle,
  FaShareAlt,
  FaMinusCircle,
  FaCheckDouble,
} from 'react-icons/fa'

import useTrades from '../../api/trades'
import { useForm } from 'react-hook-form'
import { CSVLink } from 'react-csv'
import moment from 'moment'
import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../../components/Confirm'
import { inputFile, inputTextArea } from '../../utils/dynamicForm'
import { Access, UnlockAccess } from '../../utils/UnlockAccess'

const Trade = () => {
  const [duration, setDuration] = useState(1)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const {
    getTrades,
    updateTrade,
    addTrade,
    deleteTrade,
    updateTradeToAgreed,
    updateTradeToComplete,
  } = useTrades()

  const { data, isLoading, isError, error } = getTrades

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateTrade

  const {
    isLoading: isLoadingAgreed,
    isError: isErrorAgreed,
    error: errorAgreed,
    isSuccess: isSuccessAgreed,
    mutateAsync: agreedMutateAsync,
  } = updateTradeToAgreed

  const {
    isLoading: isLoadingComplete,
    isError: isErrorComplete,
    error: errorComplete,
    isSuccess: isSuccessComplete,
    mutateAsync: completeMutateAsync,
  } = updateTradeToComplete

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deleteTrade

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = addTrade

  const [edit, setEdit] = useState(false)
  const [file, setFile] = useState([])
  const [trade, setTrade] = useState({})

  const formCleanHandler = () => {
    setEdit(false)
    setTrade({})
    reset()
  }

  useEffect(() => {
    if (isSuccessAdd || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessAdd, isSuccessUpdate])

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const submitHandler = async (data) => {
    const formData = new FormData()

    for (let i = 0; i < data.file.length; i++) {
      formData.append('file', data.file[i])
    }
    formData.append('description', data.description)

    addMutateAsync(formData)
  }

  const editHandler = (trade) => {
    setTrade(trade)
    setEdit(true)
  }

  return (
    <>
      <Head>
        <title>Trade</title>
        <meta property='og:title' content='Trade' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Trade has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessAgreed && (
        <Message variant='success'>Trade has been agreed successfully.</Message>
      )}
      {isErrorAgreed && <Message variant='danger'>{errorAgreed}</Message>}
      {isSuccessComplete && (
        <Message variant='success'>
          Trade has been completed successfully.
        </Message>
      )}
      {isErrorComplete && <Message variant='danger'>{errorComplete}</Message>}
      {isSuccessAdd && (
        <Message variant='success'>
          Trade has been Created successfully.
        </Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>
          Trade has been deleted successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      <div
        className='modal fade'
        id='editTradeModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editTradeModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editTradeModalLabel'>
                {edit ? 'Trade Details' : 'Add Trade'}
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
                  {!edit &&
                    inputFile({
                      register,
                      errors,
                      name: 'file',
                      label: 'File',
                      isRequired: false,
                      setFile,
                    })}

                  {!edit &&
                    inputTextArea({
                      register,
                      errors,
                      name: 'description',
                      label: 'Description',
                    })}

                  {/* display trade details here */}
                  {edit && trade && (
                    <div className='row gy-3'>
                      <div className='col-12'>
                        {/* customer name */}
                        <div>
                          <span className='fw-bold'>Customer Name:</span>
                          <br />
                          <span>{trade.createdBy.name}</span>
                        </div>

                        <div>
                          <span className='fw-bold'>Order Date:</span>
                          <br />
                          <span>{moment(trade.createdAt).format('ll')}</span>
                        </div>

                        <div>
                          <span className='fw-bold'>Description & Links:</span>
                          <br />
                          <span>{trade.description}</span>
                        </div>

                        {trade.files && (
                          <div>
                            {trade.files.map((file, index) => (
                              <div key={index}>
                                <Image
                                  className='img-fluid'
                                  width='300'
                                  height='300'
                                  src={file.filePath}
                                  alt={file.fullFileName}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <hr />
                  <h3>Evaluations</h3>
                  {edit && trade && (
                    <div className='row gy-3'>
                      <div className='col-12'>{trade.evaluation}</div>
                    </div>
                  )}

                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary '
                      data-bs-dismiss='modal'
                      onClick={formCleanHandler}
                    >
                      Close
                    </button>
                    {!edit && (
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
                    )}
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
          data-bs-target='#editTradeModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data : []} filename='trade.csv'>
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
          <h3 className='fw-light font-monospace'>Trades</h3>
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
                  <th>Customer</th>
                  <th>Status</th>
                  <th>DateTime</th>
                  {UnlockAccess(Access.trade) && trade.status === 'pending' && (
                    <th>Days</th>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((trade) => (
                    <tr key={trade._id}>
                      <td>{trade.createdBy.name}</td>
                      <td>
                        {trade.status === 'pending' ? (
                          <span className='badge bg-warning'>
                            {trade.status}
                          </span>
                        ) : trade.status === 'accepted' ? (
                          <span className='badge bg-success'>
                            {trade.status} {trade.employee && <FaShareAlt />}
                          </span>
                        ) : trade.status == 'evaluated' ? (
                          <span className='badge bg-info'>{trade.status}</span>
                        ) : trade.status === 'agreed' ? (
                          <span className='badge bg-primary'>
                            {trade.status}
                          </span>
                        ) : (
                          trade.status === 'completed' && (
                            <span className='badge bg-success'>
                              {trade.status}
                            </span>
                          )
                        )}{' '}
                        {trade.status === 'evaluated'
                          ? trade.evaluation
                          : trade.descriptionStatus}
                      </td>
                      <td>{moment(trade.createdAt).format('lll')}</td>
                      {UnlockAccess(Access.trade) &&
                        trade.status === 'pending' && (
                          <th>
                            <FaMinusCircle
                              className='text-danger'
                              onClick={() =>
                                setDuration(duration === 1 ? 1 : duration - 1)
                              }
                            />
                            <button className='btn btn-light btn-sm rounded-pill mx-1'>
                              {duration}
                            </button>
                            <FaPlusCircle
                              className='text-success'
                              onClick={() => setDuration(duration + 1)}
                            />
                          </th>
                        )}

                      <td className='btn-trade'>
                        <button
                          className='btn btn-primary btn-sm rounded-pill '
                          onClick={() => editHandler(trade)}
                          data-bs-toggle='modal'
                          data-bs-target='#editTradeModal'
                        >
                          <FaInfoCircle />
                        </button>

                        {UnlockAccess(Access.trade) &&
                          trade.status === 'pending' && (
                            <button
                              className='btn btn-success btn-sm rounded-pill ms-1'
                              onClick={() =>
                                updateMutateAsync({
                                  _id: trade._id,
                                  status: 'accepted',
                                  duration,
                                })
                              }
                            >
                              <FaCheckCircle />
                            </button>
                          )}

                        {trade.status === 'pending' && (
                          <button
                            className='btn btn-danger btn-sm rounded-pill ms-1'
                            onClick={() => deleteHandler(trade._id)}
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
                        )}

                        {UnlockAccess(Access.trade) &&
                          trade.status === 'accepted' && (
                            <Link href={`trade/${trade._id}`}>
                              <a className='btn btn-secondary btn-sm rounded-pill ms-1'>
                                <FaShareAlt />
                              </a>
                            </Link>
                          )}

                        {UnlockAccess(Access.user) &&
                          trade.status === 'evaluated' && (
                            <button
                              className='btn btn-success btn-sm rounded-pill ms-1'
                              disabled={isLoadingAgreed}
                              onClick={() =>
                                agreedMutateAsync({
                                  _id: trade._id,
                                  status: 'agreed',
                                })
                              }
                            >
                              <FaCheckCircle />
                            </button>
                          )}

                        {UnlockAccess(Access.trade) &&
                          trade.status === 'agreed' && (
                            <button
                              className='btn btn-success btn-sm rounded-pill ms-1'
                              disabled={isLoadingComplete}
                              onClick={() =>
                                completeMutateAsync({
                                  _id: trade._id,
                                  status: 'completed',
                                })
                              }
                            >
                              <FaCheckDouble />
                            </button>
                          )}
                      </td>
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

export default dynamic(() => Promise.resolve(withAuth(Trade)), {
  ssr: false,
})
