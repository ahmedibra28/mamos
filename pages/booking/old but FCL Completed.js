import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import {
  FaArrowAltCircleRight,
  FaCheckCircle,
  FaPlusCircle,
  FaSearch,
  FaMinusCircle,
  FaTrash,
  FaShip,
  FaExchangeAlt,
  FaAngleDoubleRight,
  FaLongArrowAltRight,
  FaClock,
  FaBook,
  FaDollarSign,
} from 'react-icons/fa'
import useAirports from '../../api/airports'
import useCountries from '../../api/countries'
import useCommodities from '../../api/commodities'
import useSeaports from '../../api/seaports'
import useContainers from '../../api/containers'
import useShippers from '../../api/shippers'
import {
  staticInputSelect,
  dynamicInputSelect,
  inputText,
  inputNumber,
  inputTextArea,
  inputFile,
  inputCheckBox,
  inputEmail,
} from '../../utils/dynamicForm'
import Image from 'next/image'
import moment from 'moment'

const Booking = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isTemperatureControlled: false,
      isIdentityNotConfirmed: false,
    },
  })
  const [shippers, setShippers] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)

  const { getCountries } = useCountries()
  const { getCommodities } = useCommodities()
  const { getSeaports } = useSeaports()
  const { getAirports } = useAirports()
  const { getContainers } = useContainers()
  const { getShippers } = useShippers()

  const { data: countriesData } = getCountries
  const { data: commoditiesData } = getCommodities
  const { data: seaportsData } = getSeaports
  const { data: airportsData } = getAirports
  const { data: containersData } = getContainers
  const { data: shippersData } = getShippers

  const availableTransportationType = shippersData && [
    ...new Set(
      shippersData.map(
        (shipper) => shipper.isActive && shipper.transportationType
      )
    ),
  ]
  const availableCargoType = shippersData && [
    ...new Set(
      shippersData.map((shipper) => shipper.isActive && shipper.cargoType)
    ),
  ]
  const availableMovementType = shippersData && [
    ...new Set(
      shippersData.map((shipper) => shipper.isActive && shipper.movementType)
    ),
  ]

  const [selectContainer, setSelectContainer] = useState([])
  const [availableShippers, setAvailableShippers] = useState([])
  const [inputFields, setInputFields] = useState([
    {
      qty: 0,
      packageUnit: '',
      weight: 0,
      weightUnit: '',
      unit: '',
      length: '',
      width: '',
      height: '',
    },
  ])

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        qty: '',
        packageUnit: '',
        weight: '',
        weightUnit: '',
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

  const TotalCBM =
    inputFields &&
    inputFields.reduce(
      (acc, curr) => acc + curr.length * curr.width * curr.height,
      0
    )

  const TotalKG =
    inputFields &&
    inputFields.reduce((acc, curr) => acc + curr.weight * curr.qty, 0)

  const totalContainerKG =
    selectContainer &&
    selectContainer.reduce(
      (acc, curr) => acc + curr.payloadCapacity * curr.quantity,
      0
    )

  const submitHandler = (data) => {
    const availableShippers =
      shippersData &&
      shippersData.filter(
        (shipper) =>
          shipper.isActive &&
          shipper.transportationType === data.transportationType &&
          shipper.cargoType === data.cargoType &&
          // shipper.movementType === data.movementType &&
          shipper.departureSeaport._id === data.pickupPort &&
          shipper.arrivalSeaport._id === data.destPort
      )

    setAvailableShippers(availableShippers)
    // const filterShippers =
    //   shippersData &&
    //   shippersData.filter((ship) => ship.type === data.transportationType)
    // if (filterShippers && filterShippers.length > 0) {
    //   const shippers = filterShippers.map((ship) => ({
    //     _id: ship._id,
    //     name: ship.name,
    //     price: ship.price.toFixed(2),
    //     deliveryTime: ship.deliveryTime,
    //     total: (ship.price * TotalKG).toFixed(2),
    //   }))
    //   setShippers(shippers ? shippers : [])
    // }
  }

  const containers = [
    { _id: '61e649f6733d4c2930b6f202', container: '45 High', available: '86%' },
    { _id: '61e64967733d4c2930b6f1e0', container: '40 FT', available: '0%' },
    { _id: '61e64931733d4c2930b6f1d2', container: '20 FT', available: '13%' },
    {
      _id: '61e648a2733d4c2930b6f1c0',
      container: '40 FT High',
      available: '100%',
    },
  ]

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

  return (
    <div className='mt-1'>
      <h1 className='display-6 text-center font-monospace'>
        Book New Shipment
      </h1>
      <p className='text-center'>
        Please complete as much of the rate enquiry form as possible in order
        for your MAMOS team to provide an accurate freight rate quotation.
      </p>
      <hr />

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row gx-2 my-2 my-2'>
          <div className='col-md-3 col-6'>
            {staticInputSelect({
              register,
              errors,
              label: 'Import/Export *',
              name: 'importExport',
              data: [{ name: 'import' }, { name: 'export' }],
            })}
          </div>
          <div className='col-md-3 col-6'>
            {staticInputSelect({
              register,
              errors,
              label: 'Transportation Type *',
              name: 'transportationType',
              data:
                availableTransportationType &&
                availableTransportationType.map((type) => ({ name: type })),
            })}
          </div>

          <div className='col-md-3 col-6'>
            {staticInputSelect({
              register,
              errors,
              label: 'Cargo Type*',
              name: 'cargoType',
              data:
                availableCargoType &&
                availableCargoType.map((type) => ({ name: type })),
            })}
          </div>

          <div className='col-md-3 col-6'>
            {staticInputSelect({
              register,
              errors,
              label: 'Movement Type *',
              name: 'movementType',
              data:
                availableMovementType &&
                availableMovementType.map((type) => ({ name: type })),
            })}
          </div>

          {watch().cargoType === 'FCL' && (
            <div className='col-md-6 col-12'>
              {containersData &&
                containersData.map((container) => (
                  <div key={container._id}>
                    <div className='btn-group mt-1'>
                      <button
                        disabled={
                          !selectContainer.find((c) => c._id === container._id)
                        }
                        onClick={() => removeContainer(container)}
                        type='button'
                        className='btn btn-danger btn-sm'
                      >
                        <FaMinusCircle className='mb-1' />
                      </button>

                      <button type='button' className='btn btn-light btn-sm'>
                        {selectContainer.map(
                          (c) => c._id === container._id && c.quantity
                        )}
                        {!selectContainer.find(
                          (c) => c._id === container._id
                        ) && 0}
                      </button>

                      <button
                        onClick={() => addContainer(container)}
                        type='button'
                        className='btn btn-success btn-sm'
                      >
                        <FaPlusCircle className='mb-1' />
                      </button>
                      <button type='button' className='btn btn-light btn-sm'>
                        {container.name} - Fits up to{' '}
                        {container.payloadCapacity} &{' '}
                        {(
                          container.length *
                          container.width *
                          container.height *
                          0.000001
                        ).toFixed(0)}{' '}
                        M<sup>3</sup>
                      </button>
                    </div>
                    <br />
                  </div>
                ))}
            </div>
          )}
          <div className='row gx-2 my-2'>
            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Pickup Country *',
                name: 'pickupCountry',
                value: 'name',
                data:
                  countriesData &&
                  countriesData.filter(
                    (country) =>
                      country.isActive && country._id !== watch().destCountry
                  ),
              })}
            </div>
            {watch().cargoType === 'AIR' ? (
              <div className='col-md-3 col-6'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Pickup Airport *',
                  name: 'pickupAirport',
                  value: 'name',
                  data:
                    airportsData &&
                    airportsData.filter(
                      (airport) =>
                        airport.country._id === watch().pickupCountry &&
                        airport.isActive
                    ),
                })}
              </div>
            ) : (
              <div className='col-md-3 col-6'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Pickup Port *',
                  name: 'pickupPort',
                  value: 'name',
                  data:
                    seaportsData &&
                    seaportsData.filter(
                      (seaport) =>
                        seaport.country._id === watch().pickupCountry &&
                        seaport.isActive
                    ),
                })}
              </div>
            )}

            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Dest Country *',
                name: 'destCountry',
                value: 'name',
                data:
                  countriesData &&
                  countriesData.filter(
                    (country) =>
                      country.isActive && country._id !== watch().pickupCountry
                  ),
              })}
            </div>
            {watch().cargoType === 'AIR' ? (
              <div className='col-md-3 col-6'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Dest Airport *',
                  name: 'destAirport',
                  value: 'name',
                  data:
                    airportsData &&
                    airportsData.filter(
                      (airport) =>
                        airport.country._id === watch().destCountry &&
                        airport.isActive
                    ),
                })}
              </div>
            ) : (
              <div className='col-md-3 col-6'>
                {dynamicInputSelect({
                  register,
                  errors,
                  label: 'Dest Port *',
                  name: 'destPort',
                  value: 'name',
                  data:
                    seaportsData &&
                    seaportsData.filter(
                      (seaport) =>
                        seaport.country._id === watch().destCountry &&
                        seaport.isActive
                    ),
                })}
              </div>
            )}
          </div>

          <button className='btn btn-primary btn-sm'>
            <FaSearch className='mb-1' /> Search Available Vessels
          </button>
        </div>
      </form>
      {availableShippers && availableShippers.length > 0 && (
        <div className='row gy-2'>
          {availableShippers ? (
            availableShippers.map((shipper) => (
              <div key={shipper._id} className='col-lg-4 col-md-6 col-12'>
                <div className='card'>
                  <div className='card-header text-center'>
                    <h4 className='text-center'>{shipper.name}</h4>
                  </div>
                  <div className='card-body'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <button
                        type='button'
                        className='btn btn-light btn-sm float-start'
                      >
                        <FaShip className='mb-1 fs-4' /> <br />
                        {shipper.departureSeaport.name} <br />
                        <span
                          className='fw-lighter'
                          style={{ fontSize: '12px' }}
                        >
                          {moment(shipper.departureDate).format('DD MMM')}
                        </span>
                      </button>
                      <button
                        type='button'
                        className='btn btn-light btn-sm my-auto'
                      >
                        <FaLongArrowAltRight className='mb-1 fs-4 text-success' />
                      </button>
                      <button
                        type='button'
                        className='btn btn-light btn-sm float-end'
                      >
                        <FaShip className='mb-1 fs-4' /> <br />{' '}
                        {shipper.arrivalSeaport.name} <br />
                        <span
                          className='fw-lighter'
                          style={{ fontSize: '12px' }}
                        >
                          {moment(shipper.arrivalDate).format('DD MMM')}
                        </span>
                      </button>
                    </div>
                    <hr />

                    <div className='d-flex justify-content-between align-items-center'>
                      <button type='button' className='btn btn-light btn-sm'>
                        <FaClock className='mb-1 fs-6' />{' '}
                        <span className='fw-bold fs-6'>
                          {moment(new Date(shipper.arrivalDate))
                            .diff(
                              moment(new Date(shipper.departureDate)),
                              'days'
                            )
                            .toLocaleString()}{' '}
                          days
                        </span>
                      </button>
                      <button type='button' className='btn btn-light btn-sm'>
                        <span className='fw-bold fs-6'>
                          <FaDollarSign className='mb-1 fs-6' />
                          {(
                            Number(totalContainerKG) * shipper.price
                          ).toLocaleString()}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className='card-footer'>
                    <button
                      onClick={() => setSelectedShipment(shipper)}
                      className='btn btn-primary btn-sm form-control'
                    >
                      <FaCheckCircle className='mb-1' /> Select Shipment
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span className='text-center text-danger'>
              No Shipper Available
            </span>
          )}
        </div>
      )}

      {/* Display if shipment is selected */}
      {selectedShipment && (
        <div className='row gx-2 my-2'>
          <div className='col-12'>
            <h5>CARGO DETAILS</h5>
            <p>Tel us a bit more about your cargo.</p>
          </div>

          <div className='col-6'>
            {inputText({
              register,
              errors,
              name: 'cargoDescription',
              label: 'Cargo Description',
            })}
          </div>
          <div className='col-6'>
            {dynamicInputSelect({
              register,
              errors,
              label: 'Commodity *',
              name: 'commodity',
              value: 'name',
              data:
                commoditiesData &&
                commoditiesData.filter((commodity) => commodity.isActive),
            })}
          </div>
          <div className='col-6'>
            {inputNumber({
              register,
              errors,
              name: 'noOfPackages',
              label: 'No. of Packages',
            })}
          </div>
          <div className='col-6'>
            {inputNumber({
              register,
              errors,
              name: 'grossWeight',
              label: 'Gross Weight as KG',
              max: totalContainerKG,
            })}
          </div>
          <div className='col-6'>
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
      )}

      {/* Buyer details */}
      {selectedShipment && watch().importExport === 'export' && (
        <div className='row gx-2 my-2'>
          <div className='col-12'>
            <h5>BUYER DETAILS</h5>
            <p>
              Your booking for export, which means you supply this shipment to
              your buyer (or consignee). Enter your buyers details to they can
              be notified about you shipment and track the process
            </p>
          </div>
          <div className='col-12'>
            <label>Person who will receive package</label>
          </div>
          <div className='col-6'>
            {inputText({
              register,
              errors,
              name: 'buyerName',
              label: 'Who is your buyer?',
            })}
          </div>
          <div className='col-6'>
            {inputNumber({
              register,
              errors,
              name: 'buyerMobileNumber',
              label: 'Buyer mobile number',
            })}
          </div>
          <div className='col-6'>
            {inputEmail({
              register,
              errors,
              name: 'buyerEmail',
              label: 'Buyer email',
            })}
          </div>

          <div className='col-7'>
            {inputCheckBox({
              register,
              errors,
              name: 'isIdentityNotConfirmed',
              isRequired: false,
              label: 'I do not know my buyer yet',
            })}
          </div>
        </div>
      )}

      {/* Shipment Export details */}
      {selectedShipment && watch().importExport === 'export' && (
        <div className='row gx-2 my-2 shadow'>
          <div className='col-12'>
            <h5>SHIPMENT DETAILS</h5>
            <p>
              Your booking for export, which means you supply this shipment to
              your buyer (or consignee). Enter your buyers details to they can
              be notified about you shipment and track the process
            </p>
          </div>
          <div className='col-12'>
            <h6>
              Direction:{' '}
              <span className='fw-light'>{watch().importExport}</span>{' '}
            </h6>
          </div>
          <div className='col-12'>
            <h6>
              Shipment Service:{' '}
              <span className='fw-light'>{watch().movementType}</span>{' '}
            </h6>
          </div>
          <div className='col-12'>
            <h6>
              Departure Date:{' '}
              <span className='fw-light'>{selectedShipment.departureDate}</span>{' '}
            </h6>
          </div>
          <div className='col-12'>
            <h6>
              Transit Time: <span className='fw-light'>100 days</span>{' '}
            </h6>
          </div>
        </div>
      )}

      {/* Shipment and service charge details */}
      {selectedShipment && watch().importExport === 'export' && (
        <div className='row gx-2 my-2 shadow'>
          <div className='col-12'>
            <h5>SHIPMENT & SERVICE CHARGE DETAILS</h5>
            <p>To be paid by you</p>
          </div>
          <div className='col-12'>
            <h6>
              Original Services: <span className='fw-light'>$452</span>{' '}
            </h6>
          </div>
          <div className='col-12'>
            <h6>
              Ocean Services: <span className='fw-light'>$000.00</span>{' '}
            </h6>
          </div>
          <div className='col-12'>
            <h6>
              Destination Services: <span className='fw-light'>$0.00</span>{' '}
            </h6>
          </div>
          <div className='col-12'>
            <h4>
              Total Price: <span className='fw-light'>$525,452</span>{' '}
            </h4>
          </div>
        </div>
      )}

      {selectedShipment && (
        <button type='button' className='btn btn-success btn-lg'>
          Confirm Booking
        </button>
      )}

      {/* phase one end ++++++++++++++++++++++++++++++++++++++++++ */}
      {/* <form>
        <div>
          {watch().transportationType === 'Ships' && (
            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Container Type *',
                name: 'containerType',
                value: 'name',
                data:
                  containersData &&
                  containersData.filter((item) => item.isActive),
              })}
            </div>
          )}

          {watch().containerType &&
            watch().transportationType === 'Ship' &&
            watch().containerType !== '' && (
              <>
                <div className='col-12'>
                  <div className='progress'>
                    <div
                      className={`progress-bar ${
                        containers.find((c) => c._id === watch().containerType)
                          .available === '100%' && 'bg-danger'
                      } `}
                      role='progressbar'
                      style={{
                        width: containers.find(
                          (c) => c._id === watch().containerType
                        ).available,
                      }}
                      aria-valuenow={
                        containers.find((c) => c._id === watch().containerType)
                          .available
                      }
                      aria-valuemin='0'
                      aria-valuemax='100'
                    >
                      {
                        containers.find((c) => c._id === watch().containerType)
                          .available
                      }
                    </div>
                  </div>
                </div>
                {containers.find((c) => c._id === watch().containerType)
                  .available === '100%' && (
                  <span className='text-danger fw-lighter text-center'>
                    This container is full. Please select other available
                    containers
                  </span>
                )}
              </>
            )}

          {watch().transportationType === 'Plane' && watch().cargoType !== '' && (
            <>
              <div className='col-12'>
                <div className='progress'>
                  <div
                    className={`progress-bar ${
                      '76%' === '100%' && 'bg-danger'
                    } `}
                    role='progressbar'
                    style={{
                      width: '76%',
                    }}
                    aria-valuenow='76'
                    aria-valuemin='0'
                    aria-valuemax='100'
                  >
                    76%
                  </div>
                </div>
              </div>
              {'76%' === '100%' && (
                <span className='text-danger fw-lighter text-center'>
                  Sorry, this plane is full
                </span>
              )}
            </>
          )}
        </div>

        {/* <h5 className='mt-2'>CARGO DETAILS</h5>

        {inputFields.map((inputField, index) => (
          <div key={index}>
            <h6 className='font-monospace'>{`Package #${index + 1}`}</h6>
            <div className='row gx-1 shadow p-2'>
              <div className='col-md-2 col-6'>
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
              <div className='col-md-1 col-6'>
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

              <div className='col-md-1 col-6'>
                <label htmlFor='item' className='form-label'>
                  Weight
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
              <div className='col-md-1 col-6'>
                <label htmlFor='item' className='form-label'>
                  W. Unit
                </label>
                <select
                  type='number'
                  min={0}
                  className='form-control form-control-sm'
                  placeholder='Unit'
                  name='weightUnit'
                  id='weightUnit'
                  value={inputField.weightUnit}
                  required
                  onChange={(e) => handleInputChange(e, index)}
                >
                  <option value='kg'>Kg</option>
                </select>
              </div>

              <div className='col-md-1 col-6'>
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
              <div className='col-md-1 col-6'>
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

              <div className='col-md-1 col-6'>
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
              <div className='col-md-1 col-6'>
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
              <div className='col-md-3 col-12 text-center my-auto mt-2'>
                <div className='bg-secondary text-light p-2'>
                  <button
                    type='button'
                    className='btn btn-light btn-sm form-control form control-sm'
                  >
                    Total Weight: {inputField.qty * inputField.weight} KG
                  </button>
                  <button
                    type='button'
                    className='btn btn-light btn-sm form-control form control-sm  my-1'
                  >
                    CBM:{' '}
                    {inputField.length * inputField.width * inputField.height} M
                    <sup>3</sup>
                  </button>
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
          </div>
        ))}

        <div className='col-12 text-center mx-auto'>
          <button
            onClick={() => handleAddField()}
            type='button'
            className='btn btn-primary btn-sm my-2'
          >
            <FaPlusCircle className='mb-1' /> Add New Package
          </button>
        </div>
        <div className='col-12 text-center mx-auto'>
          <button type='button' className='btn btn-light btn-sm'>
            Total Weight in KG {TotalKG} | Total Volume in CBM {TotalCBM} M
            <sup>3</sup>
          </button>
        </div>

        <div className='col-12 text-center mx-auto'>
          <button type='button' className='btn btn-success btn-sm my-2 me-auto'>
            <FaArrowAltCircleRight className='mb-1' /> Next
          </button>
        </div>

        <div className='row gx-2 my-2'>
          <div className='col-12'>
            <h5>PICKUP DETAILS</h5>
            <p>
              Here you can add all information about pickup location and the
              type of pickup.
            </p>
          </div>
          <div className='col-12'>
            <label>Person who will deliver the shipment to us</label>
          </div>
          <div className='col-6'>
            {inputText({
              register,
              name: 'deliverName',
              label: 'Deliver Name',
            })}
          </div>
          <div className='col-6'>
            {inputNumber({
              register,
              name: 'deliverMobile',
              label: 'Delivery Mobile',
            })}
          </div>
        </div>

        <div className='row gx-2 my-2'>
          <div className='col-12'>
            <h5>DESTINATION DETAILS</h5>
            <p>
              Here you can add all information about destination location, this
              information to get your cargo right.
            </p>
          </div>
          <div className='col-12'>
            <label>Person who will receive package</label>
          </div>
          <div className='col-6'>
            {inputText({
              register,
              name: 'receiverName',
              label: 'Receiver Name',
            })}
          </div>
          <div className='col-6'>
            {inputNumber({
              register,
              name: 'receiverNumber',
              label: 'Receiver Mobile',
            })}
          </div>
        </div>

        <div className='row gx-2 my-2'>
          <div className='col-12'>
            <h5>ADDITIONAL NOTES</h5>
            <p>
              Add any notes that would help us to be more accurate and faster
              with your order, also you can ask any question to the shipping
              company or their account manager.
            </p>
          </div>

          <div className='col-12'>
            {inputTextArea({
              register,
              name: 'note',
              label: 'Additional Note',
            })}
          </div>
        </div>

        <div className='row gx-2 my-2'>
          <div className='col-12'>
            <h5>UPLOAD PHOTOS</h5>
            <p>
              If you have selected export shipping Please ask your supplier to
              create Commercial invoice with name of company "MAMOS logistics
              international.ltd" and with commercial register number "####" and
              tax number "XXXX####" then upload a photo of this receipt here.
            </p>
          </div>

          <div className='col-12'>
            {inputFile({
              register,
              name: 'commercialInvoice',
              label: 'Commercial Invoice',
              Required: false,
              setFile: [],
            })}
          </div>

          <div className='col-12'>
            <p>
              Please take photos for the goods in multiple positions to help us
              get you the best deal.
            </p>
          </div>

          <div className='col-12'>
            {inputFile({
              register,
              name: 'goodsPhoto',
              label: 'Goods Photo',
              Required: false,
              setFile: [],
            })}
          </div>
        </div>

        <div className='row gx-2 my-5'>
          <div className='col-12'>
            <h4>REVIEW AND CONFIRMATION</h4>
            <hr />
            <h6>Order Summary</h6>
            <p>
              This is all details about your shipment, please revise carefully.
            </p>
            <div className='pickup'>
              <hr />
              <h6>Pickup Details</h6>
              <p>
                <FaCheckCircle className='text-success mb-1' /> I will deliver
                my packages to MAMOS warehouses
              </p>
              <h6>Person who will deliver the shipment to us</h6>
              <div className='row'>
                <div className='col-md-5'>
                  <div className='deliver'>
                    <span className='fw-bold'>Deliver Name:</span> <br />
                    <label>{watch().deliverName}</label>
                  </div>
                </div>
                <div className='col-md-5'>
                  <div className='deliver'>
                    <span className='fw-bold'>Deliver Mobile Number:</span>{' '}
                    <br />
                    <label>{watch().deliverMobile}</label>
                  </div>
                </div>
              </div>
            </div>
            <div className='destination'>
              <hr />
              <h6>Delivery / Destination Details</h6>
              <h6>Person who will receive package</h6>
              <div className='row'>
                <div className='col-md-5'>
                  <div className='receiver'>
                    <span className='fw-bold'>Deliver Name:</span> <br />
                    <label>{watch().receiverName}</label>
                  </div>
                </div>
                <div className='col-md-5'>
                  <div className='receiver'>
                    <span className='fw-bold'>Deliver Mobile Number:</span>{' '}
                    <br />
                    <label>{watch().receiverMobile}</label>
                  </div>
                </div>
              </div>
            </div>

            <div className='note'>
              <hr />
              <h6>Additional Notes</h6>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam
                laudantium ad minus ratione facere ducimus animi perspiciatis
                voluptatibus similique mollitia architecto reprehenderit, iusto
                perferendis blanditiis asperiores quisquam totam omnis ipsa. Quo
                consequatur illo deleniti. Dignissimos natus ipsam veniam cum
                maiores pariatur accusantium itaque, aut nam consequatur velit
                quidem debitis ullam cumque aliquid vitae, saepe animi eligendi
                sunt omnis praesentium ipsa! Reiciendis voluptatibus laudantium
                nihil quaerat cupiditate soluta quo ea voluptate odit, et
                magnam, dolor est quis. Nesciunt necessitatibus officia nulla!
                Quam aspernatur pariatur numquam earum ad iste eligendi
                voluptatibus nemo!
              </p>
            </div>

            <div className='photos'>
              <hr />
              <h6>Uploaded Photos</h6>
            </div>
          </div>
        </div> 
      </form> */}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Booking)), { ssr: false })
