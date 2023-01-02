import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import { Spinner, Pagination, Message, Confirm, Search } from '../../components'
import {
  inputEmail,
  inputTel,
  inputText,
  staticInputSelect,
} from '../../utils/dynamicForm'
import FormView from '../../components/FormView'
import { FaCheckCircle, FaPenAlt, FaTimesCircle, FaTrash } from 'react-icons/fa'
import apiHook from '../../api'

const Vendors = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const getApi = apiHook({
    key: ['vendors'],
    method: 'GET',
    url: `setting/vendors?page=${page}&q=${q}&limit=${25}`,
  })?.get

  const postApi = apiHook({
    key: ['vendors'],
    method: 'POST',
    url: `setting/vendors`,
  })?.post

  const updateApi = apiHook({
    key: ['vendors'],
    method: 'PUT',
    url: `setting/vendors`,
  })?.put

  const deleteApi = apiHook({
    key: ['vendors'],
    method: 'DELETE',
    url: `setting/vendors`,
  })?.deleteObj

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({})

  useEffect(() => {
    if (postApi?.isSuccess || updateApi?.isSuccess || deleteApi?.isSuccess)
      formCleanHandler()
    getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postApi?.isSuccess, updateApi?.isSuccess, deleteApi?.isSuccess])

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

  const editHandler = (item) => {
    setId(item._id)
    setValue('name', item?.name)
    setValue('mobile', item?.mobile)
    setValue('email', item?.email)
    setValue('address', item?.address)
    setValue('status', item?.status)
    setValue('type', item?.type)

    setEdit(true)
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteApi?.mutateAsync(id)))
  }

  const name = 'Vendors List'
  const label = 'Vendor'
  const modal = 'vendor'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data) => {
    edit
      ? updateApi?.mutateAsync({
          _id: id,
          ...data,
        })
      : postApi?.mutateAsync(data)
  }

  const form = [
    inputText({
      register,
      errors,
      label: 'Name',
      name: 'name',
      placeholder: 'Enter name',
    }),
    inputTel({
      register,
      errors,
      label: 'Mobile',
      name: 'mobile',
      placeholder: 'Enter mobilie',
    }),
    inputEmail({
      register,
      errors,
      label: 'Email',
      name: 'email',
      placeholder: 'Enter email address',
    }),
    inputText({
      register,
      errors,
      label: 'Address',
      name: 'address',
      placeholder: 'Enter address',
    }),
    staticInputSelect({
      register,
      errors,
      label: 'Vendor Type',
      name: 'type',
      placeholder: 'Enter vendor type',
      data: [{ name: 'ship' }, { name: 'track' }, { name: 'government' }],
    }),
    staticInputSelect({
      register,
      errors,
      label: 'Status',
      name: 'status',
      placeholder: 'Enter status',
      data: [{ name: 'active' }, { name: 'inactive' }],
    }),
  ]

  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Vendors</title>
        <meta property='og:title' content='Vendors' key='title' />
      </Head>

      {deleteApi?.isSuccess && (
        <Message variant='success'>{`${label} has been deleted successfully.`}</Message>
      )}
      {deleteApi?.isError && (
        <Message variant='danger'>{deleteApi?.error}</Message>
      )}
      {updateApi?.isSuccess && (
        <Message variant='success'>
          {' '}
          {`${label} has been updated successfully.`}
        </Message>
      )}
      {updateApi?.isError && (
        <Message variant='danger'> {updateApi?.error}</Message>
      )}
      {postApi?.isSuccess && (
        <Message variant='success'>{`${label} has been Created successfully.`}</Message>
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
        isLoadingUpdate={updateApi?.isLoading}
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
              <sup className='fs-6'> [{getApi?.data?.total}] </sup>
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
                placeholder='Search by email'
                setQ={setQ}
                q={q}
                searchHandler={searchHandler}
              />
            </div>
          </div>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Vendor</th>
                <th>Type</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item, i) => (
                <tr key={i}>
                  <td>{item?.name}</td>
                  <td>{item?.type}</td>
                  <td>{item?.mobile}</td>
                  <td>{item?.email}</td>
                  <td>{item?.address}</td>
                  <td>
                    {item?.status === 'active' ? (
                      <FaCheckCircle className='text-success' />
                    ) : (
                      <FaTimesCircle className='text-danger' />
                    )}
                  </td>

                  <td>
                    <div className='btn-group'>
                      <button
                        className='btn btn-primary btn-sm rounded-pill'
                        onClick={() => editHandler(item)}
                        data-bs-toggle='modal'
                        data-bs-target={`#${modal}`}
                      >
                        <FaPenAlt />
                      </button>

                      <button
                        className='btn btn-danger btn-sm ms-1 rounded-pill'
                        onClick={() => deleteHandler(item._id)}
                        disabled={deleteApi?.isLoading}
                      >
                        {deleteApi?.isLoading ? (
                          <span className='spinner-border spinner-border-sm' />
                        ) : (
                          <span>
                            <FaTrash />
                          </span>
                        )}
                      </button>
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

export default dynamic(() => Promise.resolve(withAuth(Vendors)), { ssr: false })
