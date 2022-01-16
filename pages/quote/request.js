import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaPlusCircle, FaTrash } from 'react-icons/fa'
import {
  staticInputSelect,
  dynamicInputSelect,
  inputText,
} from '../../utils/dynamicForm'

const RequestQuote = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()

  const ContainerType = [
    { _id: '1', name: '20 FT' },
    { _id: '2', name: '40 FT' },
    { _id: '3', name: '40 FT Hig' },
    { _id: '4', name: '45 Hig' },
  ]

  const CountryPickup = [
    {
      _id: '1',
      name: 'USA',
      city: 'New York',
      airport: 'JFK',
      port: 'New York',
    },
    {
      _id: '2',
      name: 'USA',
      city: 'Los Angeles',
      airport: 'LAX',
      port: 'Los Angeles',
    },
    { _id: '3', name: 'USA', city: 'Chicago', airport: 'ORD', port: 'Chicago' },
    { _id: '4', name: 'USA', city: 'Houston', airport: 'IAH', port: 'Houston' },
    {
      _id: '5',
      name: 'Somalia',
      city: 'Mogadishu',
      airport: 'AAA',
      port: 'Mogadishu',
    },
    {
      _id: '6',
      name: 'Somalia',
      city: 'Kismayo',
      airport: 'Kismayo',
      port: 'Kismayo',
    },
    {
      _id: '7',
      name: 'Kenya',
      city: 'Nairobi',
      airport: 'Nairobi',
      port: 'Nairobi',
    },
    {
      _id: '8',
      name: 'Kenya',
      city: 'Nakuru',
      airport: 'Nakuru',
      port: 'Nakuru',
    },
    {
      _id: '9',
      name: 'Kenya',
      city: 'Mombasa',
      airport: 'Mombasa',
      port: 'Mombasa',
    },
    {
      _id: '10',
      name: 'Ethiopia',
      city: 'Addis Ababa',
      airport: 'Addis Ababa',
      port: 'Addis Ababa',
    },
    {
      _id: '11',
      name: 'Ethiopia',
      city: 'Dire Dawa',
      airport: 'Dire Dawa',
      port: 'Dire Dawa',
    },
  ]

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

  const submitHandler = (data) => {
    console.log({ data, inputFields })
  }
  return (
    <div className='mt-1'>
      <p className='font-monospace text-center shadow-sm p-2'>
        Please complete as much of the rate enquiry form as possible in order
        for your MSC team to provide an accurate freight rate quotation.
      </p>

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row'>
          <div className='col-md-4 col-6'>
            {staticInputSelect({
              register,
              errors,
              label: 'Import/Export *',
              name: 'importExport',
              data: [{ name: 'import' }, { name: 'export' }],
            })}
          </div>
          <div className='col-md-4 col-6'>
            {staticInputSelect({
              register,
              errors,
              label: 'Shipment Type *',
              name: 'shipmentType',
              data: [{ name: 'FCL' }, { name: 'LCL' }, { name: 'AIR' }],
            })}
          </div>
          {watch().shipmentType === 'AIR' && (
            <div className='col-md-4 col-6'>
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
          {(watch().shipmentType === 'LCL' ||
            watch().shipmentType === 'FCL') && (
            <div className='col-md-4 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Container Type *',
                name: 'containerType',
                value: 'name',
                data:
                  ContainerType &&
                  ContainerType.filter((item) => [...new Set(item.name)]),
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
              data: CountryPickup && CountryPickup,
            })}
          </div>
          {watch().shipmentType === 'AIR' ? (
            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Pickup Airport *',
                name: 'pickupAirport',
                value: 'airport',
                data: CountryPickup && CountryPickup,
              })}
            </div>
          ) : (
            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Pickup Port *',
                name: 'pickupPort',
                value: 'port',
                data: CountryPickup && CountryPickup,
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
              data: CountryPickup && CountryPickup,
            })}
          </div>
          {watch().shipmentType === 'AIR' ? (
            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Dest Airport *',
                name: 'destAirport',
                value: 'airport',
                data: CountryPickup && CountryPickup,
              })}
            </div>
          ) : (
            <div className='col-md-3 col-6'>
              {dynamicInputSelect({
                register,
                errors,
                label: 'Dest Port *',
                name: 'destPort',
                value: 'port',
                data: CountryPickup && CountryPickup,
              })}
            </div>
          )}
        </div>
        <div className='row'>
          <div className='col-md-4 col-12'>
            <h5 className='font-monospace text-decoration-underline'>
              Cargo Details
            </h5>
          </div>
          <div className='col-md-4 col-12'>
            <button className='btn btn-secondary btn-sm fw-light'>
              Total Weight in KG 6 KG | Total Volume in CBM 1.00 M<sup>3</sup>
            </button>
          </div>
          <div className='col-md-4 col-12 text-end'>
            <button
              onClick={() => handleAddField()}
              type='button'
              className='btn btn-primary btn-sm text-end'
            >
              <FaPlusCircle className='mb-1' /> Add New Cargo
            </button>
          </div>
        </div>
        {inputFields.map((inputField, index) => (
          <div key={index}>
            <div className='row gx-1 shadow p-2'>
              <div className='col-md-2 col-6'>
                <label htmlFor='item' className='form-label'>
                  Package Quantity
                </label>
                <input
                  type='number'
                  min={0}
                  className='form-control'
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
                  Unit
                </label>
                <select
                  type='number'
                  min={0}
                  className='form-control'
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

              <div className='col-md-2 col-6'>
                <label htmlFor='item' className='form-label'>
                  Weight
                </label>
                <input
                  type='number'
                  min={0}
                  className='form-control'
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
                  Unit
                </label>
                <select
                  type='number'
                  min={0}
                  className='form-control'
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
                  Unit
                </label>
                <select
                  type='number'
                  min={0}
                  className='form-control'
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
                  className='form-control'
                  placeholder='Length'
                  name='length'
                  id='length'
                  value={inputField.length}
                  required
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
                  className='form-control'
                  placeholder='Width'
                  name='width'
                  id='width'
                  value={inputField.width}
                  required
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
                  className='form-control'
                  placeholder='Height'
                  name='height'
                  id='height'
                  value={inputField.height}
                  required
                  onChange={(e) => handleInputChange(e, index)}
                />
              </div>
              <div className='col-md-2 col-12 text-center my-auto'>
                <div className='bg-secondary text-light p-2'>
                  <span className='fw-light'>Total Weight</span> <br />
                  <div className='text-center fw-bold'>
                    {inputField.qty * inputField.weight} Kg
                  </div>
                  <span className='fw-light'>CBM</span> <br />
                  <div className='text-center fw-bold'>
                    {inputField.length * inputField.weight * inputField.height}{' '}
                    M<sup>3</sup>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleRemoveField(index)}
                    className='btn btn-danger btn-sm form-control'
                  >
                    <FaTrash className='mb-1' /> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </form>
    </div>
  )
}

export default RequestQuote
