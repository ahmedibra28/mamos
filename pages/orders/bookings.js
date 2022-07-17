import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import useOrdersHook from '../../utils/api/orders'
import useSeaportsHook from '../../utils/api/seaports'
import useAirportsHook from '../../utils/api/airports'
import useCountriesHook from '../../utils/api/countries'
import useCommoditiesHook from '../../utils/api/commodities'
import useTownsHook from '../../utils/api/towns'
import useUploadHook from '../../utils/api/upload'

import { Spinner, Message } from '../../components'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputEmail,
  inputFile,
  inputNumber,
  inputTel,
  inputText,
  staticInputSelect,
} from '../../utils/dynamicForm'
import TransportationItem from '../../components/TransportationItem'
import { FaPlusCircle, FaSearch, FaTrash } from 'react-icons/fa'

const Orders = () => {
  const [selectedTransportation, setSelectedTransportation] = useState(null)
  const [selectContainer, setSelectContainer] = useState([])
  const [inputFields, setInputFields] = useState([
    {
      qty: 0,
      commodity: '',
      length: '',
      width: '',
      height: '',
    },
  ])
  const [file, setFile] = useState('')
  const [fileLink, setFileLink] = useState(null)

  const { postOrder, postAvailableTransportations } = useOrdersHook({})

  const { getSeaports } = useSeaportsHook({ limit: 1000000 })
  const { getAirports } = useAirportsHook({ limit: 1000000 })
  const { getCountries } = useCountriesHook({ limit: 1000000 })
  const { getCommodities } = useCommoditiesHook({ limit: 1000000 })
  const { getTowns } = useTownsHook({ limit: 1000000 })
  const { postUpload } = useUploadHook()

  const { data: seaportsData } = getSeaports
  const { data: airportsData } = getAirports
  const { data: countriesData } = getCountries
  const { data: commoditiesData } = getCommodities
  const { data: townsData } = getTowns

  const {
    data: dataUpload,
    isLoading: isLoadingUpload,
    isError: isErrorUpload,
    error: errorUpload,
    mutateAsync: mutateAsyncUpload,
    isSuccess: isSuccessUpload,
  } = postUpload

  const {
    isSuccess: isSuccessPost,
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    mutateAsync: mutateAsyncPost,
  } = postOrder

  const {
    data: transportationsData,
    mutateAsync: transportationsMutateAsync,
    isLoading: isLoadingTransportations,
  } = postAvailableTransportations

  useEffect(() => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      mutateAsyncUpload({ type: 'file', formData })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isTemperatureControlled: true,
      isHasInvoice: false,
    },
  })

  useEffect(() => {
    if (isSuccessPost) {
      reset()
      setSelectedTransportation(null)
      setFile('')
      setFileLink(null)
      setSelectContainer([])
      setInputFields([
        {
          qty: 0,
          commodity: '',
          length: '',
          width: '',
          height: '',
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessPost])

  const handleSearch = () => {
    if (
      watch().transportationType ||
      watch().pickUpAirport ||
      watch().pickUpSeaport ||
      watch().dropOffAirport ||
      watch().dropOffSeaport ||
      watch().cargoType
    ) {
      transportationsMutateAsync({
        transportationType: watch().transportationType,
        pickUpAirport: watch().pickUpAirport,
        pickUpSeaport: watch().pickUpSeaport,
        dropOffAirport: watch().dropOffAirport,
        dropOffSeaport: watch().dropOffSeaport,
        cargoType: watch().cargoType,
      })
    }
  }

  const submitHandler = (data) => {
    mutateAsyncPost({
      ...data,
      transportation: selectedTransportation,
      containerFCL: selectContainer,
      containerLCL: inputFields,
      invoice: fileLink,
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

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        qty: '',
        commodity: '',
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

  const TOTAL_CBM = inputFields
    ?.reduce(
      (acc, curr) => acc + (curr.length * curr.width * curr.height) / 1000,
      0
    )
    ?.toFixed(2)

  const seaFreightKG =
    selectContainer &&
    selectContainer.reduce(
      (acc, curr) => acc + curr.details?.seaFreight * curr.quantity,
      0
    )

  const USED_CBM = 16.33297 + Number(TOTAL_CBM)
  const DEFAULT_CAPACITY = Number(
    selectedTransportation?.container?.details?.CBM
  )
  const AVAILABLE_CBM = DEFAULT_CAPACITY - USED_CBM

  const movementTypes = {
    pickUp: ['door to door', 'door to port', 'door to airport'],
    dropOff: ['door to door', 'port to door', 'airport to door'],
    seaport: ['port to port'],
    airport: ['airport to airport'],
  }

  return (
    <>
      <Head>
        <title>Book New Orders</title>
        <meta property='og:title' content='Book New Orders' key='title' />
      </Head>

      {isSuccessPost && (
        <Message variant='success'>
          Your order has been received successfully
        </Message>
      )}

      {isErrorUpload && <Message variant='danger'>{errorUpload}</Message>}
      {isErrorPost && <Message variant='danger'>{errorPost}</Message>}

      <div className='bg-light p-3 my-2'>
        <h3>Book New Order Form</h3>
        <p>Please complete as much as you can.</p>
      </div>

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='bg-light p-3 my-2'>
          <h3>Basic Information</h3>
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
                label: 'Transportation type?',
                name: 'transportationType',
                data: [
                  // { name: 'track' },
                  { name: 'ship' },
                  // { name: 'train' },
                  { name: 'plane' },
                ],
              })}
            </div>
            <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
              {staticInputSelect({
                register,
                errors,
                label: 'Movement type?',
                name: 'movementType',
                data:
                  watch().transportationType === 'ship'
                    ? [
                        { name: 'door to door' },
                        { name: 'door to port' },
                        { name: 'port to port' },
                        { name: 'port to door' },
                      ]
                    : [
                        { name: 'door to door' },

                        { name: 'airport to airport' },
                        { name: 'door to airport' },
                        { name: 'airport to door' },
                      ],
              })}
            </div>
            {watch().transportationType !== 'plane' && (
              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {staticInputSelect({
                  register,
                  errors,
                  label: 'Cargo type?',
                  name: 'cargoType',
                  data: [{ name: 'FCL' }, { name: 'LCL' }],
                })}
              </div>
            )}
            {watch().transportationType === 'plane' && (
              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {staticInputSelect({
                  register,
                  errors,
                  label: 'Cargo type?',
                  name: 'cargoType',
                  data: [{ name: 'AIR' }],
                })}
              </div>
            )}
          </div>
        </div>
        {watch().transportationType && (
          <div className='bg-light p-3 my-2'>
            <h3>Departure and Arrival Information</h3>
            <div className='row'>
              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Pickup Country',
                  name: 'pickUpCountry',
                  value: 'name',
                  data: countriesData?.data?.filter(
                    (country) => country.status === 'active'
                  ),
                })}
              </div>
              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {watch().transportationType === 'ship' &&
                  dynamicInputSelect({
                    register,
                    errors,
                    label: 'Pickup Seaport',
                    name: 'pickUpSeaport',
                    value: 'name',
                    data: seaportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().pickUpCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().dropOffSeaport
                    ),
                  })}
                {watch().transportationType === 'plane' &&
                  dynamicInputSelect({
                    register,
                    errors,
                    label: 'Pickup Airport',
                    name: 'pickUpAirport',
                    value: 'name',
                    data: airportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().pickUpCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().dropOffAirport
                    ),
                  })}
              </div>

              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Destination Country',
                  name: 'dropOffCountry',
                  value: 'name',
                  data: countriesData?.data?.filter(
                    (country) => country.status === 'active'
                  ),
                })}
              </div>
              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {watch().transportationType === 'ship' &&
                  dynamicInputSelect({
                    register,
                    errors,
                    label: 'Destination Seaport',
                    name: 'dropOffSeaport',
                    value: 'name',
                    data: seaportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().dropOffCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().pickUpSeaport
                    ),
                  })}
                {watch().transportationType === 'plane' &&
                  dynamicInputSelect({
                    register,
                    errors,
                    label: 'Destination Airport',
                    name: 'dropOffAirport',
                    value: 'name',
                    data: airportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().dropOffCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().pickUpAirport
                    ),
                  })}
              </div>
            </div>
          </div>
        )}

        {isLoadingTransportations ? (
          <Spinner />
        ) : (
          transportationsData && (
            <div className='bg-light p-3 my-2'>
              <h3>Available transportations based on your lookup</h3>

              <div className='row gy-3'>
                {transportationsData
                  ?.filter((item) => item?.cargoType === watch().cargoType)
                  ?.map((item) => (
                    <div
                      key={item._id}
                      className='col-lg-3 col-md-4 col-sm-6 col-12'
                    >
                      <TransportationItem
                        item={item}
                        setSelectedTransportation={setSelectedTransportation}
                        selectedTransportation={selectedTransportation}
                        addContainer={addContainer}
                        removeContainer={removeContainer}
                        selectContainer={selectContainer}
                        cargoType={watch().cargoType}
                      />
                    </div>
                  ))}
                <div className='col-12'>
                  {transportationsData?.length === 0 && (
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
        {watch().cargoType !== 'FCL' &&
          selectedTransportation &&
          selectedTransportation?.cargoType !== 'FCL' &&
          transportationsData?.filter(
            (item) => item?.cargoType === watch().cargoType
          )?.length > 0 && (
            <div className='bg-light p-3 my-2'>
              <h3>Cargo Details</h3>
              <h6>
                Total CBM [{TOTAL_CBM} M<sup>3</sup>]
              </h6>
              <label>Tell us a bit more about your cargo.</label>
              {inputFields.map((inputField, index) => (
                <div key={index} className='mt-3'>
                  <h6 className='font-monospace'>{`Package #${index + 1}`}</h6>
                  <div className='row gy-3'>
                    <div className='col-12'>
                      <div className='progress ' style={{ height: '20px' }}>
                        <div
                          className={`progress-bar bg-warning ${
                            (USED_CBM * 100) / DEFAULT_CAPACITY > 90 &&
                            'bg-danger'
                          }`}
                          role='progressbar'
                          style={{
                            width: `${(USED_CBM * 100) / DEFAULT_CAPACITY}%`,
                          }}
                          aria-valuenow={(USED_CBM * 100) / DEFAULT_CAPACITY}
                          aria-valuemin='0'
                          aria-valuemax={DEFAULT_CAPACITY}
                        >
                          {`${((USED_CBM * 100) / DEFAULT_CAPACITY).toFixed(
                            2
                          )}%`}
                        </div>
                      </div>
                    </div>
                    <div className='col-12'>
                      <p className='text-danger text-center'>
                        {AVAILABLE_CBM < 0 &&
                          `You have reached the maximum available CBM `}
                      </p>
                    </div>
                    <div className='col-lg-2 col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Package Quantity
                      </label>
                      <input
                        type='number'
                        min={0}
                        className='form-control '
                        placeholder='Package quantity'
                        name='qty'
                        id='qty'
                        value={inputField.qty}
                        required
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>

                    <div className='col-lg-2 col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Commodity
                      </label>
                      <select
                        className='form-control '
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
                            c.status === 'active' && (
                              <option value={c._id} key={c._id}>
                                {c.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>

                    <div className='col-lg-2 col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Length (cm)
                      </label>
                      <input
                        type='number'
                        min={0}
                        className='form-control '
                        placeholder='Length'
                        name='length'
                        id='length'
                        value={inputField.length}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>

                    <div className='col-lg-2 col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Width (cm)
                      </label>
                      <input
                        type='number'
                        min={0}
                        className='form-control '
                        placeholder='Width'
                        name='width'
                        id='width'
                        value={inputField.width}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>
                    <div className='col-lg-2 col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Height (cm)
                      </label>
                      <input
                        type='number'
                        min={0}
                        className='form-control '
                        placeholder='Height'
                        name='height'
                        id='height'
                        value={inputField.height}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>

                    <div className='col-lg-2 col-md-3 col-6 mb-0 my-auto text-end'>
                      <button
                        type='button'
                        onClick={() => handleRemoveField(index)}
                        className='btn btn-danger'
                      >
                        <FaTrash className='mb-1' /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className='text-end mt-3'>
                <button
                  onClick={() => handleAddField()}
                  type='button'
                  className='btn btn-primary'
                >
                  <FaPlusCircle className='mb-1' /> Add Package
                </button>
              </div>
            </div>
          )}
        {selectContainer?.length > 0 &&
          watch().cargoType === 'FCL' &&
          transportationsData?.filter(
            (item) => item?.cargoType === watch().cargoType
          )?.length > 0 && (
            <div className='bg-light p-3 my-2'>
              <h3>Cargo Details</h3>
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
                        (commodity) => commodity.status === 'active'
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
          )}

        {(selectContainer?.length > 0 || selectedTransportation) &&
          transportationsData?.filter(
            (item) => item?.cargoType === watch().cargoType
          )?.length > 0 && (
            <div className='bg-light p-3 my-2'>
              <h3>Buyer Details</h3>
              <label>
                Enter the buyers details so they can be notified about the
                shipment and track the process
              </label>
              <div className='row gy-3 mt-3'>
                <div className='col-12'>
                  <label className='fw-bold'>
                    Person who will receive packages
                  </label>
                </div>
                <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
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

        {transportationsData?.filter(
          (item) => item?.cargoType === watch().cargoType
        )?.length > 0 &&
          (selectContainer?.length > 0 || selectedTransportation) &&
          !['port to port', 'airport to airport'].includes(
            watch().movementType
          ) && (
            <div className='bg-light p-3 my-2'>
              <h3>Location Details</h3>
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
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {dynamicInputSelect({
                        register,
                        errors,
                        label: 'Pickup town',
                        name: 'pickUpTown',
                        value: 'name',
                        data: townsData?.data?.filter((town) =>
                          town.status === 'active' &&
                          watch().transportationType === 'plane'
                            ? town?.airport?._id === watch().pickUpAirport
                            : town?.seaport?._id === watch().pickUpSeaport
                        ),
                      })}
                    </div>
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {inputText({
                        register,
                        errors,
                        name: 'pickUpWarehouse',
                        label: 'Warehouse Name',
                        placeholder: 'Enter pickUp warehouse name',
                      })}
                    </div>
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {inputText({
                        register,
                        errors,
                        name: 'pickUpCity',
                        label: 'City',
                        placeholder: 'Enter pickUp city',
                      })}
                    </div>

                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
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
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {dynamicInputSelect({
                        register,
                        errors,
                        label: 'DropOff town',
                        name: 'dropOffTown',
                        value: 'name',
                        data: townsData?.data?.filter((town) =>
                          town.status === 'active' &&
                          watch().transportationType === 'plane'
                            ? town?.airport?._id === watch().dropOffAirport
                            : town?.seaport?._id === watch().dropOffSeaport
                        ),
                      })}
                    </div>
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {inputText({
                        register,
                        errors,
                        name: 'dropOffWarehouse',
                        label: 'Warehouse Name',
                        placeholder: 'Enter drop-off warehouse name',
                      })}
                    </div>
                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                      {inputText({
                        register,
                        errors,
                        name: 'dropOffCity',
                        label: 'City',
                        placeholder: 'Enter drop-off city',
                      })}
                    </div>

                    <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
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

        {transportationsData?.filter(
          (item) => item?.cargoType === watch().cargoType
        )?.length > 0 &&
          (selectContainer?.length > 0 || selectedTransportation) && (
            <div className='bg-light p-3 my-2'>
              <h3>Other Required Details</h3>
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
                      If you do not have invoice, we will charge you additional
                      service to creating new invoice for your cargo?
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

        {(selectedTransportation || selectContainer.length > 0) && (
          <button
            type='submit'
            className='btn btn-primary float-end mb-5 mt-3'
            disabled={isLoadingUpload || isLoadingPost}
          >
            {isLoadingUpload || isLoadingPost ? (
              <span className='spinner-border spinner-border-sm' />
            ) : (
              <>
                <FaPlusCircle className='mb-1' /> Submit Your Order
              </>
            )}
          </button>
        )}

        <button
          type='button'
          onClick={() => handleSearch()}
          className='btn btn-outline-primary btn-sm float-end mb-5 mt-3 me-3'
          disabled={isLoadingUpload || isLoadingPost}
        >
          {isLoadingUpload || isLoadingPost ? (
            <span className='spinner-border spinner-border-sm' />
          ) : (
            <>
              <FaSearch className='mb-1' /> Search Available Transportors
            </>
          )}
        </button>
      </form>
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Orders)), {
  ssr: false,
})
