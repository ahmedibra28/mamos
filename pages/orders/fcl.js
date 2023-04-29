import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import useOrdersHook from '../../utils/api/orders'
import useSeaportsHook from '../../utils/api/seaports'
import useCommoditiesHook from '../../utils/api/commodities'
// import useTownsHook from '../../utils/api/towns'
// import useUploadHook from '../../utils/api/upload'

import { Spinner, Message } from '../../components'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputEmail,
  // inputFile,
  inputNumber,
  inputTel,
  inputText,
  staticInputSelect,
} from '../../utils/dynamicForm'
import TransportationItem from '../../components/TransportationItem'
import { FaMinusCircle, FaPlusCircle, FaSearch } from 'react-icons/fa'
import apiHook from '../../api'

const Orders = () => {
  const [selectedTransportation, setSelectedTransportation] = useState(null)
  const [selectContainer, setSelectContainer] = useState([])

  // const [file, setFile] = useState('')
  // const [fileLink, setFileLink] = useState(null)
  const { postOrder, postAvailableTransportations } = useOrdersHook({})
  const [transportationsData, setTransportationsData] = useState(null)

  const { getSeaports } = useSeaportsHook({ limit: 1000000 })
  const { getCommodities } = useCommoditiesHook({ limit: 1000000 })
  // const { getTowns } = useTownsHook({ limit: 1000000 })
  // const { postUpload } = useUploadHook()

  const { data: seaportsData } = getSeaports
  const { data: commoditiesData } = getCommodities
  // const { data: townsData } = getTowns

  // const {
  //   data: dataUpload,
  //   isLoading: isLoadingUpload,
  //   isError: isErrorUpload,
  //   error: errorUpload,
  //   mutateAsync: mutateAsyncUpload,
  //   isSuccess: isSuccessUpload,
  // } = postUpload

  const {
    isSuccess: isSuccessPost,
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    mutateAsync: mutateAsyncPost,
  } = postOrder

  const {
    data: transportationData,
    mutateAsync: transportationsMutateAsync,
    isLoading: isLoadingTransportations,
    isSuccess: isSuccessTransactions,
  } = postAvailableTransportations

  useEffect(() => {
    if (isSuccessTransactions) {
      setTransportationsData(transportationData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessTransactions])

  // useEffect(() => {
  //   if (file) {
  //     const formData = new FormData()
  //     formData.append('file', file)
  //     mutateAsyncUpload({ type: 'file', formData })
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [file])

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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isTemperatureControlled: true,
      // isHasInvoice: false,
    },
  })

  useEffect(() => {
    if (isSuccessPost) {
      reset()
      setSelectedTransportation(null)
      // setFile('')
      // setFileLink(null)
      setSelectContainer([])
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTransportationsData(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessPost])

  const handleSearch = () => {
    if (watch().pickUpSeaport || watch().dropOffSeaport) {
      transportationsMutateAsync({
        pickUpSeaport: watch().pickUpSeaport,
        dropOffSeaport: watch().dropOffSeaport,
      })
    }
  }

  const submitHandler = (data) => {
    mutateAsyncPost({
      ...data,
      transportation: selectedTransportation,
      containers: selectContainer,
      // invoice: fileLink,
    })
  }

  const addContainer = (container) => {
    const existed = selectContainer.find((c) => c._id === container._id)
    if (existed) {
      const newSelectContainer = selectContainer.map((c) => {
        if (c._id === container._id) {
          return {
            ...container,
            quantity: c.quantity + 1,
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
      if (c._id === container._id && c.quantity > 1) {
        return {
          ...container,
          quantity: c.quantity - 1,
        }
      }
      if (c._id === container._id && c.quantity === 1) {
        return null
      }
      return c
    })

    setSelectContainer(newSelectContainer.filter((f) => f !== null))
  }

  const seaFreightKG =
    selectedTransportation?.cargo === 'FCL' &&
    selectContainer?.reduce(
      (acc, curr) => acc + curr?.container?.details?.seaFreight * curr.quantity,
      0
    )

  const movementTypes = {
    pickUp: ['door to door', 'door to port'],
    dropOff: ['door to door', 'port to door'],
    seaport: ['port to port'],
  }

  const getVendorsApi = apiHook({
    key: ['vendors'],
    method: 'GET',
    url: `setting/vendors?page=${1}&q=&limit=${2500}`,
  })?.get

  return (
    <>
      <Head>
        <title>Book New Shipment</title>
        <meta property='og:title' content='Book New Shipment' key='title' />
      </Head>

      {isSuccessPost && (
        <Message variant='success'>
          Your order has been received successfully
        </Message>
      )}

      {/* {isErrorUpload && <Message variant='danger'>{errorUpload}</Message>} */}
      {isErrorPost && <Message variant='danger'>{errorPost}</Message>}

      <div className='bg-light p-3 my-2 text-center'>
        <h4 className='fw-bold font-monospace'>Book New Shipment</h4>
        <p>Please complete as much as you can.</p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='bg-light p-3 my-2'>
          <h4 className='fw-bold font-monospace'>Basic Information</h4>
          <div className='row'>
            <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
              {staticInputSelect({
                register,
                errors,
                label: 'Import/Export',
                name: 'importExport',
                data: [{ name: 'Import' }, { name: 'Export' }],
              })}
            </div>

            <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
              {staticInputSelect({
                register,
                errors,
                label: 'Movement type?',
                name: 'movementType',
                data: [
                  { name: 'door to door' },
                  { name: 'door to port' },
                  { name: 'port to port' },
                  { name: 'port to door' },
                ],
              })}
            </div>

            <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Pickup Seaport',
                name: 'pickUpSeaport',
                value: 'name',
                data: seaportsData?.data?.filter(
                  (item) =>
                    item?.status === 'Active' &&
                    item._id !== watch().dropOffSeaport
                ),
              })}
            </div>

            <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Destination Seaport',
                name: 'dropOffSeaport',
                value: 'name',
                data: seaportsData?.data?.filter(
                  (item) =>
                    item?.status === 'Active' &&
                    item._id !== watch().pickUpSeaport
                ),
              })}
            </div>
          </div>
        </div>

        {watch('movementType') &&
          watch('importExport') &&
          watch('pickUpSeaport') &&
          watch('dropOffSeaport') && (
            <div className='text-end'>
              <button
                type='button'
                onClick={() => handleSearch()}
                className='btn btn-primary my-2'
                disabled={isLoadingPost}
              >
                {isLoadingPost ? (
                  <span className='spinner-border spinner-border-sm' />
                ) : (
                  <>
                    <FaSearch className='mb-1' /> Search Transporter
                  </>
                )}
              </button>
            </div>
          )}

        {isLoadingTransportations ? (
          <Spinner />
        ) : (
          transportationsData &&
          watch().movementType && (
            <div className='bg-light p-3 my-2'>
              {transportationsData?.length > 0 && (
                <h4 className='fw-bold font-monospace'>
                  Available transportations based on your lookup
                </h4>
              )}

              <div className='row gy-3'>
                {transportationsData?.map((item) => (
                  <div key={item._id} className='col-lg-3 col-md-6 col-12'>
                    <TransportationItem
                      item={item}
                      setSelectedTransportation={setSelectedTransportation}
                      selectedTransportation={selectedTransportation}
                      setSelectContainer={setSelectContainer}
                    />
                  </div>
                ))}

                <div className='col-12'>
                  <div className='row mt-4'>
                    {selectedTransportation?.container?.map((container) => (
                      <div
                        key={container?.container._id}
                        className='col-lg-3 col-md-6 col-12'
                      >
                        <div className='card border border-primary shadow-sm'>
                          <div className='card-body text-center'>
                            <div className=''>
                              {container?.container?.name} - Fits up to{' '}
                              {container?.container?.details?.seaFreight?.toFixed(
                                2
                              )}{' '}
                              & {container?.container?.details?.CBM} M
                              <sup>3</sup>
                            </div>
                            <div className='text-center'>
                              <button
                                disabled={
                                  !selectContainer.find(
                                    (c) =>
                                      c?.container._id ===
                                      container?.container._id
                                  )
                                }
                                onClick={() => removeContainer(container)}
                                type='button'
                                className='btn btn-danger btn-sm'
                              >
                                <FaMinusCircle className='mb-1' />
                              </button>

                              <button
                                type='button'
                                className='btn btn-light btn-sm'
                              >
                                {selectContainer.map(
                                  (c) =>
                                    c?.container._id ===
                                      container?.container._id && c.quantity
                                )}
                                {!selectContainer.find(
                                  (c) =>
                                    c?.container._id ===
                                    container?.container?._id
                                ) && 0}
                              </button>

                              <button
                                onClick={() => addContainer(container)}
                                type='button'
                                className='btn btn-success btn-sm'
                              >
                                <FaPlusCircle className='mb-1' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='col-12'>
                  {transportationsData && transportationsData?.length === 0 && (
                    <p className='text-center text-danger'>
                      <span className='fw-bold'>Sorry! </span> There is no
                      available transportations. Please update your search or
                      contact us.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {selectContainer?.length > 0 && (
          <>
            {selectedTransportation &&
              !['port to port'].includes(watch().movementType) && (
                <div className='bg-light p-3 my-3'>
                  <h4 className='fw-bold font-monospace'>Location Details</h4>
                  <label>
                    Please make sure to use the correct address(es). We will
                    pick-up/or deliver the shipment here.
                  </label>
                  <div className='row gy-3 mt-3'>
                    {movementTypes.pickUp.includes(watch().movementType) && (
                      <>
                        <label className='fw-bold'>
                          What is the pick-up address of your cargo?
                        </label>
                        {/* <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                          {dynamicInputSelect({
                            register,
                            errors,
                            label: 'Pickup town',
                            name: 'pickUpTown',
                            value: 'name',
                            data: townsData?.data?.filter(
                              (town) =>
                                town.status === 'Active' &&
                                town?.seaport?._id === watch().pickUpSeaport
                            ),
                          })}
                        </div> */}
                        <div className='col-md-4 col-sm-6 col-12'>
                          {inputText({
                            register,
                            errors,
                            name: 'pickUpWarehouse',
                            label: 'Warehouse Name',
                            placeholder: 'Enter pickUp warehouse name',
                          })}
                        </div>
                        <div className='col-md-4 col-sm-6 col-12'>
                          {inputText({
                            register,
                            errors,
                            name: 'pickUpCity',
                            label: 'City',
                            placeholder: 'Enter pickUp city',
                          })}
                        </div>

                        <div className='col-md-4 col-sm-6 col-12'>
                          {inputText({
                            register,
                            errors,
                            name: 'pickUpAddress',
                            label: 'Address',
                            placeholder: 'Enter pickUp address',
                          })}
                        </div>
                      </>
                    )}

                    {movementTypes.dropOff.includes(watch().movementType) && (
                      <>
                        <label className='fw-bold'>
                          What is the drop-off address of your cargo?
                        </label>
                        {/* <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                          {dynamicInputSelect({
                            register,
                            errors,
                            label: 'DropOff town',
                            name: 'dropOffTown',
                            value: 'name',
                            data: townsData?.data?.filter(
                              (town) =>
                                town.status === 'Active' &&
                                town?.seaport?._id === watch().dropOffSeaport
                            ),
                          })}
                        </div> */}
                        <div className='col-md-4 col-sm-6 col-12'>
                          {inputText({
                            register,
                            errors,
                            name: 'dropOffWarehouse',
                            label: 'Warehouse Name',
                            placeholder: 'Enter drop-off warehouse name',
                          })}
                        </div>
                        <div className='col-md-4 col-sm-6 col-12'>
                          {inputText({
                            register,
                            errors,
                            name: 'dropOffCity',
                            label: 'City',
                            placeholder: 'Enter drop-off city',
                          })}
                        </div>

                        <div className='col-md-4 col-sm-6 col-12'>
                          {inputText({
                            register,
                            errors,
                            name: 'dropOffAddress',
                            label: 'Address',
                            placeholder: 'Enter drop-off address',
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            <div className='bg-light p-3 my-3'>
              <h4 className='fw-bold font-monospace'>Cargo Details</h4>
              <label>Tell us a bit more about your cargo.</label>
              <div className='row'>
                <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                  {inputText({
                    register,
                    errors,
                    name: 'cargoDescription',
                    label: 'Cargo Description',
                    placeholder: 'Enter cargo description',
                  })}
                </div>

                <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                  {dynamicInputSelect({
                    register,
                    errors,
                    label: 'Commodity *',
                    name: 'commodity',
                    value: 'name',
                    data:
                      commoditiesData &&
                      commoditiesData?.data?.filter(
                        (commodity) => commodity.status === 'Active'
                      ),
                  })}
                </div>
                <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                  {inputNumber({
                    register,
                    errors,
                    name: 'noOfPackages',
                    label: 'No. of Packages',
                    placeholder: 'Enter number of packages',
                  })}
                </div>
                <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                  {inputNumber({
                    register,
                    errors,
                    name: 'grossWeight',
                    label: 'Gross Weight as KG',
                    max: seaFreightKG,
                    placeholder: 'Enter gross weight as KG',
                  })}
                </div>
                <div className='col-12'>
                  {inputCheckBox({
                    register,
                    errors,
                    name: 'isTemperatureControlled',
                    isRequired: false,
                    label:
                      'My cargo is not temperature-controlled and does not include any hazardous or personal goods',
                  })}
                </div>
              </div>
            </div>
            {selectedTransportation && (
              <div className='bg-light p-3 my-3'>
                <h4 className='fw-bold font-monospace'>Buyer Details</h4>
                <label>
                  Enter the buyers details so they can be notified about the
                  shipment and Track the process
                </label>
                <div className='row gy-3 mt-3'>
                  <div className='col-12'>
                    <label className='fw-bold'>
                      Person who will receive packages
                    </label>
                  </div>
                  <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                    {/* {dynamicInputSelect({
                      register,
                      errors,
                      name: 'buyerName',
                      label: 'Who is your buyer?',
                      placeholder: 'Select buyer name',
                      value: 'name',
                      data: getVendorsApi?.data?.data?.filter(
                        (v) => v?.type === 'Customer' && v?.status === 'Active'
                      ),
                    })} */}
                    {inputText({
                      register,
                      errors,
                      name: 'buyerName',
                      label: 'Who is your buyer?',
                      placeholder: 'Enter buyer name',
                    })}
                  </div>
                  <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                    {inputTel({
                      register,
                      errors,
                      name: 'buyerMobileNumber',
                      label: 'Buyer mobile number',
                      placeholder: 'Enter buyer mobile number',
                    })}
                  </div>
                  <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                    {inputEmail({
                      register,
                      errors,
                      name: 'buyerEmail',
                      label: 'Buyer email',
                      placeholder: 'Enter buyer email address',
                    })}
                  </div>
                  <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                    {inputText({
                      register,
                      errors,
                      name: 'buyerAddress',
                      label: 'Buyer address',
                      placeholder: 'Enter buyer address',
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* {selectedTransportation && (
              <div className='bg-light p-3 my-3'>
                <h4 className='fw-bold font-monospace'>
                  Other Required Details
                </h4>
                <label>Please answer all below asked questions.</label>
                <div className='row gy-3 mt-3'>
                  <div className='col-12'>
                    {inputCheckBox({
                      register,
                      errors,
                      name: 'isHasInvoice',
                      label: 'Do you have an invoice?',
                      isRequired: false,
                    })}
                  </div>

                  {watch().isHasInvoice ? (
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {inputFile({
                        register,
                        errors,
                        name: 'invoiceFile',
                        label: 'Upload Invoice',
                        setFile,
                      })}
                    </div>
                  ) : (
                    <>
                      <label>
                        If you do not have invoice, we will charge you
                        additional service to creating new invoice for your
                        cargo?
                      </label>
                    </>
                  )}
                </div>
              </div>
            )} */}
          </>
        )}

        <div className='text-end'>
          {(selectedTransportation || selectContainer.length > 0) && (
            <button
              type='submit'
              className='btn btn-primary btn-lg mb-5 mt-3'
              disabled={isLoadingPost}
            >
              {isLoadingPost ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                <>
                  <FaPlusCircle className='mb-1' /> Submit Your Order
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Orders)), {
  ssr: false,
})
