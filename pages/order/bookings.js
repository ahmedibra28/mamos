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

import { Spinner, Pagination, Message, Confirm } from '../../components'
import {
  dynamicInputSelect,
  InputAutoCompleteSelect,
  inputEmail,
  inputPassword,
  inputTel,
  inputText,
  inputTextArea,
  staticInputSelect,
} from '../../utils/dynamicForm'

const Bookings = () => {
  const { postBookings, postAvailableTransportations } = useBookingsHook({})
  const { getSeaports } = useSeaportsHook({ limit: 1000000 })
  const { getAirports } = useAirportsHook({ limit: 1000000 })
  const { getCountries } = useCountriesHook({ limit: 1000000 })

  const { data: seaportsData } = getSeaports
  const { data: airportsData } = getAirports
  const { data: countriesData } = getCountries
  const { data: transportationsData, mutateAsync: transportationsMutateAsync } =
    postAvailableTransportations

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const submitHandler = (data) => {
    console.log(data)
    transportationsMutateAsync({
      transportationType: watch().transportationType,
      pickupAirport: watch().pickupAirport,
      pickupSeaport: watch().pickupSeaport,
      destinationAirport: watch().destinationAirport,
      destinationSeaport: watch().destinationSeaport,
    })
  }

  console.log(transportationsData)
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
          </div>
        </div>

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

        <button
          type='submit'
          className='btn btn-primary float-end'
          // disabled={isLoadingPost || isLoadingUpdate}
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
