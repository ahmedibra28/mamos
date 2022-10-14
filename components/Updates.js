import moment from 'moment'
import React from 'react'

const Updates = () => {
  const maintenanceSchedule = {
    startDate: moment().format('YYYY-MM-DD HH:mm'),
    endDate: moment().format('YYYY-MM-DD HH:mm'),
  }

  if (!maintenanceSchedule) {
    return (
      <div
        className='alert alert-warning bg-warning alert-dismissible fade show m-0 border-0 rounded-0 text-center'
        role='alert'
      >
        We will be performing <strong>system maintenance</strong> between
        <strong> {maintenanceSchedule.startDate}</strong> and
        <strong> {maintenanceSchedule.endDate}</strong> <br />
        <button
          type='button'
          className='btn-close'
          data-bs-dismiss='alert'
          aria-label='Close'
        ></button>
      </div>
    )
  } else {
    return <div></div>
  }
}

export default Updates
