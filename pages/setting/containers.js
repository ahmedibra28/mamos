import React, { useEffect, useState } from 'react'
import Head from 'next/head'
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
} from 'react-icons/fa'

import useContainers from '../../api/containers'

import { CSVLink } from 'react-csv'

import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../../components/Confirm'
import { useForm } from 'react-hook-form'
import { inputCheckBox, inputText, inputNumber } from '../../utils/dynamicForm'

const Container = () => {
  const { getContainers, updateContainer, addContainer, deleteContainer } =
    useContainers()
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

  const { data, isLoading, isError, error } = getContainers

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateContainer

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deleteContainer

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = addContainer

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

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const submitHandler = async (data) => {
    edit
      ? updateMutateAsync({
          _id: id,
          name: data.name,
          height: data.height,
          width: data.width,
          length: data.length,
          isActive: data.isActive,
          payloadCapacity: data.payloadCapacity,
        })
      : addMutateAsync(data)
  }

  const editHandler = (container) => {
    setId(container._id)
    setEdit(true)
    setValue('name', container.name)
    setValue('height', container.height)
    setValue('width', container.width)
    setValue('length', container.length)
    setValue('name', container.name)
    setValue('isActive', container.isActive)
    setValue('payloadCapacity', container.payloadCapacity)
  }

  const toUpper = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <>
      <Head>
        <title>Container</title>
        <meta property='og:title' content='Container' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Container has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessAdd && (
        <Message variant='success'>
          Container has been Created successfully.
        </Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>
          Container has been deleted successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      <div
        className='modal fade'
        id='editContainerModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editContainerModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editContainerModalLabel'>
                {edit ? 'Edit Container' : 'Add Container'}
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
                  <div className='row'>
                    <div className='col-md-6 col-12'>
                      {inputText({
                        register,
                        label: 'Name',
                        errors,
                        name: 'name',
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {inputNumber({
                        register,
                        label: 'Length',
                        errors,
                        name: 'length',
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {inputNumber({
                        register,
                        label: 'Width',
                        errors,
                        name: 'width',
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {inputNumber({
                        register,
                        label: 'Height',
                        errors,
                        name: 'height',
                      })}
                    </div>
                    <div className='col-12'>
                      {inputNumber({
                        register,
                        label: 'Payload Capacity',
                        errors,
                        name: 'payloadCapacity',
                      })}
                    </div>
                    <div className='col-12'>
                      {inputCheckBox({
                        register,
                        errors,
                        label: 'isActive',
                        name: 'isActive',
                        isRequired: false,
                      })}
                    </div>
                  </div>
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
          data-bs-target='#editContainerModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data : []} filename='container.csv'>
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
          <h3 className='fw-light font-monospace'>Containers</h3>
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
                  <th>Name</th>
                  <th>CBM</th>
                  <th>Payload Capacity</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((container) => (
                    <tr key={container._id}>
                      <td>{toUpper(container.name)}</td>
                      <td>
                        {(
                          container.length *
                          container.width *
                          container.height *
                          0.000001
                        ).toFixed(0)}{' '}
                        CBM<sup>3</sup>
                      </td>
                      <td>
                        Fits up to {container.payloadCapacity} &{' '}
                        {(
                          container.length *
                          container.width *
                          container.height *
                          0.000001
                        ).toFixed(0)}{' '}
                        CBM<sup>3</sup>
                      </td>
                      <td>
                        {container.isActive ? (
                          <FaCheckCircle className='text-success mb-1' />
                        ) : (
                          <FaTimesCircle className='text-danger mb-1' />
                        )}
                      </td>

                      <td className='btn-container'>
                        <button
                          className='btn btn-primary btn-sm rounded-pill '
                          onClick={() => editHandler(container)}
                          data-bs-toggle='modal'
                          data-bs-target='#editContainerModal'
                        >
                          <FaPenAlt />
                        </button>

                        <button
                          className='btn btn-danger btn-sm rounded-pill ms-1'
                          onClick={() => deleteHandler(container._id)}
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
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Container)), {
  ssr: false,
})
