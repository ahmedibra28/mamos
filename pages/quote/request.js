import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaPlusCircle, FaSearch, FaTrash } from 'react-icons/fa'
import useAirports from '../../api/airports'
import useCountries from '../../api/countries'
import useSeaports from '../../api/seaports'
import useContainers from '../../api/containers'
import useShippers from '../../api/shippers'
import {
  staticInputSelect,
  dynamicInputSelect,
  inputText,
} from '../../utils/dynamicForm'
import Image from 'next/image'

const RequestQuote = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()
  const [shippers, setShippers] = useState([])

  const { getCountries } = useCountries()
  const { getSeaports } = useSeaports()
  const { getAirports } = useAirports()
  const { getContainers } = useContainers()
  const { getShippers } = useShippers()

  const { data: countriesData } = getCountries
  const { data: seaportsData } = getSeaports
  const { data: airportsData } = getAirports
  const { data: containersData } = getContainers
  const { data: shippersData } = getShippers

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

  const submitHandler = (data) => {
    console.log({ data, inputFields })
    const filterShippers =
      shippersData &&
      shippersData.filter((ship) => ship.type === data.transportationType)
    console.log({ TotalKG })
    if (filterShippers && filterShippers.length > 0) {
      const shippers = filterShippers.map((ship) => ({
        _id: ship._id,
        name: ship.name,
        price: ship.price.toFixed(2),
        deliveryTime: ship.deliveryTime,
        total: (ship.price * TotalKG).toFixed(2),
      }))
      setShippers(shippers ? shippers : [])
    }
  }

  return (
    <div className='mt-1'>
      <p className='font-monospace text-center p-2'>
        Please complete as much of the rate enquiry form as possible in order
        for your MSC team to provide an accurate freight rate quotation.
      </p>
      <hr />

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row'>
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
              data: [
                { name: 'Ship' },
                // { name: 'Track' },
                // { name: 'Train' },
                { name: 'Plane' },
              ],
            })}
          </div>
          {watch().transportationType !== '' && (
            <div className='col-md-3 col-6'>
              {staticInputSelect({
                register,
                errors,
                label: 'Shipment Type *',
                name: 'shipmentType',
                data:
                  watch().transportationType === 'Ship'
                    ? [{ name: 'FCL' }, { name: 'LCL' }]
                    : [{ name: 'KG' }],
              })}
            </div>
          )}
          {watch().transportationType === 'Ship' && (
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
          {watch().transportationType === 'Plane' && (
            <div className='col-md-3 col-6'>
              {staticInputSelect({
                register,
                errors,
                label: 'Movement Type *',
                name: 'movementType',
                data: [
                  { name: 'door to door' },
                  { name: 'airport to airport' },
                  { name: 'store to store' },
                ],
              })}
            </div>
          )}
        </div>
        <div className='row'>
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
          {watch().shipmentType === 'AIR' ? (
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
          {watch().shipmentType === 'AIR' ? (
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

        <h5 className='font-monospace text-decoration-underline text-center'>
          Cargo Details
        </h5>

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
              <div className='col-md-3 col-12 text-center my-auto'>
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
          <button type='submit' className='btn btn-success btn-sm my-2 me-auto'>
            <FaSearch className='mb-1' /> Get Available Shipments
          </button>
        </div>
      </form>

      <hr />

      <div className='table-responsive '>
        <table className='table table-sm hover table-borderless table-striped caption-top '>
          <caption>{shippers ? shippers.length : 0} records found</caption>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Shipper</th>
              <th>Price per KG</th>
              <th>Delivery Time</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {shippers &&
              shippers.map((ship) => (
                <tr key={ship._id}>
                  <td>
                    <Image
                      priority
                      width='50'
                      height='22'
                      src='/dark-logo.png'
                      className='img-fluid brand-logos'
                      alt='logo'
                    />
                  </td>
                  <td>{ship.name}</td>
                  <td>${ship.price}</td>
                  <td>{ship.deliveryTime} days</td>
                  <td>${ship.total}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RequestQuote
