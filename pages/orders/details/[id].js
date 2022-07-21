import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import useOrdersHook from '../../../utils/api/orders'
import { Spinner, Message } from '../../../components'
import { useRouter } from 'next/router'
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaExclamationCircle,
} from 'react-icons/fa'
import moment from 'moment'
import FormView from '../../../components/FormView'
import {
  inputCheckBox,
  inputEmail,
  inputFile,
  inputTel,
  inputText,
  staticInputSelect,
} from '../../../utils/dynamicForm'
import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import useUploadHook from '../../../utils/api/upload'

const Details = () => {
  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails } = useOrdersHook({
    id,
  })
  const [file, setFile] = useState('')
  const [fileLink, setFileLink] = useState(null)

  const { postUpload } = useUploadHook()

  const { data, isLoading, isError, error } = getOrderDetails

  const {
    data: dataUpload,
    isLoading: isLoadingUpload,
    isError: isErrorUpload,
    error: errorUpload,
    mutateAsync: mutateAsyncUpload,
    isSuccess: isSuccessUpload,
  } = postUpload

  useEffect(() => {
    if (isSuccessUpload) {
      setFileLink(
        dataUpload &&
          dataUpload.filePaths &&
          dataUpload.filePaths[0] &&
          dataUpload.filePaths[0].path
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpload])

  useEffect(() => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      mutateAsyncUpload({ type: 'file', formData })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  const confirmOrderHandler = () => {
    console.log({ status: 'Order has been confirmed' })
  }
  const editBuyerHandler = () => {
    setValueBuyer('buyerName', data?.buyer?.buyerName)
    setValueBuyer('buyerMobileNumber', data?.buyer?.buyerMobileNumber)
    setValueBuyer('buyerEmail', data?.buyer?.buyerEmail)
    setValueBuyer('buyerAddress', data?.buyer?.buyerAddress)
  }
  const editPickUpHandler = () => {
    setValuePickUp('pickUpWarehouse', data?.pickUp?.pickUpWarehouse)
    setValuePickUp('pickUpCity', data?.pickUp?.pickUpCity)
    setValuePickUp('pickUpAddress', data?.pickUp?.pickUpAddress)
  }
  const editDropOffHandler = () => {
    setValueDropOff('dropOffWarehouse', data?.dropOff?.dropOffWarehouse)
    setValueDropOff('dropOffCity', data?.dropOff?.dropOffCity)
    setValueDropOff('dropOffAddress', data?.dropOff?.dropOffAddress)
  }
  const editOtherHandler = () => {
    setValueOther('importExport', data?.other?.importExport)
  }

  const {
    register: registerBuyer,
    handleSubmit: handleSubmitBuyer,
    watch: watchBuyer,
    setValue: setValueBuyer,
    reset: resetBuyer,
    formState: { errors: errorsBuyer },
  } = useForm({
    defaultValues: {},
  })

  const {
    register: registerPickUp,
    handleSubmit: handleSubmitPickUp,
    watch: watchPickUp,
    setValue: setValuePickUp,
    reset: resetPickUp,
    formState: { errors: errorsPickUp },
  } = useForm({
    defaultValues: {},
  })

  const {
    register: registerDropOff,
    handleSubmit: handleSubmitDropOff,
    watch: watchDropOff,
    setValue: setValueDropOff,
    reset: resetDropOff,
    formState: { errors: errorsDropOff },
  } = useForm({
    defaultValues: {},
  })

  const {
    register: registerOther,
    handleSubmit: handleSubmitOther,
    watch: watchOther,
    setValue: setValueOther,
    reset: resetOther,
    formState: { errors: errorsOther },
  } = useForm({
    defaultValues: {},
  })

  const formBuyer = [
    inputText({
      register: registerBuyer,
      errors: errorsBuyer,
      label: 'Name',
      name: 'buyerName',
      placeholder: 'Enter name',
    }),
    inputTel({
      register: registerBuyer,
      errors: errorsBuyer,
      label: 'Mobile',
      name: 'buyerMobileNumber',
      placeholder: 'Enter mobile',
    }),
    inputEmail({
      register: registerBuyer,
      errors: errorsBuyer,
      label: 'Email',
      name: 'buyerEmail',
      placeholder: 'Enter email',
    }),
    inputText({
      register: registerBuyer,
      errors: errorsBuyer,
      label: 'Address',
      name: 'buyerAddress',
      placeholder: 'Enter address',
    }),
  ]

  const formPickUp = [
    inputText({
      register: registerPickUp,
      errors: errorsPickUp,
      label: 'Warehouse',
      name: 'pickUpWarehouse',
      placeholder: 'Enter warehouse',
    }),
    inputText({
      register: registerPickUp,
      errors: errorsPickUp,
      label: 'City',
      name: 'pickUpCity',
      placeholder: 'Enter city',
    }),
    inputText({
      register: registerPickUp,
      errors: errorsPickUp,
      label: 'Address',
      name: 'pickUpAddress',
      placeholder: 'Enter address',
    }),
  ]

  const formDropOff = [
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Warehouse',
      name: 'pickUpWarehouse',
      placeholder: 'Enter warehouse',
    }),
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'City',
      name: 'pickUpCity',
      placeholder: 'Enter city',
    }),
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Address',
      name: 'pickUpAddress',
      placeholder: 'Enter address',
    }),
  ]

  const formOther = [
    staticInputSelect({
      register: registerOther,
      errors: errorsOther,
      label: 'Import/Export',
      name: 'importExport',
      data: [{ name: 'Import' }, { name: 'Export' }],
    }),
    inputCheckBox({
      register: registerOther,
      errors: errorsOther,
      name: 'isTemperatureControlled',
      isRequired: false,
      label:
        'My cargo is not temperature-controlled and does not include any hazardous or personal goods',
    }),
    inputCheckBox({
      register: registerOther,
      errors: errorsOther,
      name: 'isHasInvoice',
      label: 'Do you have an invoice?',
      isRequired: false,
    }),

    watchOther().isHasInvoice &&
      inputFile({
        register: registerOther,
        errors: errorsOther,
        name: 'invoiceFile',
        label: 'Upload Invoice',
        setFile,
      }),
  ]

  const row = false
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-md'

  const labelBuyer = 'Buyer'
  const modalBuyer = 'buyer'

  const labelPickUp = 'Pick-up'
  const modalPickUp = 'pickUp'

  const labelDropOff = 'Drop-off'
  const modalDropOff = 'dropOff'

  const labelOther = 'Other'
  const modalOther = 'other'

  const formCleanHandler = () => {
    resetBuyer()
    resetPickUp()
    resetDropOff()
    resetOther()
  }

  // useEffect(() => {
  //   if (isSuccessUpdate) formCleanHandler()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSuccessUpdate])

  const isLoadingUpdate = false
  const isLoadingPost = false

  const submitHandlerBuyer = (data) => {
    console.log(data)
  }
  const submitHandlerPickUp = (data) => {
    console.log(data)
  }

  const submitHandlerDropOff = (data) => {
    console.log(data)
  }
  const submitHandlerOther = (data) => {
    console.log({ ...data, fileLink })
    // mutateAsyncPost({
    //   ...data,
    //   transportation: selectedTransportation,
    //   containerFCL: selectContainer,
    //   containerLCL: inputFields,
    //   invoice: fileLink,
    // })
  }

  return (
    <>
      <Head>
        <title>Booking Details {data?.trackingNo}</title>
        <meta
          property='og:title'
          content={`Booking Details ${data?.trackingNo}`}
          key='title'
        />
      </Head>

      {isErrorUpload && <Message variant='danger'>{errorUpload}</Message>}

      {/* Buyer Modal Form */}
      <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formBuyer}
        watch={watchBuyer}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={isLoadingPost}
        handleSubmit={handleSubmitBuyer}
        submitHandler={submitHandlerBuyer}
        modal={modalBuyer}
        label={labelBuyer}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {/* PickUp Modal Form */}
      <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formPickUp}
        watch={watchPickUp}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={isLoadingPost}
        handleSubmit={handleSubmitPickUp}
        submitHandler={submitHandlerPickUp}
        modal={modalPickUp}
        label={labelPickUp}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {/* DropOff Modal Form */}
      <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formDropOff}
        watch={watchDropOff}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={isLoadingPost}
        handleSubmit={handleSubmitDropOff}
        submitHandler={submitHandlerDropOff}
        modal={modalDropOff}
        label={labelDropOff}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {/* Other Modal Form */}
      <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formOther}
        watch={watchOther}
        isLoadingUpdate={isLoadingUpload}
        isLoadingPost={isLoadingPost}
        handleSubmit={handleSubmitOther}
        submitHandler={submitHandlerOther}
        modal={modalOther}
        label={labelOther}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='bg-light p-3 my-2'>
          <div className='alert alert-warning'>
            <FaExclamationCircle className='mb-1 me-2' />
            You can not edit this order after confirmed
          </div>
          {data?.status === 'pending' && (
            <button
              onClick={() => confirmOrderHandler()}
              className='btn btn-outline-success float-end'
            >
              <FaCheckCircle className='mb-1' /> Confirm Order
            </button>
          )}
          <div className='row'>
            <div className='col-md-6 col-12'>
              {/* Order Info */}
              <div className='mb-4'>
                {data?.other && <h4 className='fw-bold'>ORDER DETAILS</h4>}
                {data?.trackingNo && (
                  <div>
                    <span className='fw-bold'>Tracking No: </span>
                    <span>{data?.trackingNo} </span>
                  </div>
                )}
                {data?.createdBy && (
                  <div>
                    <span className='fw-bold'>Ordered By: </span>
                    <span>{data?.createdBy?.name} </span>
                  </div>
                )}
                {data?.status && (
                  <div>
                    <span className='fw-bold'>Status: </span>
                    <span>
                      {data?.status === 'pending' && (
                        <span className='badge bg-warning'>{data?.status}</span>
                      )}
                      {data?.status === 'confirmed' && (
                        <span className='badge bg-success'>{data?.status}</span>
                      )}
                      {data?.status === 'deleted' && (
                        <span className='badge bg-danger'>{data?.status}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Buyer Info */}
              <div className='mb-4'>
                {data?.buyer && (
                  <h4 className='fw-bold'>
                    BUYER DETAILS
                    {data?.status === 'pending' && (
                      <FaEdit
                        data-bs-toggle='modal'
                        data-bs-target={`#${modalBuyer}`}
                        onClick={editBuyerHandler}
                        className='mb-1 text-warning ms-2'
                      />
                    )}
                  </h4>
                )}
                {data?.buyer?.buyerName && (
                  <div>
                    <span className='fw-bold'>Name: </span>
                    <span>{data?.buyer?.buyerName} </span>
                  </div>
                )}
                {data?.buyer?.buyerMobileNumber && (
                  <div>
                    <span className='fw-bold'>Mobile: </span>
                    <span>{data?.buyer?.buyerMobileNumber} </span>
                  </div>
                )}
                {data?.buyer?.buyerEmail && (
                  <div>
                    <span className='fw-bold'>Email: </span>
                    <span>{data?.buyer?.buyerEmail} </span>
                  </div>
                )}
                {data?.buyer?.buyerAddress && (
                  <div>
                    <span className='fw-bold'>Address: </span>
                    <span>{data?.buyer?.buyerAddress} </span>
                  </div>
                )}
              </div>

              {/* PickUp Info */}
              <div className='mb-4'>
                {data?.pickUp && (
                  <h4 className='fw-bold'>
                    PICK-UP DETAILS
                    {data?.status === 'pending' && data?.pickUp?.pickUpTown && (
                      <FaEdit
                        data-bs-toggle='modal'
                        data-bs-target={`#${modalPickUp}`}
                        onClick={editPickUpHandler}
                        className='mb-1 text-warning ms-2'
                      />
                    )}
                  </h4>
                )}
                {data?.pickUp?.pickUpCountry && (
                  <div>
                    <span className='fw-bold'>Country: </span>
                    <span>{data?.pickUp?.pickUpCountry?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpSeaport && (
                  <div>
                    <span className='fw-bold'>Seaport: </span>
                    <span>{data?.pickUp?.pickUpSeaport?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpAirport && (
                  <div>
                    <span className='fw-bold'>Airport: </span>
                    <span>{data?.pickUp?.pickUpAirport?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpTown && (
                  <div>
                    <span className='fw-bold'>Town: </span>
                    <span>{data?.pickUp?.pickUpTown?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpWarehouse && (
                  <div>
                    <span className='fw-bold'>Warehouse: </span>
                    <span>{data?.pickUp?.pickUpWarehouse} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpCity && (
                  <div>
                    <span className='fw-bold'>City: </span>
                    <span>{data?.pickUp?.pickUpCity} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpAddress && (
                  <div>
                    <span className='fw-bold'>Address: </span>
                    <span>{data?.pickUp?.pickUpAddress} </span>
                  </div>
                )}
              </div>

              {/* DropOff Info */}
              <div className='mb-4'>
                {data?.dropOff && (
                  <h4 className='fw-bold'>
                    DROP-OFF DETAILS
                    {data?.status === 'pending' &&
                      data?.dropOff?.dropOffTown && (
                        <FaEdit
                          data-bs-toggle='modal'
                          data-bs-target={`#${modalDropOff}`}
                          onClick={editDropOffHandler}
                          className='mb-1 text-warning ms-2'
                        />
                      )}
                  </h4>
                )}
                {data?.dropOff?.dropOffCountry && (
                  <div>
                    <span className='fw-bold'>Country: </span>
                    <span>{data?.dropOff?.dropOffCountry?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffSeaport && (
                  <div>
                    <span className='fw-bold'>Seaport: </span>
                    <span>{data?.dropOff?.dropOffSeaport?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffAirport && (
                  <div>
                    <span className='fw-bold'>Airport: </span>
                    <span>{data?.dropOff?.dropOffAirport?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffTown && (
                  <div>
                    <span className='fw-bold'>Town: </span>
                    <span>{data?.dropOff?.dropOffTown?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffWarehouse && (
                  <div>
                    <span className='fw-bold'>Warehouse: </span>
                    <span>{data?.dropOff?.dropOffWarehouse} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffCity && (
                  <div>
                    <span className='fw-bold'>City: </span>
                    <span>{data?.dropOff?.dropOffCity} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffAddress && (
                  <div>
                    <span className='fw-bold'>Address: </span>
                    <span>{data?.dropOff?.dropOffAddress} </span>
                  </div>
                )}
              </div>
            </div>
            <div className='col-md-6 col-12'>
              {/* Other Info */}
              <div className='mb-4'>
                {data?.other && (
                  <h4 className='fw-bold'>
                    OTHER DETAILS
                    {data?.status === 'pending' && (
                      <FaEdit
                        data-bs-toggle='modal'
                        data-bs-target={`#${modalOther}`}
                        onClick={editOtherHandler}
                        className='mb-1 text-warning ms-2'
                      />
                    )}
                  </h4>
                )}

                {data?.other?.importExport && (
                  <div>
                    <span className='fw-bold'>Import/Export: </span>
                    <span>{data?.other?.importExport} </span>
                  </div>
                )}
                {data?.other?.transportationType && (
                  <div>
                    <span className='fw-bold'>Transportation Type: </span>
                    <span>{data?.other?.transportationType} </span>
                  </div>
                )}
                {data?.other?.movementType && (
                  <div>
                    <span className='fw-bold'>Movement Type: </span>
                    <span>{data?.other?.movementType} </span>
                  </div>
                )}
                {data?.other?.cargoType && (
                  <div>
                    <span className='fw-bold'>Cargo Type: </span>
                    <span>{data?.other?.cargoType} </span>
                  </div>
                )}
                {data?.other?.cargoDescription && (
                  <div>
                    <span className='fw-bold'>Cargo Description: </span>
                    <span>{data?.other?.cargoDescription} </span>
                  </div>
                )}
                {data?.other?.noOffPackages && (
                  <div>
                    <span className='fw-bold'>No. Off Packages: </span>
                    <span>{data?.other?.noOffPackages} </span>
                  </div>
                )}
                {data?.other?.grossWeight && (
                  <div>
                    <span className='fw-bold'>Gross Weight: </span>
                    <span>{data?.other?.grossWeight} </span>
                  </div>
                )}
                {data?.other?.commodity && (
                  <div>
                    <span className='fw-bold'>Commodity: </span>
                    <span>{data?.other?.commodity?.name} </span>
                  </div>
                )}
                {data?.other?.transportation && (
                  <>
                    <div>
                      <span className='fw-bold'>Transportor: </span>
                      <span>{data?.other?.transportation?.name} </span>
                    </div>
                    <div>
                      <span className='fw-bold'>Departure Date: </span>
                      <span>
                        {moment(data?.other?.departureDate).format('ll')}
                      </span>
                    </div>
                    <div>
                      <span className='fw-bold'>Arrival Date: </span>
                      <span>
                        {moment(data?.other?.arrivalDate).format('ll')}
                      </span>
                    </div>
                  </>
                )}
                {data?.other && (
                  <div>
                    <span className='fw-bold'>Is Temperature Controlled? </span>
                    <span>
                      {data?.other?.isTemperatureControlled ? (
                        <FaCheckCircle className='text-success' />
                      ) : (
                        <FaTimesCircle className='text-danger' />
                      )}
                    </span>
                  </div>
                )}
                {data?.other && (
                  <div>
                    <span className='fw-bold'>Is Has Invoice? </span>
                    <span>
                      {data?.other?.isHasInvoice ? (
                        <FaCheckCircle className='text-success' />
                      ) : (
                        <FaTimesCircle className='text-danger' />
                      )}
                    </span>
                  </div>
                )}
                {data?.other?.invoice && (
                  <div>
                    <span className='fw-bold'>Invoice: </span>
                    <span>
                      <a
                        href={data?.other?.invoice}
                        target='_blank'
                        rel='noreferrer'
                      >
                        view
                      </a>
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Info */}
              <div className='mb-4'>
                {data?.price && <h4 className='fw-bold'>PRICING DETAILS</h4>}
                {data?.price?.invoicePrice && (
                  <div>
                    <span className='fw-bold'>Invoice Amount: </span>
                    <span>{data?.price?.invoicePrice} </span>
                  </div>
                )}
                {data?.price?.pickUpPrice && (
                  <div>
                    <span className='fw-bold'>Pick-up Amount: </span>
                    <span>{data?.price?.pickUpPrice} </span>
                  </div>
                )}
                {data?.price?.dropOffPrice && (
                  <div>
                    <span className='fw-bold'>Drop-off Amount: </span>
                    <span>{data?.price?.dropOffPrice} </span>
                  </div>
                )}
                {data?.price?.customerPrice && (
                  <div>
                    <span className='fw-bold'>Cargo Amount: </span>
                    <span>{data?.price?.customerPrice} </span>
                  </div>
                )}
                {data?.price?.customerCBM && (
                  <div>
                    <span className='fw-bold'>Total CBM: </span>
                    <span>{data?.price?.customerCBM} </span>
                  </div>
                )}
                {data?.price?.containerInfo && (
                  <div>
                    <span className='fw-bold'>Containers Info: </span> <br />
                    {data?.price?.containerInfo?.map((i) => (
                      <div key={i?.name} className='ms-2'>
                        - <span className='fw-bold'>{i?.name} : </span>
                        <span>
                          {i?.quantity} x ${Number(i?.price).toFixed(2)} = $
                          {(i?.quantity * Number(i?.price)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {data?.price?.totalPrice && (
                  <div>
                    <span className='fw-bold'>Total Amount: </span>
                    <span>{data?.price?.totalPrice} </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), {
  ssr: false,
})
