import moment from 'moment'
import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { getDays } from '../utils/helper'

const TransportationItem = ({
  item,
  setSelectedTransportation,
  selectedTransportation,
  setSelectContainer,
}) => {
  return (
    <div
      className={`card ${
        selectedTransportation?._id === item?._id ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div className='card-body'>
        <label>
          <span className='fw-bold'> Transporter: </span> {item?.name}
        </label>
        <br />
        <label>
          <span className='fw-bold'>Price:</span> {item?.price}
        </label>
        <br />
        {item?.container && (
          <>
            <label>
              <span className='fw-bold'>Container: </span>
              {item?.container[0]?.container?.name}
            </label>
            <br />
            <label>
              <span className='fw-bold'>CBM Capacity: </span>
              {item?.container[0]?.container?.details?.CBM?.toFixed(0)} M
              <sup>3</sup>
            </label>
            <br />
          </>
        )}
        <label>
          <span className='fw-bold'>Delivery Duration: </span>
          {getDays(item?.arrivalDate, item?.departureDate)} days
        </label>

        <br />
        <label>
          <span className='fw-bold'>Departure Date: </span>
          {moment(item?.departureDate).format('ll')}
        </label>
        <br />
        <label>
          <span className='fw-bold'>Arrival Date: </span>
          {moment(item?.arrivalDate).format('ll')}
        </label>
      </div>
      <div className='card-footer p-0'>
        <button
          onClick={() => {
            setSelectContainer([]), setSelectedTransportation(item)
          }}
          type='button'
          className='btn btn-primary btn-sm w-100'
        >
          <FaCheckCircle className='mb-1' /> SELECT
        </button>
      </div>
    </div>
  )
}

export default TransportationItem
