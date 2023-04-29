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
import {
  FaArrowAltCircleLeft,
  FaMinusCircle,
  FaPlusCircle,
  FaSearch,
  FaTrash,
} from 'react-icons/fa'
import apiHook from '../../api'

const Orders = () => {
  const [selectedTransportation, setSelectedTransportation] = useState(null)
  const [selectContainer, setSelectContainer] = useState([])
  const [inputFields, setInputFields] = useState([
    {
      qty: 0,
      packageUnit: '',
      weight: 0,
      commodity: '',
      unit: '',
      length: '',
      width: '',
      height: '',
    },
  ])

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

  const postOrderApi = apiHook({
    key: ['order-lcl'],
    method: 'POST',
    url: `orders/orders/lcl`,
  })?.post

  useEffect(() => {
    if (postOrderApi?.isSuccess) {
      reset()
      setSelectedTransportation(null)
      setInputFields([
        {
          qty: 0,
          packageUnit: '',
          weight: 0,
          commodity: '',
          unit: '',
          length: '',
          width: '',
          height: '',
        },
      ])
      // setFile('')
      // setFileLink(null)
      setSelectContainer([])
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTransportationsData(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postOrderApi?.isSuccess])

  const handleSearch = () => {
    if (watch().pickUpSeaport || watch().dropOffSeaport) {
      transportationsMutateAsync({
        pickUpSeaport: watch().pickUpSeaport,
        dropOffSeaport: watch().dropOffSeaport,
        cargo: 'LCL',
      })
    }
  }

  const submitHandler = (data) => {
    postOrderApi.mutateAsync({
      ...data,
      transportation: selectedTransportation,
      containers: inputFields,
      // invoice: fileLink,
    })
  }

  // const addContainer = (container) => {
  //   const existed = selectContainer.find((c) => c._id === container._id)
  //   if (existed) {
  //     const newSelectContainer = selectContainer.map((c) => {
  //       if (c._id === container._id) {
  //         return {
  //           ...container,
  //           quantity: c.quantity + 1,
  //         }
  //       }
  //       return c
  //     })
  //     setSelectContainer(newSelectContainer)
  //   } else {
  //     setSelectContainer([...selectContainer, { ...container, quantity: 1 }])
  //   }
  // }

  // const removeContainer = (container) => {
  //   const newSelectContainer = selectContainer.map((c) => {
  //     if (c._id === container._id && c.quantity > 1) {
  //       return {
  //         ...container,
  //         quantity: c.quantity - 1,
  //       }
  //     }
  //     if (c._id === container._id && c.quantity === 1) {
  //       return null
  //     }
  //     return c
  //   })

  //   setSelectContainer(newSelectContainer.filter((f) => f !== null))
  // }

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        qty: '',
        packageUnit: '',
        weight: '',
        commodity: '',
        unit: '',
        length: '',
        width: '',
        height: '',
      },
    ])
  }

  const handleRemoveField = (index) => {
    const list = [...inputFields]
    list.splice(index, 1)
    setInputFields(list)
  }

  const handleInputChange = (e, index) => {
    const { name, value } = e.target
    const old = inputFields[index]
    const updated = { ...old, [name]: value }
    var list = [...inputFields]
    list[index] = updated
    setInputFields(list)
  }

  const postLCLApi = apiHook({
    key: ['transportation-lcl'],
    method: 'POST',
    url: `orders/bookedlcl`,
  })?.post

  useEffect(() => {
    if (selectedTransportation?.cargo === 'LCL') {
      postLCLApi.mutateAsync({
        _id: selectedTransportation._id,
        cargo: selectedTransportation.cargo,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransportation])

  const DEFAULT_LCL_CAPACITY = selectedTransportation?.TOTAL_CBM

  const USED_LCL_CBM = selectedTransportation?.totalBookedCBM

  const AVAILABLE_LCL_CBM = DEFAULT_LCL_CAPACITY - USED_LCL_CBM

  const TotalCBM =
    inputFields &&
    inputFields.reduce(
      (acc, curr) => acc + curr.length * curr.width * curr.height * curr.qty,
      0
    ) / 1000000

  const TotalKG =
    inputFields &&
    inputFields.reduce((acc, curr) => acc + curr.weight * curr.qty, 0)

  const LCLPrice = 0
  // selectedShipment && selectedShipment.price * TotalCBM * 167

  const movementTypes = {
    pickUp: ['door to door', 'door to port'],
    dropOff: ['door to door', 'port to door'],
    seaport: ['port to port'],
  }

  // const getVendorsApi = apiHook({
  //   key: ['vendors'],
  //   method: 'GET',
  //   url: `setting/vendors?page=${1}&q=&limit=${2500}`,
  // })?.get

  return (
    <>
      <Head>
        <title>Book New Shipment</title>
        <meta property='og:title' content='Book New Shipment' key='title' />
      </Head>

      {/* {postLCLApi?.isSuccess && (
        <Message variant='success'>
          Your order has been received successfully
        </Message>
      )} */}

      {/* {isErrorUpload && <Message variant='danger'>{errorUpload}</Message>} */}
      {postOrderApi?.isError && (
        <Message variant='danger'>{postOrderApi?.error}</Message>
      )}

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
                disabled={postOrderApi?.isLoading}
              >
                {postOrderApi?.isLoading ? (
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

        <>
          {selectedTransportation &&
            selectedTransportation.cargo === 'LCL' &&
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
            <div className='row gx-2 my-2'>
              {postLCLApi?.data && selectedTransportation && (
                <div className='row gx-2 my-2'>
                  <div className='col-12'>
                    <h4 className='fw-bold font-monospace'>Cargo Details</h4>
                    <label>Tell us a bit more about your cargo.</label>

                    <div className='col-12'>
                      <div className='progress'>
                        <div
                          className='progress-bar'
                          role='progressbar'
                          style={{
                            width: `${
                              ((USED_LCL_CBM + TotalCBM) * 100) /
                              DEFAULT_LCL_CAPACITY
                            }%`,
                          }}
                          aria-valuenow={
                            ((USED_LCL_CBM + TotalCBM) * 100) /
                            DEFAULT_LCL_CAPACITY
                          }
                          aria-valuemin='0'
                          aria-valuemax={DEFAULT_LCL_CAPACITY}
                        >
                          {`${(
                            ((USED_LCL_CBM + TotalCBM) * 100) /
                            DEFAULT_LCL_CAPACITY
                          ).toFixed(2)}%`}
                        </div>
                      </div>
                    </div>
                    <div className='col-'>
                      <p className='text-danger text-center'>
                        {AVAILABLE_LCL_CBM < TotalCBM &&
                          `You can use more than ${AVAILABLE_LCL_CBM} CBM in total`}
                      </p>
                    </div>

                    {inputFields.map((inputField, index) => (
                      <div key={index}>
                        <h6 className='font-monospace'>{`Package #${
                          index + 1
                        }`}</h6>
                        <div className='row gx-1 p-2'>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Package Quantity
                            </label>
                            <input
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Package quantity'
                              name='qty'
                              id='qty'
                              value={inputField.qty}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              P. Unit
                            </label>
                            <select
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Unit'
                              name='packageUnit'
                              id='packageUnit'
                              value={inputField.packageUnit}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            >
                              <option value='boxes'>Boxes</option>
                              <option value='pieces'>Pieces</option>
                              <option value='pallets'>Pallets</option>
                              <option value='bags'>Bags</option>
                            </select>
                          </div>

                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Weight as KG
                            </label>
                            <input
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Weight'
                              name='weight'
                              id='weight'
                              value={inputField.weight}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>

                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Commodity
                            </label>
                            <select
                              className='form-control form-control-sm'
                              placeholder='Commodity'
                              name='commodity'
                              id='commodity'
                              value={inputField.commodity}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            >
                              <option value=''>-------</option>

                              {commoditiesData?.data?.map(
                                (c) =>
                                  c.status === 'Active' && (
                                    <option value={c._id} key={c._id}>
                                      {c.name}
                                    </option>
                                  )
                              )}
                            </select>
                          </div>

                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              CBM Unit
                            </label>
                            <select
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Unit'
                              name='unit'
                              id='unit'
                              value={inputField.unit}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            >
                              <option value='cm'>CM</option>
                            </select>
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Length
                            </label>
                            <input
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Length'
                              name='length'
                              id='length'
                              value={inputField.length}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>

                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Width
                            </label>
                            <input
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Width'
                              name='width'
                              id='width'
                              value={inputField.width}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Height
                            </label>
                            <input
                              type='number'
                              min={0}
                              className='form-control form-control-sm'
                              placeholder='Height'
                              name='height'
                              id='height'
                              value={inputField.height}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-12 mt-3'></div>
                          <div className='col-md-4 col-12'>
                            <button
                              type='button'
                              className='btn btn-light btn-sm form-control form control-sm'
                            >
                              Total Weight: {inputField.qty * inputField.weight}{' '}
                              KG
                            </button>
                          </div>
                          <div className='col-md-4 col-12'>
                            <button
                              type='button'
                              className='btn btn-light btn-sm form-control form control-sm'
                            >
                              CBM:{' '}
                              {(inputField.length *
                                inputField.width *
                                inputField.height *
                                inputField.qty) /
                                1000000}{' '}
                              M<sup>3</sup>
                            </button>
                          </div>
                          <div className='col-md-4 col-12'>
                            <button
                              type='button'
                              onClick={() => handleRemoveField(index)}
                              className='btn btn-danger btn-sm form-control form-control-sm'
                            >
                              <FaTrash className='mb-1' /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {postLCLApi?.data && (
                <div className='text-center my-3'>
                  <button
                    onClick={() => handleAddField()}
                    type='button'
                    className='btn btn-primary btn-sm my-2'
                  >
                    <FaPlusCircle className='mb-1' /> Add New Package
                  </button>
                </div>
              )}
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

        <div className='text-end'>
          {(selectedTransportation || selectContainer.length > 0) && (
            <button
              type='submit'
              className='btn btn-primary btn-lg mb-5 mt-3'
              disabled={postOrderApi?.isLoading}
            >
              {postOrderApi?.isLoading ? (
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
