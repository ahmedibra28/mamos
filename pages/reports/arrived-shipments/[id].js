import React, { useEffect, useState } from 'react'
import useReportsHook from '../../../utils/api/reports'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Message, Spinner } from '../../../components'
import Link from 'next/link'
import useOrdersHook from '../../../utils/api/orders'
import { useForm } from 'react-hook-form'
import { inputTextArea, staticInputSelect } from '../../../utils/dynamicForm'
import FormView from '../../../components/FormView'

const ArrivedBookedShipments = () => {
  const { query } = useRouter()
  const { id } = query

  const [orderId, setOrderId] = useState()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const { getArrivedBookedShipments } = useReportsHook({
    page: 1,
    id,
  })

  const { updateOrderArrivedBuyerStatus } = useOrdersHook({ page: 1 })

  const { data, isLoading, isError, error } = getArrivedBookedShipments
  const {
    isSuccess: isSuccessUpdate,
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateOrderArrivedBuyerStatus

  const form = [
    staticInputSelect({
      register,
      errors,
      label: 'Status',
      name: 'status',
      data: [{ name: 'Received' }, { name: 'No answer' }],
    }),
    inputTextArea({
      register,
      errors,
      label: 'Description',
      name: 'description',
      placeholder: 'Enter description',
    }),
  ]

  const submitHandler = (objData) => {
    mutateAsyncUpdate({ ...objData, _id: orderId })
  }

  const row = false
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-md'

  const label = 'Status'
  const modal = 'status'

  const formCleanHandler = () => {
    reset()
    setOrderId('')
  }

  const editHandler = (item) => {
    setOrderId(item?._id)
    setValue('status', item?.status)
    setValue('description', item?.description)
  }

  useEffect(() => {
    if (isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdate])

  return (
    <>
      <Head>
        <title>Arrived Booked Shipments Report</title>
        <meta
          property='og:title'
          content='Arrived Booked Shipments Report'
          key='title'
        />
      </Head>

      {isSuccessUpdate && (
        <Message variant='success'>
          Order status has been updated successfully
        </Message>
      )}

      {isError && <Message variant='danger'>{error}</Message>}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

      <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={form}
        watch={watch}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={false}
        handleSubmit={handleSubmit}
        submitHandler={submitHandler}
        modal={modal}
        label={label}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='table-responsive bg-light p-3 mt-2'>
          <table className='table table-sm table-border'>
            <thead className='border-0'>
              <tr>
                <th>Buyer Name</th>
                <th>Buyer Mobile</th>
                <th>B. Reference</th>
                <th>Booked Date</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((book) => (
                <tr key={book?._id}>
                  <td>{book?.buyer?.buyerName}</td>
                  <td>{book?.buyer?.buyerMobileNumber}</td>
                  <td>{book?.trackingNo}</td>
                  <td>{book?.createdAt?.slice(0, 10)}</td>
                  <td>
                    <span>
                      {book?.status === 'pending' && (
                        <span className='badge bg-warning'>{book?.status}</span>
                      )}
                      {book?.status === 'confirmed' && (
                        <span className='badge bg-info'>{book?.status}</span>
                      )}
                      {book?.status === 'arrived' && (
                        <span className='badge bg-success'>{book?.status}</span>
                      )}
                      {book?.status === 'cancelled' && (
                        <span className='badge bg-danger'>{book?.status}</span>
                      )}
                    </span>
                  </td>
                  <td>{book?.price?.totalPrice}</td>
                  <th>
                    <div className='btn-group'>
                      <Link href={`/orders/details/${book?._id}`}>
                        <a className='btn btn-warning btn-sm'>Details</a>
                      </Link>
                      <button
                        data-bs-toggle='modal'
                        data-bs-target={`#${modal}`}
                        onClick={() => editHandler(book)}
                        className='btn btn-primary btn-sm ms-2'
                      >
                        Change Status
                      </button>
                    </div>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default ArrivedBookedShipments
