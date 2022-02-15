import { useState } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../../../HOC/withAuth'
import Link from 'next/link'
import {
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaBook,
  FaCheckCircle,
  FaCheckDouble,
  FaCircle,
  FaClock,
  FaDollarSign,
  FaLongArrowAltRight,
  FaMinusCircle,
  FaPlusCircle,
  FaSearch,
  FaShip,
} from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputEmail,
  inputFile,
  inputNumber,
  inputText,
  staticInputSelect,
} from '../../../../utils/dynamicForm'
import useCountries from '../../../../api/countries'
import useCommodities from '../../../../api/commodities'
import useSeaports from '../../../../api/seaports'
import useContainers from '../../../../api/containers'
import useShippers from '../../../../api/shippers'
import useTowns from '../../../../api/towns'
import useOrders from '../../../../api/orders'
import moment from 'moment'
const FCL = () => {
  const [formStep, setFormStep] = useState(1)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [selectContainer, setSelectContainer] = useState([])
  const [availableShippers, setAvailableShippers] = useState([])
  const [file, setFile] = useState('')

  const MAX_STEP = 10
  const invoiceCharges = 79

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    defaultValues: {
      isTemperatureControlled: false,
      isHasInvoice: true,
    },
  })

  const { getCountries } = useCountries()
  const { getCommodities } = useCommodities()
  const { getSeaports } = useSeaports()
  const { getContainers } = useContainers()
  const { getShippers } = useShippers()
  const { getTowns } = useTowns()
  const { addOrder } = useOrders(
    '',
    '',
    '',
    selectedShipment && selectedShipment._id
  )

  const { data: countriesData } = getCountries
  const { data: commoditiesData } = getCommodities
  const { data: seaportsData } = getSeaports
  const { data: containersData } = getContainers
  const { data: shippersData } = getShippers
  const { data: townsData } = getTowns

  const availableMovementTypes = [
    { name: 'Door to Door' },
    { name: 'Door to Port' },
    { name: 'Port to Door' },
    { name: 'Port to Port' },
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

  const dropOffDoorCost0 =
    townsData &&
    townsData.find(
      (town) =>
        town.isActive &&
        town._id === watch().dropOffTown &&
        town.seaport &&
        town.seaport._id === watch().destPort
    )

  const dropOffDoorCost = dropOffDoorCost0 ? dropOffDoorCost0.cost : 0

  const pickupDoorCost0 =
    townsData &&
    townsData.find(
      (town) =>
        town.isActive &&
        town._id === watch().pickUpTown &&
        town.seaport &&
        town.seaport._id === watch().pickupPort
    )

  const pickupDoorCost = pickupDoorCost0 ? pickupDoorCost0.cost : 0

  const totalContainerKG =
    selectContainer &&
    selectContainer.reduce(
      (acc, curr) => acc + curr.payloadCapacity * curr.quantity,
      0
    )

  const TotalRunningCost0 =
    selectedShipment && selectedShipment.price * totalContainerKG

  const TotalRunningCost = !watch().isHasInvoice
    ? TotalRunningCost0 + pickupDoorCost + dropOffDoorCost + invoiceCharges
    : TotalRunningCost0 + pickupDoorCost + dropOffDoorCost

  const movementTypes = {
    pickUp: ['Door to Door', 'Door to Port'],
    dropOff: ['Door to Door', 'Port to Door'],
    port: ['Port to Port'],
  }

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    data: submittedData,
    mutateAsync: addMutateAsync,
  } = addOrder

  if (isSuccessAdd) {
    console.log('Success')
  }
  if (isErrorAdd) {
    console.log('Error: ', errorAdd)
  }

  const submitHandler = (data) => {
    const availableShippers =
      shippersData &&
      shippersData.filter(
        (shipper) =>
          shipper.isActive &&
          shipper.transportationType === 'Ocean' &&
          shipper.cargoType === 'FCL' &&
          shipper.departureSeaport._id === data.pickupPort &&
          shipper.arrivalSeaport._id === data.destPort
      )

    setAvailableShippers(availableShippers)

    if (formStep > 8) {
      const formData = new FormData()

      formData.append('invoiceFile', data.invoiceFile[0])
      formData.append('buyerAddress', data.buyerAddress)
      formData.append('buyerEmail', data.buyerEmail)
      formData.append('buyerMobileNumber', data.buyerMobileNumber)
      formData.append('buyerName', data.buyerName)
      formData.append('cargoDescription', data.cargoDescription)
      formData.append('cargoType', 'FCL')
      formData.append('commodity', data.commodity)
      formData.append('destAddress', data.destAddress)
      formData.append('destCity', data.destCity)
      formData.append('destCountry', data.destCountry)
      formData.append('destPort', data.destPort)
      formData.append('destPostalCode', data.destPostalCode)
      formData.append('destWarehouseName', data.destWarehouseName)
      formData.append('dropOffTown', data.dropOffTown)
      formData.append('grossWeight', data.grossWeight)
      formData.append('importExport', data.importExport)
      formData.append('invoiceFile', data.invoiceFile)
      formData.append('isHasInvoice', data.isHasInvoice)
      formData.append('isTemperatureControlled', data.isTemperatureControlled)
      formData.append('movementType', data.movementType)
      formData.append('noOfPackages', data.noOfPackages)
      formData.append('pickUpAddress', data.pickUpAddress)
      formData.append('pickUpCity', data.pickUpCity)
      formData.append('pickUpPostalCode', data.pickUpPostalCode)
      formData.append('pickUpTown', data.pickUpTown)
      formData.append('pickUpWarehouseName', data.pickUpWarehouseName)
      formData.append('pickupCountry', data.pickupCountry)
      formData.append('pickupPort', data.pickupPort)
      formData.append('transportationType', 'Ocean')
      formData.append('selectedShipment', selectedShipment._id)
      formData.append('selectContainer', JSON.stringify(selectContainer))

      addMutateAsync(formData)
    }
  }
  return (
    <div className='mt-1'>
      <div className='px-2'>
        <h1 className='display-6 text-center font-monospace'>
          Book A New Shipment
        </h1>

        <p className='text-center'>
          Please complete as much of the rate enquiry form as possible in order
          to get the best result for your shipment.
        </p>

        {formStep < MAX_STEP && (
          <div className='text-center mt-2'>
            <button type='button' className='btn btn-light shadow rounded-pill'>
              Step {formStep} of {MAX_STEP}
            </button>{' '}
            <br />
            {TotalRunningCost && TotalRunningCost !== 0 && (
              <button
                type='button'
                className='btn btn-success shadow rounded-pills mt-1'
              >
                <FaDollarSign className='mb-1' />{' '}
                {TotalRunningCost.toLocaleString()}
              </button>
            )}
            <p className='text-muted bfw-lighter mt-2'>
              {watch().importExport &&
                watch().movementType &&
                `${watch().importExport} - ${watch().movementType}`}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className='row'>
            <div className='col-md-10 col-12 mx-auto'>
              {formStep > 0 && (
                <section
                  style={
                    formStep !== 1 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    <div className='col-md-6 col-12'>
                      {staticInputSelect({
                        register,
                        errors,
                        label: 'Import/Export *',
                        name: 'importExport',
                        data: [{ name: 'Import' }, { name: 'Export' }],
                      })}
                    </div>

                    <div className='col-md-6 col-12'>
                      {staticInputSelect({
                        register,
                        errors,
                        label: 'Movement Type *',
                        name: 'movementType',
                        data: availableMovementTypes,
                      })}
                    </div>
                  </div>
                  <div className='text-center'>
                    <button
                      disabled={!isValid}
                      onClick={() => setFormStep((curr) => curr + 1)}
                      type='button'
                      className='btn btn-primary btn-sm'
                    >
                      <FaArrowAltCircleRight className='mb-1' /> Next
                    </button>
                  </div>
                </section>
              )}

              {formStep > 1 && (
                <section
                  style={
                    formStep !== 2 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    <div className='col-md-6 col-12 mx-auto'>
                      {containersData &&
                        containersData.map((container) => (
                          <div key={container._id}>
                            <div className='mt-1'>
                              <div className='text-center'>
                                <button
                                  disabled={
                                    !selectContainer.find(
                                      (c) => c._id === container._id
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
                              </div>
                              <div className='d-grid mt-2'>
                                <button
                                  type='button'
                                  className='btn btn-light btn-sm '
                                >
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
                            </div>
                            <br />
                          </div>
                        ))}

                      <div className='text-center text-danger'>
                        {selectContainer.length === 0 && (
                          <span>Please, select at leas one container</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='text-center btn-groups'>
                    <button
                      onClick={() => setFormStep((curr) => curr - 1)}
                      type='button'
                      className='btn btn-primary btn-sm'
                    >
                      <FaArrowAltCircleLeft className='mb-1' /> Previous
                    </button>
                    <button
                      disabled={
                        watch().cargoType === 'FCL' &&
                        selectContainer.length === 0
                          ? true
                          : false
                      }
                      onClick={() => setFormStep((curr) => curr + 1)}
                      type='button'
                      className='btn btn-primary btn-sm text-end  ms-1'
                    >
                      <FaArrowAltCircleRight className='mb-1' /> Next
                    </button>
                  </div>
                </section>
              )}

              {formStep > 2 && (
                <section
                  style={
                    formStep !== 3 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    <div className='row gx-2 my-2'>
                      <div className='col-md-6 col-12'>
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
                                country.isActive &&
                                country._id !== watch().destCountry
                            ),
                        })}
                      </div>
                      <div className='col-md-6 col-12'>
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

                      <div className='col-md-6 col-12'>
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
                                country.isActive &&
                                country._id !== watch().pickupCountry
                            ),
                        })}
                      </div>
                      <div className='col-md-6 col-12'>
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
                    </div>

                    <button
                      disabled={!isValid}
                      className='btn btn-primary btn-sm my-2'
                    >
                      <FaSearch className='mb-1' /> Search Available Vessels
                    </button>

                    <div className='text-center btn-groups'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      {availableShippers && availableShippers.length > 0 && (
                        <button
                          disabled={!isValid}
                          onClick={() => setFormStep((curr) => curr + 1)}
                          type='button'
                          className='btn btn-primary btn-sm text-end  ms-1'
                        >
                          <FaArrowAltCircleRight className='mb-1' /> Next
                        </button>
                      )}
                    </div>
                  </div>

                  {isValid &&
                    availableShippers &&
                    availableShippers.length === 0 && (
                      <p className='text-center text-danger'>
                        <span className='fw-bold'>Sorry! </span> There is no
                        available shipments. Please click
                        <span className='fw-bold'> SEARCH BUTTON </span> to
                        filter your search.
                      </p>
                    )}
                </section>
              )}

              {formStep > 3 && (
                <section
                  style={
                    formStep !== 4 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    {availableShippers &&
                      availableShippers.filter((a) => a.cargoType === 'FCL')
                        ?.length === 0 && (
                        <label className='text-center text-danger mb-2'>
                          Please go back and click search available vessels
                        </label>
                      )}

                    {availableShippers &&
                      availableShippers &&
                      availableShippers
                        .filter((a) => a.cargoType === 'FCL')
                        .map((shipper) => (
                          <div
                            key={shipper._id}
                            className='col-lg-4 col-md-6 col-12 mb-2'
                          >
                            <div className='card borer-0'>
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
                                      {moment(shipper.departureDate).format(
                                        'DD MMM'
                                      )}
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
                                      {moment(shipper.arrivalDate).format(
                                        'DD MMM'
                                      )}
                                    </span>
                                  </button>
                                </div>
                                <hr />

                                <div className='d-flex justify-content-between align-items-center'>
                                  <button
                                    type='button'
                                    className='btn btn-light btn-sm'
                                  >
                                    <FaClock className='mb-1 fs-6' />{' '}
                                    <span className='fw-bold fs-6'>
                                      {moment(new Date(shipper.arrivalDate))
                                        .diff(
                                          moment(
                                            new Date(shipper.departureDate)
                                          ),
                                          'days'
                                        )
                                        .toLocaleString()}{' '}
                                      days
                                    </span>
                                  </button>

                                  <button
                                    type='button'
                                    className='btn btn-light btn-sm'
                                  >
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
                                  <FaCheckCircle className='mb-1' /> Select
                                  Shipment
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    <div className='text-center btn-groups'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      <button
                        disabled={selectedShipment ? false : true}
                        onClick={() => setFormStep((curr) => curr + 1)}
                        type='button'
                        className='btn btn-primary btn-sm text-end  ms-1'
                      >
                        <FaArrowAltCircleRight className='mb-1' /> Next
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {formStep > 4 && (
                <section
                  style={
                    formStep !== 5 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    <div className='row gx-2 my-2'>
                      <div className='col-12'>
                        <h5>CARGO DETAILS</h5>
                        <p>Tel us a bit more about your cargo.</p>
                      </div>

                      <div className='col-md-6 col-12 mx-auto'>
                        {inputText({
                          register,
                          errors,
                          name: 'cargoDescription',
                          label: 'Cargo Description',
                        })}
                      </div>
                      <div className='col-md-6 col-12 mx-auto'>
                        {dynamicInputSelect({
                          register,
                          errors,
                          label: 'Commodity *',
                          name: 'commodity',
                          value: 'name',
                          data:
                            commoditiesData &&
                            commoditiesData.filter(
                              (commodity) => commodity.isActive
                            ),
                        })}
                      </div>
                      <div className='col-md-6 col-12 mx-auto'>
                        {inputNumber({
                          register,
                          errors,
                          name: 'noOfPackages',
                          label: 'No. of Packages',
                        })}
                      </div>
                      <div className='col-md-6 col-12 mx-auto'>
                        {inputNumber({
                          register,
                          errors,
                          name: 'grossWeight',
                          label: 'Gross Weight as KG',
                          max: totalContainerKG,
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

                    <div className='text-center btn-groups'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      <button
                        disabled={!isValid}
                        onClick={() => setFormStep((curr) => curr + 1)}
                        type='button'
                        className='btn btn-primary btn-sm text-end  ms-1'
                      >
                        <FaArrowAltCircleRight className='mb-1' /> Next
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {formStep > 5 && (
                <section
                  style={
                    formStep !== 6 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    {selectedShipment && (
                      <div className='row gx-2 my-2'>
                        <div className='col-12'>
                          <h5>BUYER DETAILS</h5>
                          <p>
                            Enter the buyers details so they can be notified
                            about the shipment and track the process
                          </p>
                        </div>
                        <div className='col-12'>
                          <label>Person who will receive package</label>
                        </div>
                        <div className='col-md-6 col-12 mx-auto'>
                          {inputText({
                            register,
                            errors,
                            name: 'buyerName',
                            label: 'Who is your buyer?',
                          })}
                        </div>
                        <div className='col-md-6 col-12 mx-auto'>
                          {inputNumber({
                            register,
                            errors,
                            name: 'buyerMobileNumber',
                            label: 'Buyer mobile number',
                          })}
                        </div>
                        <div className='col-md-6 col-12 mx-auto'>
                          {inputEmail({
                            register,
                            errors,
                            name: 'buyerEmail',
                            label: 'Buyer email',
                          })}
                        </div>
                        <div className='col-md-6 col-12 mx-auto'>
                          {inputText({
                            register,
                            errors,
                            name: 'buyerAddress',
                            label: 'Buyer address',
                          })}
                        </div>
                      </div>
                    )}
                    <div className='text-center btn-groups'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      <button
                        disabled={!isValid}
                        onClick={() => setFormStep((curr) => curr + 1)}
                        type='button'
                        className='btn btn-primary btn-sm text-end  ms-1'
                      >
                        <FaArrowAltCircleRight className='mb-1' /> Next
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {formStep > 6 && (
                <section
                  style={
                    formStep !== 7 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    {selectedShipment && (
                      <div className='row gx-2 my-2'>
                        <div className='col-12'>
                          <h5>LOCATION DETAILS</h5>
                          <p>
                            Please make sure to use the correct address(es). We
                            will pick-up/or deliver the shipment here.
                          </p>
                        </div>
                        {movementTypes.dropOff.includes(
                          watch().movementType
                        ) && (
                          <>
                            <div className='col-12'>
                              <label>
                                What is the drop-off address of your cargo?
                              </label>
                            </div>
                            <div className='col-12'>
                              {dynamicInputSelect({
                                register,
                                errors,
                                label: 'Drop-off town',
                                name: 'dropOffTown',
                                value: 'name',
                                data:
                                  townsData &&
                                  townsData.filter(
                                    (town) =>
                                      town.isActive &&
                                      town.seaport &&
                                      town.seaport._id === watch().destPort
                                  ),
                              })}
                              {watch().dropOffTown && (
                                <label className='mb-3 text-danger'>
                                  We are charging you{' '}
                                  <span className='fw-bold'>
                                    $
                                    {dropOffDoorCost &&
                                      dropOffDoorCost.toLocaleString()}
                                  </span>{' '}
                                  based on for the drop-off address
                                </label>
                              )}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'destWarehouseName',
                                label: 'Warehouse Name',
                              })}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'destCity',
                                label: 'City',
                              })}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'destPostalCode',
                                label: 'Postal Code',
                                isRequired: false,
                              })}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'destAddress',
                                label: 'Address',
                              })}
                            </div>
                          </>
                        )}
                        <span className='mt-1'></span>
                        <hr />

                        {movementTypes.pickUp.includes(
                          watch().movementType
                        ) && (
                          <>
                            <div className='col-12'>
                              <label>
                                What is the pick-up address of your cargo?
                              </label>
                            </div>
                            <div className='col-12'>
                              {dynamicInputSelect({
                                register,
                                errors,
                                label: 'Pickup town',
                                name: 'pickUpTown',
                                value: 'name',
                                data:
                                  townsData &&
                                  townsData.filter(
                                    (town) =>
                                      town.isActive &&
                                      town.seaport &&
                                      town.seaport._id === watch().pickupPort
                                  ),
                              })}
                              {watch().pickUpTown && (
                                <label className='mb-3 text-danger'>
                                  We are charging you{' '}
                                  <span className='fw-bold'>
                                    $
                                    {pickupDoorCost &&
                                      pickupDoorCost.toLocaleString()}
                                  </span>{' '}
                                  based on for the pickup address
                                </label>
                              )}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'pickUpWarehouseName',
                                label: 'Warehouse Name',
                              })}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'pickUpCity',
                                label: 'City',
                              })}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'pickUpPostalCode',
                                label: 'Postal Code',
                                isRequired: false,
                              })}
                            </div>
                            <div className='col-md-6 col-12 mx-auto'>
                              {inputText({
                                register,
                                errors,
                                name: 'pickUpAddress',
                                label: 'Address',
                              })}
                            </div>
                          </>
                        )}

                        {movementTypes.port.includes(watch().movementType) && (
                          <p>
                            You have selected port to port transportation,
                            please go ahead and click next button
                          </p>
                        )}
                      </div>
                    )}
                    <div className='text-center btn-groups'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      <button
                        disabled={!isValid}
                        onClick={() => setFormStep((curr) => curr + 1)}
                        type='button'
                        className='btn btn-primary btn-sm text-end  ms-1'
                      >
                        <FaArrowAltCircleRight className='mb-1' /> Next
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {formStep > 7 && (
                <section
                  style={
                    formStep !== 8 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2'>
                    {selectedShipment && (
                      <div className='row gx-2 my-2'>
                        <div className='col-12'>
                          <h5>OTHER REQUIRED DETAILS</h5>
                          <p>Please answer all below asked questions.</p>
                        </div>

                        <div className=' col-12'>
                          {inputCheckBox({
                            register,
                            errors,
                            name: 'isHasInvoice',
                            label: 'Do you have invoice?',
                            isRequired: false,
                          })}
                        </div>
                        {watch().isHasInvoice ? (
                          <div className='col-md-6 col-12'>
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
                              additional service to creating new invoice for
                              your cargo?
                            </label>
                            <h6>${invoiceCharges.toFixed(2)}</h6>
                          </>
                        )}

                        <span className='mt-1'></span>
                        <hr />
                      </div>
                    )}
                    <div className='text-center btn-groups'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      <button
                        disabled={
                          watch().isHasInvoice && file === '' ? true : false
                        }
                        onClick={() => setFormStep((curr) => curr + 1)}
                        type='button'
                        className='btn btn-primary btn-sm text-end  ms-1'
                      >
                        <FaArrowAltCircleRight className='mb-1' /> Next
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {formStep > 8 && (
                <section
                  style={
                    formStep !== 9 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2 font-monospace'>
                    {selectedShipment && (
                      <div className='row gx-2 my-2'>
                        <div className='col-md-8 col-12 mx-auto'>
                          <h5>SUMMARY & SHIPMENT DETAILS</h5>
                          <p>
                            Please make sure the details below are correct.
                            Confirm teh booking when you are ready to go!
                          </p>
                        </div>
                        <div className='col-md-8 col-12 mx-auto'>
                          <table className='table table-sm hover bordered table-striped caption-top '>
                            <tbody>
                              <tr>
                                <td>Direction</td>
                                <td>{watch().importExport}</td>
                              </tr>

                              <tr>
                                <td>Shipment Movement</td>
                                <td>{watch().movementType}</td>
                              </tr>
                              <tr>
                                <td>Departure Date</td>
                                <td>
                                  {moment(
                                    selectedShipment.departureDate
                                  ).format('ll')}
                                </td>
                              </tr>

                              <tr>
                                <td>Commodity</td>
                                <td>
                                  {commoditiesData &&
                                    commoditiesData.find(
                                      (c) =>
                                        c.isActive &&
                                        c._id === watch().commodity
                                    )?.name}
                                  <br />
                                  {watch().noOfPackages} packages <br />
                                  {watch().grossWeight} kg
                                </td>
                              </tr>

                              <tr>
                                <td>Cargo Description</td>
                                <td>{watch().cargoDescription}</td>
                              </tr>
                              <tr>
                                <td>Containers Details</td>
                                <td>
                                  {selectContainer &&
                                    selectContainer.map((s) => (
                                      <div key={s._id}>
                                        {s.quantity} x {s.name}
                                      </div>
                                    ))}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className='col-md-8 col-12 mx-auto mt-4'>
                          <h5>SHIPMENT & SERVICE CHARGES</h5>
                          <label>To be paid by you</label>
                        </div>
                        <div className='col-md-8 col-12 mx-auto'>
                          <table className='table table-sm hover bordered table-striped caption-top '>
                            <tbody>
                              <tr>
                                <td>Invoice Services</td>
                                <td>
                                  $
                                  {!watch().isHasInvoice
                                    ? invoiceCharges.toLocaleString()
                                    : '0.00'}
                                </td>
                              </tr>
                              {watch().pickUpTown && (
                                <tr>
                                  <td>Pickup Door Services</td>
                                  <td>${pickupDoorCost.toLocaleString()}</td>
                                </tr>
                              )}
                              {watch().dropOffTown && (
                                <tr>
                                  <td>Drop-Off Door Services</td>
                                  <td>${dropOffDoorCost.toLocaleString()}</td>
                                </tr>
                              )}
                              <tr>
                                <td>Transportation Services</td>
                                <td>${TotalRunningCost0.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className='col-md-8 col-12 mx-auto mt-4'>
                          <table className='table table-sm hover bordered table-striped caption-top '>
                            <tbody>
                              <tr>
                                <td className='fw-bold'>Total Price</td>
                                <td className='fw-bold'>
                                  <FaDollarSign className='mb-1' />
                                  {TotalRunningCost.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className='col-md-8 col-12 mx-auto mt-4'>
                          <h5>TRADELANE DETAILS</h5>
                          <div className='timeline mb-5'>
                            {selectedShipment &&
                              selectedShipment.tradelane &&
                              selectedShipment.tradelane.map((event) => (
                                <div
                                  key={event._id}
                                  className='card font-monospace bg-transparent border-0 '
                                >
                                  <div className='card-body'>
                                    <div
                                      className='row'
                                      style={{ marginBottom: '-32px' }}
                                    >
                                      <div className='col-3 text-end'>
                                        <div className='left'>
                                          <h6 className='fw-light text-muted'>
                                            {moment(event.dateTime).format(
                                              'MMM Do'
                                            )}
                                          </h6>
                                          <h6 className='fw-light text-muted'>
                                            {moment(event.dateTime).format(
                                              'LT'
                                            )}
                                          </h6>
                                        </div>
                                      </div>
                                      <div className='col-9 border border-success border-bottom-0 border-end-0 border-top-0 pb-4'>
                                        <div className='right'>
                                          <h6 className='card-title fw-light'>
                                            {event.actionType}
                                          </h6>
                                          <div className='position-relative'>
                                            <FaCircle
                                              className='text-light border border-success rounded-pill position-absolute mt-2'
                                              style={{ marginLeft: '-20' }}
                                            />
                                          </div>
                                          <h1 className='card-title fs-4'>
                                            {event.location}
                                          </h1>
                                          <div className='card-text'>
                                            <h6 className='fw-light'>
                                              <FaShip className='mb-1' />{' '}
                                              {event.tradeType}
                                            </h6>
                                            <h6 className='fw-light'>
                                              {event.description}
                                            </h6>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className='text-center'>
                      <button
                        onClick={() => setFormStep((curr) => curr - 1)}
                        type='button'
                        className='btn btn-primary btn-sm'
                      >
                        <FaArrowAltCircleLeft className='mb-1' /> Previous
                      </button>
                      <br />
                      <button
                        onSubmit={handleSubmit(submitHandler)}
                        onClick={() => setFormStep((curr) => curr + 1)}
                        className='btn btn-success text-end mt-2'
                      >
                        <FaCheckDouble className='mb-1' /> Confirm Booking
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {formStep > 9 && (
                <section
                  style={
                    formStep !== 10 ? { display: 'none' } : { display: 'block' }
                  }
                >
                  <div className='row gx-2 my-2 text-center'>
                    {selectedShipment && (
                      <div className='row gx-2 my-2'>
                        <div className='col-12'>
                          <h5>THANK YOU FOR BOOKING WITH US!</h5>
                          <p>
                            We have received your booking{' '}
                            {submittedData && submittedData.trackingNo}. The
                            booking confirmation should be sent to you shortly.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className='text-center'>
                      <Link href='/booking'>
                        <a type='button' className='btn btn-primary btn-lg'>
                          <FaBook className='mb-1' /> Book another booking
                        </a>
                      </Link>{' '}
                      <br /> <br />
                      <Link href='/track'>
                        <a
                          type='button'
                          className='btn btn-light shadow btn-lg'
                        >
                          <FaSearch className='mb-1' /> Track shipment
                        </a>
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(FCL)), { ssr: false })
