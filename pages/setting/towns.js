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
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa'

import useTowns from '../../api/towns'
import useAirports from '../../api/airports'
import useSeaports from '../../api/seaports'
import useCountries from '../../api/countries'

import { CSVLink } from 'react-csv'

import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../../components/Confirm'
import { useForm } from 'react-hook-form'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputNumber,
  inputText,
} from '../../utils/dynamicForm'

const Town = () => {
  const { getTowns, updateTown, addTown, deleteTown } = useTowns()
  const { getAirports } = useAirports()
  const { getSeaports } = useSeaports()
  const { getCountries } = useCountries()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
      isPort: false,
    },
  })

  const { data, isLoading, isError, error } = getTowns
  const { data: airportsData } = getAirports
  const { data: seaportsData } = getSeaports
  const { data: countriesData } = getCountries

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateTown

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deleteTown

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = addTown

  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)

  const formCleanHandler = () => {
    setEdit(false)
    reset()
  }

  useEffect(() => {
    if (isSuccessAdd || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessAdd, isSuccessUpdate])

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const submitHandler = async (data) => {
    edit
      ? updateMutateAsync({
          _id: id,
          name: data.name,
          seaport: data.seaport,
          airport: data.airport,
          cost: data.cost,
          isPort: data.isPort,
          country: data.country,
          isActive: data.isActive,
        })
      : addMutateAsync(data)
  }

  const editHandler = (town) => {
    setId(town._id)
    setEdit(true)
    setValue('name', town.name)
    setValue('country', town.country._id)
    setValue('isActive', town.isActive)
    setValue('seaport', town.seaport && town.seaport._id)
    setValue('airport', town.airport && town.airport._id)
    setValue('cost', town.cost)
    setValue('isPort', town.isPort)
  }

  const toUpper = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <>
      <Head>
        <title>Town</title>
        <meta property='og:title' content='Town' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>Town has been updated successfully.</Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessAdd && (
        <Message variant='success'>Town has been Created successfully.</Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>Town has been deleted successfully.</Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      <div
        className='modal fade'
        id='editTownModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editTownModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog modal-lg'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editTownModalLabel'>
                {edit ? 'Edit Town' : 'Add Town'}
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
                    <div className='col-12'>
                      {inputCheckBox({
                        name: 'isPort',
                        label: 'Is this a port?',
                        register,
                        errors,
                        isRequired: false,
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {inputText({
                        register,
                        label: 'Name',
                        errors,
                        name: 'name',
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {dynamicInputSelect({
                        register,
                        label: 'Country',
                        errors,
                        name: 'country',
                        value: 'name',
                        data:
                          countriesData &&
                          countriesData.filter((country) => country.isActive),
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {watch().isPort &&
                        watch().country &&
                        dynamicInputSelect({
                          register,
                          label: 'Seaport',
                          errors,
                          name: 'seaport',
                          value: 'name',
                          data:
                            seaportsData &&
                            seaportsData.filter(
                              (port) =>
                                port.isActive &&
                                port.country._id === watch().country
                            ),
                        })}
                      {!watch().isPort &&
                        watch().country &&
                        dynamicInputSelect({
                          register,
                          label: 'Airport',
                          errors,
                          name: 'airport',
                          value: 'name',
                          data:
                            airportsData &&
                            airportsData.filter(
                              (air) =>
                                air.isActive &&
                                air.country._id === watch().country
                            ),
                        })}
                    </div>
                    {watch().country && (
                      <div className='col-md-6 col-12'>
                        {inputNumber({
                          register,
                          label: 'Cost',
                          errors,
                          name: 'cost',
                        })}
                      </div>
                    )}

                    <div className='row'>
                      <div className='col'>
                        {inputCheckBox({
                          register,
                          errors,
                          label: 'isActive',
                          name: 'isActive',
                          isRequired: false,
                        })}
                      </div>
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
          data-bs-target='#editTownModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data : []} filename='town.csv'>
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
          <h3 className='fw-light font-monospace'>Towns</h3>
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
                  <th>Country</th>
                  <th>Airport/Seaport</th>
                  <th>Town Name</th>
                  <th>Cost</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((town) => (
                    <tr key={town._id}>
                      <td>{toUpper(town.country.name)}</td>
                      <td>
                        {town.seaport && town.seaport.name}{' '}
                        {town.airport && town.airport.name}
                      </td>
                      <td>{toUpper(town.name)}</td>
                      <td>${town.cost.toFixed(2)}</td>
                      <td>
                        {town.isActive ? (
                          <FaCheckCircle className='text-success mb-1' />
                        ) : (
                          <FaTimesCircle className='text-danger mb-1' />
                        )}
                      </td>

                      <td className='btn-town'>
                        <button
                          className='btn btn-primary btn-sm rounded-pill '
                          onClick={() => editHandler(town)}
                          data-bs-toggle='modal'
                          data-bs-target='#editTownModal'
                        >
                          <FaPenAlt />
                        </button>

                        <button
                          className='btn btn-danger btn-sm rounded-pill ms-1'
                          onClick={() => deleteHandler(town._id)}
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

export default dynamic(() => Promise.resolve(withAuth(Town)), {
  ssr: false,
})
