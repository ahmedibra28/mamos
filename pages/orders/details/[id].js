import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import useOrdersHook from '../../../utils/api/orders'
import { Spinner, Message } from '../../../components'
import { useRouter } from 'next/router'
import { FaEdit, FaExclamationCircle } from 'react-icons/fa'
import moment from 'moment'
import FormView from '../../../components/FormView'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputEmail,
  // inputFile,
  inputNumber,
  inputTel,
  inputText,
  staticInputSelect,
} from '../../../utils/dynamicForm'
import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import useUploadHook from '../../../utils/api/upload'
// import useTownsHook from '../../../utils/api/towns'
import useCommoditiesHook from '../../../utils/api/commodities'
import CustomFormView from '../../../components/CustomFormView'
import Tabs from '../../../features/order/Tabs'
import TransportationModalForm from '../../../components/TransportationModalForm'
import { hide } from '../../../utils/UnlockAccess'
import apiHook from '../../../api'

const Details = () => {
  const router = useRouter()
  const { id } = router.query

  // const [file, setFile] = useState('')
  // const [fileLink, setFileLink] = useState(null)
  const [selectedTransportation, setSelectedTransportation] = useState(null)
  const [selectContainer, setSelectContainer] = useState([])
  const [transportationsData, setTransportationsData] = useState([])
  const [cancelledReason, setCancelledReason] = useState('')
  const [isCancel, setIsCancel] = useState(false)

  const {
    getOrderDetails,
    updateOrderBuyer,
    updateOrderPickUp,
    updateOrderDropOff,
    updateOrderOther,
    updateOrderToConfirm,
    updateOrderToDelete,
    updateOrderDocument,
    updateOrderBookingDate,
    postAvailableTransportations,
    updateOrderProgress,
    updateOrderPayment,
  } = useOrdersHook({
    id,
  })

  const getApi = apiHook({
    key: ['vendors'],
    method: 'GET',
    url: `setting/vendors?page=${1}&q=&limit=${250}`,
  })?.get

  // const { getTowns } = useTownsHook({ limit: 1000000 })
  const { getCommodities } = useCommoditiesHook({ limit: 1000000 })

  const { postUpload } = useUploadHook()

  const { data, isLoading, isError, error } = getOrderDetails
  // const { data: townsData } = getTowns
  const { data: commoditiesData } = getCommodities

  const [payment, setPayment] = useState('')

  const {
    data: dataUpload,
    isLoading: isLoadingUpload,
    isError: isErrorUpload,
    error: errorUpload,
    mutateAsync: mutateAsyncUpload,
    isSuccess: isSuccessUpload,
  } = postUpload

  const {
    isLoading: isLoadingUpdateBuyer,
    isError: isErrorUpdateBuyer,
    error: errorUpdateBuyer,
    mutateAsync: mutateAsyncUpdateBuyer,
    isSuccess: isSuccessUpdateBuyer,
  } = updateOrderBuyer
  const {
    isLoading: isLoadingUpdatePickUp,
    isError: isErrorUpdatePickUp,
    error: errorUpdatePickUp,
    mutateAsync: mutateAsyncUpdatePickUp,
    isSuccess: isSuccessUpdatePickUp,
  } = updateOrderPickUp
  const {
    isLoading: isLoadingUpdateDropOff,
    isError: isErrorUpdateDropOff,
    error: errorUpdateDropOff,
    mutateAsync: mutateAsyncUpdateDropOff,
    isSuccess: isSuccessUpdateDropOff,
  } = updateOrderDropOff
  const {
    isLoading: isLoadingUpdateOther,
    isError: isErrorUpdateOther,
    error: errorUpdateOther,
    mutateAsync: mutateAsyncUpdateOther,
    isSuccess: isSuccessUpdateOther,
  } = updateOrderOther
  const {
    isLoading: isLoadingUpdateToConfirm,
    isError: isErrorUpdateToConfirm,
    error: errorUpdateToConfirm,
    mutateAsync: mutateAsyncUpdateToConfirm,
    isSuccess: isSuccessUpdateToConfirm,
  } = updateOrderToConfirm
  const {
    isLoading: isLoadingUpdateToDelete,
    isError: isErrorUpdateToDelete,
    error: errorUpdateToDelete,
    mutateAsync: mutateAsyncUpdateToDelete,
    isSuccess: isSuccessUpdateToDelete,
  } = updateOrderToDelete
  const {
    isLoading: isLoadingUpdateProgress,
    isError: isErrorUpdateProgress,
    error: errorUpdateProgress,
    mutateAsync: mutateAsyncUpdateProgress,
    isSuccess: isSuccessUpdateProgress,
  } = updateOrderProgress
  const {
    isLoading: isLoadingUpdateDocument,
    isError: isErrorUpdateDocument,
    error: errorUpdateDocument,
    mutateAsync: mutateAsyncUpdateDocument,
    isSuccess: isSuccessUpdateDocument,
  } = updateOrderDocument
  const {
    isLoading: isLoadingUpdateBookingDate,
    isError: isErrorUpdateBookingDate,
    error: errorUpdateBookingDate,
    mutateAsync: mutateAsyncUpdateBookingDate,
    isSuccess: isSuccessUpdateBookingDate,
  } = updateOrderBookingDate

  const {
    data: transportationData,
    mutateAsync: transportationsMutateAsync,
    isLoading: isLoadingTransportations,
    isError: isErrorTransportations,
    error: errorTransportations,
    isSuccess: isSuccessTransactions,
  } = postAvailableTransportations

  const {
    isLoading: isLoadingUpdatePayment,
    isError: isErrorUpdatePayment,
    error: errorUpdatePayment,
    mutateAsync: mutateAsyncUpdatePayment,
    isSuccess: isSuccessUpdatePayment,
  } = updateOrderPayment

  useEffect(() => {
    if (isSuccessTransactions) {
      setTransportationsData(transportationData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessTransactions])

  // useEffect(() => {
  //   if (isSuccessUpload) {
  //     setFileLink(
  //       dataUpload &&
  //         dataUpload.filePaths &&
  //         dataUpload.filePaths[0] &&
  //         dataUpload.filePaths[0].path
  //     )
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSuccessUpload])

  // useEffect(() => {
  //   if (file) {
  //     const formData = new FormData()
  //     formData.append('file', file)
  //     mutateAsyncUpload({ type: 'file', formData })
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [file])

  const confirmOrderHandler = () => {
    mutateAsyncUpdateToConfirm({ _id: id })
  }
  const cancelOrderHandler = () => {
    if (!cancelledReason) return null
    mutateAsyncUpdateToDelete({ _id: id, cancelledReason })
  }
  const submitHandlerProcess = (data) => {
    mutateAsyncUpdateProgress({
      _id: id,
      data,
    })
  }

  const steps = [
    {
      _id: '1',
      label: 'Loaded the container on truck',
      value: 'loadingOnTrack',
    },
    {
      _id: '2',
      label: 'Container in port',
      value: 'containerInPort',
    },
    {
      _id: '3',
      label: 'Checked VGM',
      value: 'checkingVGM',
    },
    {
      _id: '4',
      label: 'Instruction for shipments',
      value: 'instructionForShipments',
    },
    {
      _id: '5',
      label: 'Custom clearance certificate',
      value: 'clearanceCertificate',
    },
    {
      _id: '6',
      label: 'Payment details',
      value: 'paymentDetails',
    },
  ]

  useEffect(() => {
    setValueProcess('loadingOnTrack', data?.process?.loadingOnTrack)
    setValueProcess('containerInPort', data?.process?.containerInPort)
    setValueProcess('checkingVGM', data?.process?.checkingVGM)
    setValueProcess(
      'instructionForShipments',
      data?.process?.instructionForShipments
    )
    setValueProcess('clearanceCertificate', data?.process?.clearanceCertificate)
    setValueProcess('paymentDetails', data?.process?.paymentDetails)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

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
    setValuePickUp('pickUpCost', data?.pickUp?.pickUpCost)
    setValuePickUp('pickUpPrice', data?.pickUp?.pickUpPrice)
    setValuePickUp('pickUpVendor', data?.pickUp?.pickUpVendor?._id)
  }
  const editDropOffHandler = () => {
    setValueDropOff('dropOffWarehouse', data?.dropOff?.dropOffWarehouse)
    setValueDropOff('dropOffCity', data?.dropOff?.dropOffCity)
    setValueDropOff('dropOffAddress', data?.dropOff?.dropOffAddress)
    setValueDropOff('dropOffCost', data?.dropOff?.dropOffCost)
    setValueDropOff('dropOffPrice', data?.dropOff?.dropOffPrice)
    setValueDropOff('dropOffVendor', data?.dropOff?.dropOffVendor?._id)
  }
  const editOtherHandler = () => {
    setValueOther('importExport', data?.other?.importExport)
    setValueOther('trackingNo', data?.trackingNo)
    setValueOther(
      'isTemperatureControlled',
      data?.other?.isTemperatureControlled
    )
    setSelectedTransportation(data?.other?.transportation)
    setSelectContainer(data?.other?.containers)
    setValueOther('commodity', data?.other?.commodity?._id)
    setValueOther('grossWeight', data?.other?.grossWeight)
    setValueOther('cargoDescription', data?.other?.cargoDescription)
    setValueOther('noOfPackages', data?.other?.noOfPackages)

    setValueOther('demurrage', data?.demurrage)
    setValueOther('overWeight', data?.overWeight?.amount)
    setValueOther('overWeightVendor', data?.overWeight?.vendor?._id)
  }

  // const editDocumentHandler = () => {
  //   setValueDocument('invoice', data?.other?.invoice)
  //   setValueDocument('isHasInvoice', data?.other?.isHasInvoice)

  //   if (data?.other?.isHasInvoice) {
  //     setFileLink(data?.other?.invoice)
  //   }
  // }

  const editBookingDateHandler = () => {
    transportationsMutateAsync({
      transportationType: data?.other?.transportationType,
      pickUpSeaport: data?.pickUp?.pickUpSeaport,
      dropOffSeaport: data?.dropOff?.dropOffSeaport,
    })
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
    register: registerProcess,
    handleSubmit: handleSubmitProcess,
    setValue: setValueProcess,
    formState: { errors: errorsProcess },
  } = useForm({
    defaultValues: {
      loadingOnTrack: false,
      containerInPort: false,
      checkingVGM: false,
      instructionForShipments: false,
      clearanceCertificate: false,
      paymentDetails: false,
    },
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

  const {
    register: registerDocument,
    handleSubmit: handleSubmitDocument,
    watch: watchDocument,
    setValue: setValueDocument,
    reset: resetDocument,
    formState: { errors: errorsDocument },
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
    dynamicInputSelect({
      register: registerPickUp,
      errors: errorsPickUp,
      label: 'Vendor',
      name: 'pickUpVendor',
      value: 'name',
      data: getApi?.data?.data?.filter(
        (v) => v.status === 'active' && v.type === 'track'
      ),
    }),
    inputText({
      register: registerPickUp,
      errors: errorsPickUp,
      label: 'Pick Up Cost',
      name: 'pickUpCost',
      placeholder: 'Enter pick up cost',
    }),
    inputText({
      register: registerPickUp,
      errors: errorsPickUp,
      label: 'Pick Up Price',
      name: 'pickUpPrice',
      placeholder: 'Enter pick up price',
    }),
  ]

  const formDropOff = [
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Warehouse',
      name: 'dropOffWarehouse',
      placeholder: 'Enter warehouse',
    }),
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'City',
      name: 'dropOffCity',
      placeholder: 'Enter city',
    }),
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Address',
      name: 'dropOffAddress',
      placeholder: 'Enter address',
    }),
    dynamicInputSelect({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Vendor',
      name: 'dropOffVendor',
      value: 'name',
      data: getApi?.data?.data?.filter(
        (v) => v.status === 'active' && v.type === 'track'
      ),
    }),
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Drop Off Cost',
      name: 'dropOffCost',
      placeholder: 'Enter drop off cost',
    }),
    inputText({
      register: registerDropOff,
      errors: errorsDropOff,
      label: 'Drop Off Price',
      name: 'dropOffPrice',
      placeholder: 'Enter drop off price',
    }),
  ]

  const seaFreightKG = selectContainer?.reduce(
    (acc, curr) =>
      acc + curr?.container?.container?.details?.seaFreight * curr.quantity,
    0
  )

  const formOther = [
    inputText({
      register: registerOther,
      errors: errorsOther,
      label: 'Tracking No',
      name: 'trackingNo',
    }),
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

    dynamicInputSelect({
      register: registerOther,
      errors: errorsOther,
      label: 'Commodity *',
      name: 'commodity',
      value: 'name',
      data:
        commoditiesData &&
        commoditiesData?.data?.filter(
          (commodity) => commodity.status === 'active'
        ),
    }),

    inputNumber({
      register: registerOther,
      errors: errorsOther,
      name: 'noOfPackages',
      label: 'No. of Packages',
      placeholder: 'Enter number of packages',
    }),

    inputNumber({
      register: registerOther,
      errors: errorsOther,
      name: 'grossWeight',
      label: 'Gross Weight as KG',
      max: seaFreightKG,
      placeholder: 'Enter gross weight as KG',
    }),

    inputText({
      register: registerOther,
      errors: errorsOther,
      name: 'cargoDescription',
      label: 'Cargo Description',
      placeholder: 'Enter cargo description',
    }),

    <hr key='hr0' />,
    inputNumber({
      register: registerOther,
      errors: errorsOther,
      label: 'Demurrage',
      name: 'demurrage',
    }),
    dynamicInputSelect({
      register: registerOther,
      errors: errorsOther,
      label: 'Vendor',
      name: 'overWeightVendor',
      value: 'name',
      data: getApi?.data?.data?.filter(
        (v) => v.status === 'active' && v.type === 'government'
      ),
    }),
    watchOther().overWeightVendor &&
      inputNumber({
        register: registerOther,
        errors: errorsOther,
        label: 'Over Weight',
        name: 'overWeight',
        placeholder: 'Overweight',
      }),
  ]

  // const formDocument = [
  //   inputCheckBox({
  //     register: registerDocument,
  //     errors: errorsDocument,
  //     name: 'isHasInvoice',
  //     label: 'Do you have an invoice?',
  //     isRequired: false,
  //   }),

  //   fileLink && (
  //     <div key={'fileLink'} className='text-warning'>
  //       This order has already uploaded invoice, just click submit button if you
  //       don not what upload new one again
  //     </div>
  //   ),

  //   watchDocument().isHasInvoice &&
  //     inputFile({
  //       register: registerDocument,
  //       errors: errorsDocument,
  //       name: 'invoiceFile',
  //       label: 'Upload Invoice',
  //       isRequired: false,
  //       setFile,
  //     }),
  // ]

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

  // const labelDocument = 'Document'
  // const modalDocument = 'document'

  const labelBookingDate = 'Change Booking Date'
  const modalBookingDate = 'bookingDate'

  const formCleanHandler = () => {
    resetBuyer()
    resetPickUp()
    resetDropOff()
    resetOther()
    resetDocument()
    // setFileLink(null)
    setSelectedTransportation(null)
    setSelectContainer([])
    setTransportationsData([])
    setCancelledReason('')
    setIsCancel(false)
  }

  useEffect(() => {
    setPayment(data?.other?.payment)
  }, [data])

  useEffect(() => {
    if (isSuccessUpdatePayment) {
      setPayment(data?.other?.payment)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdatePayment])

  useEffect(() => {
    if (
      isSuccessUpdateBuyer ||
      isSuccessUpdatePickUp ||
      isSuccessUpdateDropOff ||
      isSuccessUpdateOther ||
      isSuccessUpdateToConfirm ||
      isSuccessUpdateToDelete ||
      isSuccessUpdateDocument ||
      isSuccessUpdateBookingDate ||
      isSuccessUpdatePayment ||
      isSuccessUpdateProgress
    )
      formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSuccessUpdateBuyer,
    isSuccessUpdatePickUp,
    isSuccessUpdateDropOff,
    isSuccessUpdateOther,
    isSuccessUpdateToConfirm,
    isSuccessUpdateToDelete,
    isSuccessUpdateDocument,
    isSuccessUpdateBookingDate,
    isSuccessUpdatePayment,
    isSuccessUpdateProgress,
  ])

  const addContainer = (container) => {
    const existed = selectContainer.find(
      (c) => c.container?._id === container.container?._id
    )
    if (existed) {
      const newSelectContainer = selectContainer.map((c) => {
        if (c.container?._id === container.container?._id) {
          return {
            ...container,
            quantity: Number(c.quantity) + 1,
          }
        }
        return c
      })
      setSelectContainer(newSelectContainer)
    } else {
      setSelectContainer([...selectContainer, { ...container, quantity: 1 }])
    }
  }

  const removeContainer = (container) => {
    const newSelectContainer = selectContainer.map((c) => {
      if (c.container?._id === container.container?._id && c.quantity > 1) {
        return {
          ...container,
          quantity: Number(c.quantity) - 1,
        }
      }
      if (
        c.container?._id === container.container?._id &&
        Number(c.quantity) === 1
      ) {
        return null
      }
      return c
    })

    setSelectContainer(newSelectContainer.filter((f) => f !== null))
  }

  const submitHandlerBuyer = (data) => {
    mutateAsyncUpdateBuyer({ ...data, _id: id })
  }
  const submitHandlerPickUp = (data) => {
    mutateAsyncUpdatePickUp({ ...data, _id: id })
  }

  const submitHandlerDropOff = (data) => {
    mutateAsyncUpdateDropOff({ ...data, _id: id })
  }
  const submitHandlerOther = (dataObj) => {
    mutateAsyncUpdateOther({
      ...dataObj,
      _id: id,
      transportation: selectedTransportation,
      containers: selectContainer,
    })
  }

  // const submitHandlerDocument = (dataObj) => {
  //   if (!fileLink) return

  //   mutateAsyncUpdateDocument({
  //     ...dataObj,
  //     invoice: fileLink,
  //     _id: id,
  //   })
  // }

  const submitHandlerBookingDate = () => {
    mutateAsyncUpdateBookingDate({
      _id: id,
      selectedTransportation,
    })
  }

  const updatePayment = () => {
    mutateAsyncUpdatePayment({ _id: id, payment })
  }

  const DEFAULT_CAPACITY = Number(
    data?.other?.transportation?.container[0]?.container?.details?.CBM
  )

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

      {isSuccessUpdateBuyer && (
        <Message variant='success'>
          Buyer details has been updated successfully
        </Message>
      )}
      {isErrorUpdateBuyer && (
        <Message variant='danger'>{errorUpdateBuyer}</Message>
      )}

      {isSuccessUpdatePickUp && (
        <Message variant='success'>
          Pick up details has been updated successfully
        </Message>
      )}
      {isErrorUpdatePickUp && (
        <Message variant='danger'>{errorUpdatePickUp}</Message>
      )}

      {isSuccessUpdateDropOff && (
        <Message variant='success'>
          Drop off details has been updated successfully
        </Message>
      )}
      {isErrorUpdateDropOff && (
        <Message variant='danger'>{errorUpdateDropOff}</Message>
      )}

      {isSuccessUpdateOther && (
        <Message variant='success'>
          Other details has been updated successfully
        </Message>
      )}
      {isErrorUpdateOther && (
        <Message variant='danger'>{errorUpdateOther}</Message>
      )}

      {isSuccessUpdateToConfirm && (
        <Message variant='success'>
          Order has been confirmed successfully
        </Message>
      )}
      {isErrorUpdateToConfirm && (
        <Message variant='danger'>{errorUpdateToConfirm}</Message>
      )}

      {isSuccessUpdateToDelete && (
        <Message variant='success'>
          Order has been cancelled successfully
        </Message>
      )}

      {isSuccessUpdateBookingDate && (
        <Message variant='success'>
          Booking date has been changed successfully
        </Message>
      )}

      {isSuccessUpdatePayment && (
        <Message variant='success'>
          Payment has been updated successfully
        </Message>
      )}

      {isErrorUpdateToDelete && (
        <Message variant='danger'>{errorUpdateToDelete}</Message>
      )}

      {isSuccessUpdateProgress && (
        <Message variant='success'>
          Order progress has been updated successfully
        </Message>
      )}

      {isErrorUpdateProgress && (
        <Message variant='danger'>{errorUpdateProgress}</Message>
      )}

      {isErrorUpdateDocument && (
        <Message variant='danger'>{errorUpdateDocument}</Message>
      )}

      {isErrorUpdateBookingDate && (
        <Message variant='danger'>{errorUpdateBookingDate}</Message>
      )}

      {isErrorUpdatePayment && (
        <Message variant='danger'>{errorUpdatePayment}</Message>
      )}

      {isErrorTransportations && (
        <Message variant='danger'>{errorTransportations}</Message>
      )}

      {/* Buyer Modal Form */}
      <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formBuyer}
        watch={watchBuyer}
        isLoadingUpdate={isLoadingUpdateBuyer}
        isLoadingPost={false}
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
        isLoadingUpdate={isLoadingUpdatePickUp}
        isLoadingPost={false}
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
        isLoadingUpdate={isLoadingUpdateDropOff}
        isLoadingPost={false}
        handleSubmit={handleSubmitDropOff}
        submitHandler={submitHandlerDropOff}
        modal={modalDropOff}
        label={labelDropOff}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {/* Other Modal Form */}
      <CustomFormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formOther}
        watch={watchOther}
        isLoadingUpdate={isLoadingUpdateOther}
        isLoadingPost={false}
        handleSubmit={handleSubmitOther}
        submitHandler={submitHandlerOther}
        modal={modalOther}
        label={labelOther}
        column={'col-12'}
        row={true}
        modalSize={'modal-lg'}
        commoditiesData={commoditiesData}
        DEFAULT_CAPACITY={DEFAULT_CAPACITY}
        selectedTransportation={selectedTransportation}
        cargoType={data?.other?.cargoType}
        selectContainer={selectContainer}
        removeContainer={removeContainer}
        addContainer={addContainer}
      />

      {/* Document Modal Form */}
      {/* <FormView
        edit={true}
        formCleanHandler={formCleanHandler}
        form={formDocument}
        watch={watchDocument}
        isLoadingUpdate={isLoadingUpdateDocument}
        isLoadingPost={isLoadingUpload}
        handleSubmit={handleSubmitDocument}
        submitHandler={submitHandlerDocument}
        modal={modalDocument}
        label={labelDocument}
        column={column}
        row={row}
        modalSize={modalSize}
      /> */}

      {/* Update booking date */}
      <TransportationModalForm
        formCleanHandler={formCleanHandler}
        isLoading={isLoadingUpdateBookingDate}
        modal={modalBookingDate}
        label={labelBookingDate}
        modalSize={'modal-xl'}
        editBookingDateHandler={editBookingDateHandler}
        selectedTransportation={selectedTransportation}
        setSelectedTransportation={setSelectedTransportation}
        transportationData={transportationsData?.filter(
          (t) => t.status === 'active'
        )}
        isLoadingTransportations={isLoadingTransportations}
        submitHandler={submitHandlerBookingDate}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='bg-light p-3 my-2'>
          {data?.status === 'pending' && (
            <div className='alert alert-warning'>
              <FaExclamationCircle className='mb-1 me-2' />
              You can not edit this order after confirmed
            </div>
          )}
          <div className='row'>
            <div className='col-lg-3 col-md-4 col-12'>
              <h6>Shipment Binder </h6>
              <p className='fw-bold'>
                {data?.other?.transportation?.reference}
              </p>
              <p className='fw-bold'>
                TOTAL PRICE:
                {hide(['LOGISTIC']) ? (
                  <span className='badge bg-danger ms-2'>N/A</span>
                ) : (
                  <span className='bg-dark text-light p-1 rounded-pill ms-2'>
                    {data?.price?.totalPrice}
                  </span>
                )}
              </p>
            </div>
            <div className='col-lg-3 col-md-4 col-12'>
              <h6>Transporter </h6>
              <p>{data?.other?.transportation?.vendor?.name}</p>
            </div>
            <div className='col-lg-3 col-md-4 col-12'>
              <h6>
                Departing on{' '}
                {moment(data?.other?.transportation?.departureDate).format(
                  'll'
                )}
              </h6>
              <p>
                {data?.pickUp?.pickUpSeaport?.name},{' '}
                {data?.pickUp?.pickUpCountry?.name}
              </p>
            </div>
            <div className='col-lg-3 col-md-4 col-12'>
              <h6>
                Arriving on{' '}
                {moment(data?.other?.transportation?.delayDate).format('ll')}
              </h6>
              <p>
                {data?.dropOff?.dropOffSeaport?.name},{' '}
                {data?.dropOff?.dropOffCountry?.name}
              </p>
            </div>
          </div>

          <Tabs
            data={data}
            confirmOrderHandler={confirmOrderHandler}
            FaEdit={FaEdit}
            modalBuyer={modalBuyer}
            editBuyerHandler={editBuyerHandler}
            modalPickUp={modalPickUp}
            editPickUpHandler={editPickUpHandler}
            modalDropOff={modalDropOff}
            editDropOffHandler={editDropOffHandler}
            modalOther={modalOther}
            editOtherHandler={editOtherHandler}
            // modalDocument={modalDocument}
            // editDocumentHandler={editDocumentHandler}
            isLoadingUpdateProgress={isLoadingUpdateProgress}
            cancelOrderHandler={cancelOrderHandler}
            setCancelledReason={setCancelledReason}
            cancelledReason={cancelledReason}
            setIsCancel={setIsCancel}
            isCancel={isCancel}
            isLoadingUpdateToConfirm={isLoadingUpdateToConfirm}
            isLoadingUpdateToDelete={isLoadingUpdateToDelete}
            editBookingDateHandler={editBookingDateHandler}
            modalBookingDate={modalBookingDate}
            payment={payment}
            setPayment={setPayment}
            isLoadingUpdatePayment={isLoadingUpdatePayment}
            updatePayment={updatePayment}
            registerProcess={registerProcess}
            errorsProcess={errorsProcess}
            handleSubmitProcess={handleSubmitProcess}
            submitHandlerProcess={submitHandlerProcess}
            steps={steps}
          />
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), {
  ssr: false,
})
