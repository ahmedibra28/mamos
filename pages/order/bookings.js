import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useBookingsHook from '../../utils/api/booking'
import useSeaportsHook from '../../utils/api/seaports'
import useAirportsHook from '../../utils/api/airports'
import useCountriesHook from '../../utils/api/countries'
import useCommoditiesHook from '../../utils/api/commodities'

import { Spinner, Message, Confirm } from '../../components'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputNumber,
  inputText,
  staticInputSelect,
} from '../../utils/dynamicForm'
import TransportationItem from '../../components/TransportationItem'
import { FaMinusCircle, FaPlusCircle, FaTrash } from 'react-icons/fa'

const Bookings = () => {
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

  const { postBookings, postAvailableTransportations } = useBookingsHook({})
  const { getSeaports } = useSeaportsHook({ limit: 1000000 })
  const { getAirports } = useAirportsHook({ limit: 1000000 })
  const { getCountries } = useCountriesHook({ limit: 1000000 })
  const { getCommodities } = useCommoditiesHook({ limit: 1000000 })

  const { data: seaportsData } = getSeaports
  const { data: airportsData } = getAirports
  const { data: countriesData } = getCountries
  const { data: commoditiesData } = getCommodities

  const {
    data: transportationsData,
    mutateAsync: transportationsMutateAsync,
    isLoading: isLoadingTransportations,
  } = postAvailableTransportations

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      isTemperatureControlled: true,
    },
  })

  const submitHandler = (data) => {
    console.log({
      ...data,
      transportation: selectedTransportation,
      containerFCL: selectContainer,
      containerLCL: inputFields,
    })
    transportationsMutateAsync({
      transportationType: data.transportationType,
      pickupAirport: data.pickupAirport,
      pickupSeaport: data.pickupSeaport,
      destinationAirport: data.destinationAirport,
      destinationSeaport: data.destinationSeaport,
      cargoType: data.cargoType,
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

  const airFreightKG =
    selectContainer &&
    selectContainer.reduce(
      (acc, curr) => acc + curr.details?.airFreight * curr.quantity,
      0
    )

  const USED_CBM = 16.33297 + Number(TOTAL_CBM)
  const DEFAULT_CAPACITY = Number(
    selectedTransportation?.container?.details?.CBM
  )
  const AVAILABLE_CBM = DEFAULT_CAPACITY - USED_CBM

  return (
    <>
      <Head>
        <title>Book New Bookings</title>
        <meta property='og:title' content='Book New Bookings' key='title' />
      </Head>

      <div className='bg-light p-3 my-2'>
        <h3>New Booking Form</h3>
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
                data: [
                  { name: 'door to door' },
                  { name: 'door to airport' },
                  { name: 'door to port' },

                  { name: 'airport to airport' },
                  { name: 'airport to door' },

                  { name: 'port to port' },
                  { name: 'port to door' },
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
                  name: 'pickupCountry',
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
                    name: 'pickupSeaport',
                    value: 'name',
                    data: seaportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().pickupCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().destinationSeaport
                    ),
                  })}
                {watch().transportationType === 'plane' &&
                  dynamicInputSelect({
                    register,
                    errors,
                    label: 'Pickup Airport',
                    name: 'pickupAirport',
                    value: 'name',
                    data: airportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().pickupCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().destinationAirport
                    ),
                  })}
              </div>

              <div className='col-lg-3 col-md-4 col-sm-6 col-12'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Destination Country',
                  name: 'destinationCountry',
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
                    name: 'destinationSeaport',
                    value: 'name',
                    data: seaportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().destinationCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().pickupSeaport
                    ),
                  })}
                {watch().transportationType === 'plane' &&
                  dynamicInputSelect({
                    register,
                    errors,
                    label: 'Destination Airport',
                    name: 'destinationAirport',
                    value: 'name',
                    data: airportsData?.data?.filter(
                      (item) =>
                        item?.country?._id === watch().destinationCountry &&
                        item?.status === 'active' &&
                        item._id !== watch().pickupAirport
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
                          className={`progress-bar ${
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
                    max: airFreightKG,
                    placeholder: 'Enter gross weight as KG',
                  })}
                </div>
                {console.log(airFreightKG)}
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

        <button
          type='submit'
          className='btn btn-primary float-end'
          // disabled={!isValid || AVAILABLE_CBM < 0}
        >
          {/* {isLoadingPost || isLoadingUpdate ? (
                    <span className='spinner-border spinner-border-sm' />
                  ) : (
                    'Submit'
                  )} */}
          Submit
        </button>
      </form>
    </>
  )
}

// export default dynamic(() => Promise.resolve(withAuth(Bookings)), {
//     ssr: false,
//   })

export default Bookings
