import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import {
  FaCheckCircle,
  FaFileDownload,
  FaPenAlt,
  FaPlus,
  FaPlusCircle,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa'

import useShippers from '../../api/shippers'
import useContainers from '../../api/containers'

import { CSVLink } from 'react-csv'
import useSeaports from '../../api/seaports'
import useAirports from '../../api/airports'
import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../../components/Confirm'
import { useForm } from 'react-hook-form'
import {
  inputCheckBox,
  inputText,
  inputNumber,
  staticInputSelect,
  InputAutoCompleteSelect,
  inputDate,
  dynamicInputSelectNumber,
  dynamicInputSelect,
} from '../../utils/dynamicForm'
import moment from 'moment'

const Shipper = () => {
  const { getShippers, updateShipper, addShipper, deleteShipper } =
    useShippers()
  const { getSeaports } = useSeaports()
  const { getAirports } = useAirports()
  const { getContainers } = useContainers()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
    },
  })

  const { data, isLoading, isError, error } = getShippers
  const { data: seaportsData } = getSeaports
  const { data: airportsData } = getAirports
  const { data: containersData } = getContainers

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateShipper

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deleteShipper

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = addShipper

  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [inputFields, setInputFields] = useState([
    {
      dateTime: '',
      tradeType: '',
      actionType: '',
      location: '',
      description: '',
      isActiveLocation: false,
    },
  ])

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        dateTime: '',
        tradeType: '',
        actionType: '',
        location: '',
        description: '',
        isActiveLocation: false,
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

  const formCleanHandler = () => {
    setEdit(false)
    reset()
    setInputFields([
      {
        dateTime: '',
        tradeType: '',
        actionType: '',
        location: '',
        description: '',
        isActiveLocation: false,
      },
    ])
  }

  useEffect(() => {
    if (isSuccessAdd || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessAdd, isSuccessUpdate])

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const availableCargoType = {
    ocean: [{ name: 'FCL' }, { name: 'LCL' }],
    plane: [{ name: 'AIR' }],
  }

  const submitHandler = async (data) => {
    edit
      ? updateMutateAsync({
          _id: id,
          name: data.name,
          transportationType: data.transportationType,
          price: data.price,
          departureSeaport: data.departureSeaport,
          arrivalSeaport: data.arrivalSeaport,
          departureAirport: data.departureAirport,
          arrivalAirport: data.arrivalAirport,
          availableCapacity: data.availableCapacity,
          departureDate: data.departureDate,
          arrivalDate: data.arrivalDate,
          cargoType: data.cargoType,
          isActive: data.isActive,
          movementType: data.movementType,
          container: data.container,
          tradelane: inputFields,
        })
      : addMutateAsync({ tradelane: inputFields, data })
  }

  const editHandler = (shipper) => {
    setId(shipper._id)
    setEdit(true)
    setValue('name', shipper.name)
    setValue('transportationType', shipper.transportationType)
    setValue('price', shipper.price)
    setValue(
      'departureSeaport',
      shipper.departureSeaport && shipper.departureSeaport._id
    )
    setValue(
      'arrivalSeaport',
      shipper.arrivalSeaport && shipper.arrivalSeaport._id
    )
    setValue(
      'departureAirport',
      shipper.departureAirport && shipper.departureAirport._id
    )
    setValue(
      'arrivalAirport',
      shipper.arrivalAirport && shipper.arrivalAirport._id
    )
    setValue('container', shipper.container && shipper.container._id)
    setValue('departureDate', shipper.departureDate.slice(0, 10))
    setValue('arrivalDate', shipper.arrivalDate.slice(0, 10))
    setValue('cargoType', shipper.cargoType)
    setValue('isActive', shipper.isActive)
    setValue('movementType', shipper.movementType)
    setValue('availableCapacity', shipper.availableCapacity)
    setInputFields(
      shipper.tradelane
        ? shipper.tradelane.map((fields) => ({
            dateTime: moment(fields.dateTime).format('YYYY-MM-DDTHH:mm:ss'),
            tradeType: fields.tradeType,
            actionType: fields.actionType,
            location: fields.location,
            description: fields.description,
            isActiveLocation: fields.isActiveLocation,
          }))
        : [
            {
              dateTime: '',
              tradeType: '',
              actionType: '',
              location: '',
              description: '',
              isActiveLocation: false,
            },
          ]
    )
  }

  const toUpper = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <>
      <Head>
        <title>Shipper</title>
        <meta property='og:title' content='Shipper' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Shipper has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessAdd && (
        <Message variant='success'>
          Shipper has been Created successfully.
        </Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>
          Shipper has been deleted successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      <div
        className='modal fade'
        id='editShipperModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editShipperModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog modal-lg'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editShipperModalLabel'>
                {edit ? 'Edit Shipper' : 'Add Shipper'}
              </h3>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
                onClick={formCleanHandler}
              ></button>
            </div>
            <div className='modal-body'>
              {isLoading ? (
                <div className='text-center'>
                  <Loader
                    type='ThreeDots'
                    color='#00BFFF'
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                  />
                </div>
              ) : isError ? (
                <Message variant='danger'>{error}</Message>
              ) : (
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className='row'>
                    <div className='col-md-6 col-12'>
                      {inputText({
                        register,
                        label: 'Name',
                        errors,
                        name: 'name',
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {staticInputSelect({
                        register,
                        label: 'Transportation Type',
                        errors,
                        name: 'transportationType',
                        data: [
                          { name: 'Ocean' },
                          { name: 'Plane' },
                          { name: 'Train' },
                          { name: 'Land' },
                        ],
                      })}
                    </div>
                    {watch().transportationType === 'Plane' && (
                      <div className='col-md-6 col-12'>
                        {inputNumber({
                          register,
                          label: 'Available Capacity (KG)',
                          errors,
                          name: 'availableCapacity',
                        })}
                      </div>
                    )}
                    {/* {watch().transportationType !== 'Plane' && ( */}
                    <>
                      <div className='col-md-6 col-12'>
                        {staticInputSelect({
                          register,
                          label: 'Cargo Type',
                          errors,
                          name: 'cargoType',
                          data:
                            watch().transportationType === 'Plane'
                              ? availableCargoType.plane
                              : availableCargoType.ocean,
                        })}
                      </div>
                      {watch().cargoType === 'LCL' && (
                        <div className='col-md-6 col-12'>
                          {dynamicInputSelect({
                            register,
                            label: 'Container',
                            errors,
                            name: 'container',
                            value: 'name',
                            data:
                              containersData &&
                              containersData.filter((c) => c.isActive),
                          })}
                        </div>
                      )}
                    </>
                    {/* )} */}

                    {watch().transportationType === 'Plane' && (
                      <div className='col-md-6 col-12'>
                        {staticInputSelect({
                          register,
                          label: 'Movement Type',
                          errors,
                          name: 'movementType',
                          data: [
                            { name: 'Airport to Airport' },
                            { name: 'Door to Door' },
                            { name: 'Door to Airport' },
                          ],
                        })}
                      </div>
                    )}
                    {watch().transportationType !== 'Plane' && (
                      <div className='col-md-6 col-12'>
                        {staticInputSelect({
                          register,
                          label: 'Movement Type',
                          errors,
                          name: 'movementType',
                          data: [
                            { name: 'Port to Port' },
                            { name: 'Door to Door' },
                            { name: 'Door to Port' },
                          ],
                        })}
                      </div>
                    )}
                    <div className='col-md-6 col-12'>
                      {inputNumber({
                        register,
                        label: 'Price per Kg',
                        errors,
                        name: 'price',
                      })}
                    </div>

                    {watch().transportationType === 'Plane' && (
                      <>
                        <div className='col-md-6 col-12'>
                          {dynamicInputSelect({
                            value: 'name',
                            register,
                            label: 'Departure Airport',
                            errors,
                            name: 'departureAirport',
                            data:
                              airportsData &&
                              airportsData.filter(
                                (airport) =>
                                  airport.isActive &&
                                  airport._id !== watch().arrivalAirport
                              ),
                          })}
                        </div>
                        <div className='col-md-6 col-12'>
                          {dynamicInputSelect({
                            value: 'name',
                            register,
                            label: 'Arrival Airport',
                            errors,
                            name: 'arrivalAirport',
                            data:
                              airportsData &&
                              airportsData.filter(
                                (airport) =>
                                  airport.isActive &&
                                  airport._id !== watch().departureAirport
                              ),
                          })}
                        </div>
                      </>
                    )}

                    {watch().transportationType !== 'Plane' && (
                      <>
                        <div className='col-md-6 col-12'>
                          {dynamicInputSelect({
                            value: 'name',
                            register,
                            label: 'Departure Port',
                            errors,
                            name: 'departureSeaport',
                            data:
                              seaportsData &&
                              seaportsData.filter(
                                (seaport) =>
                                  seaport.isActive &&
                                  seaport._id !== watch().arrivalSeaport
                              ),
                          })}
                        </div>
                        <div className='col-md-6 col-12'>
                          {dynamicInputSelect({
                            value: 'name',
                            register,
                            label: 'Arrival Port',
                            errors,
                            name: 'arrivalSeaport',
                            data:
                              seaportsData &&
                              seaportsData.filter(
                                (seaport) =>
                                  seaport.isActive &&
                                  seaport._id !== watch().departureSeaport
                              ),
                          })}
                        </div>
                      </>
                    )}
                    <div className='col-md-6 col-12'>
                      {inputDate({
                        register,
                        label: 'Departure Date',
                        errors,
                        name: 'departureDate',
                      })}
                    </div>

                    <div className='col-md-6 col-12'>
                      {inputDate({
                        register,
                        label: 'Arrival Date',
                        errors,
                        name: 'arrivalDate',
                      })}
                    </div>

                    <hr />
                    {inputFields.map((inputField, index) => (
                      <div key={index}>
                        <div className='row gx-1 p-2'>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              DateTime
                            </label>
                            <input
                              type='datetime-local'
                              className='form-control form-control-sm'
                              placeholder='DateTime'
                              name='dateTime'
                              id='dateTime'
                              value={inputField.dateTime}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Trade Type
                            </label>
                            <select
                              className='form-control form-control-sm'
                              name='tradeType'
                              id='tradeType'
                              value={inputField.tradeType}
                              onChange={(e) => handleInputChange(e, index)}
                            >
                              <option value=''>Select Trade Type</option>
                              <option value='Ocean'>Ocean</option>
                              <option value='Plane'>Plane</option>
                              <option value='Land'>Land</option>
                              <option value='Train'>Train</option>
                            </select>
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Location Name
                            </label>
                            <input
                              type='text'
                              className='form-control form-control-sm'
                              placeholder='Location Name'
                              name='location'
                              id='location'
                              value={inputField.location}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='item' className='form-label'>
                              Action Type
                            </label>
                            <select
                              className='form-control form-control-sm'
                              name='actionType'
                              id='actionType'
                              value={inputField.actionType}
                              onChange={(e) => handleInputChange(e, index)}
                            >
                              <option value=''>Select Action Type</option>
                              <option value='Departs At'>Departs At</option>
                              <option value='Arrives At'>Arrives At</option>
                            </select>
                          </div>
                          <div className='col-9'>
                            <label htmlFor='item' className='form-label'>
                              Description
                            </label>
                            <textarea
                              cols={30}
                              rows={5}
                              type='text'
                              className='form-control form-control-sm'
                              placeholder='Description'
                              name='description'
                              id='description'
                              value={inputField.description}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                            <button
                              type='button'
                              onClick={() => handleRemoveField(index)}
                              className='btn btn-danger float-end btn-sm mt-1'
                            >
                              <FaTrash className='mb-1' /> Remove
                            </button>
                          </div>
                          <div className='col-3'>
                            <label htmlFor='item' className='form-label'>
                              Is Active Location?
                            </label>
                            <select
                              className='form-control form-control-sm'
                              name='isActiveLocation'
                              id='isActiveLocation'
                              value={inputField.isActiveLocation}
                              onChange={(e) => handleInputChange(e, index)}
                            >
                              <option value=''>Select Action Type</option>
                              <option value={true}>Active</option>
                              <option value={false}>In-Active</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className='col-12 text-end'>
                      <button
                        onClick={() => handleAddField()}
                        type='button'
                        className='btn btn-primary btn-sm my-2'
                      >
                        <FaPlusCircle className='mb-1' /> Add New Event
                      </button>
                    </div>

                    <div className='col-12'>
                      {inputCheckBox({
                        register,
                        errors,
                        label: 'isActive',
                        name: 'isActive',
                        isRequired: false,
                      })}
                    </div>
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary '
                      data-bs-dismiss='modal'
                      onClick={formCleanHandler}
                    >
                      Close
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary '
                      disabled={isLoadingAdd || isLoadingUpdate}
                    >
                      {isLoadingAdd || isLoadingUpdate ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='position-relative'>
        <button
          className='btn btn-primary position-fixed rounded-3 animate__bounceIn'
          style={{
            bottom: '20px',
            right: '25px',
          }}
          data-bs-toggle='modal'
          data-bs-target='#editShipperModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data : []} filename='shipper.csv'>
          <button
            className='btn btn-success position-fixed rounded-3 animate__bounceIn'
            style={{
              bottom: '60px',
              right: '25px',
            }}
          >
            <FaFileDownload className='mb-1' />
          </button>
        </CSVLink>
      </div>

      <div className='row mt-2'>
        <div className='col-md-4 col-6 me-auto'>
          <h3 className='fw-light font-monospace'>Shippers</h3>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <div className='table-responsive '>
            <table className='table table-sm hover bordered table-striped caption-top '>
              <caption>{data && data.length} records were found</caption>
              <thead>
                <tr>
                  <th>Shipper</th>
                  <th>Cargo Type</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>D. Date</th>
                  <th>A. Date</th>
                  <th>Price Per KG</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((shipper) => (
                    <tr key={shipper._id}>
                      <td>{toUpper(shipper.name)}</td>
                      <td>{shipper.cargoType}</td>
                      <td>
                        {shipper.departureSeaport
                          ? shipper.departureSeaport.name
                          : shipper.departureAirport.name}
                      </td>
                      <td>
                        {shipper.arrivalSeaport
                          ? shipper.arrivalSeaport.name
                          : shipper.arrivalAirport.name}
                      </td>
                      <td>{shipper.departureDate.slice(0, 10)}</td>
                      <td>{shipper.arrivalDate.slice(0, 10)}</td>
                      <td>${shipper.price.toFixed(2)}</td>
                      <td>
                        {shipper.isActive ? (
                          <FaCheckCircle className='text-success mb-1' />
                        ) : (
                          <FaTimesCircle className='text-danger mb-1' />
                        )}
                      </td>

                      <td className='btn-shipper'>
                        <button
                          className='btn btn-primary btn-sm rounded-pill '
                          onClick={() => editHandler(shipper)}
                          data-bs-toggle='modal'
                          data-bs-target='#editShipperModal'
                        >
                          <FaPenAlt />
                        </button>

                        <button
                          className='btn btn-danger btn-sm rounded-pill ms-1'
                          onClick={() => deleteHandler(shipper._id)}
                          disabled={isLoadingDelete}
                        >
                          {isLoadingDelete ? (
                            <span className='spinner-border spinner-border-sm' />
                          ) : (
                            <span>
                              {' '}
                              <FaTrash />
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Shipper)), {
  ssr: false,
})
