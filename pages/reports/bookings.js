import React from 'react'
// getBookingsReport
import useReportsHook from '../../utils/api/reports'

const Bookings = () => {
  const { getBookingsReport } = useReportsHook({})
  return <div className='text-center'>Booking report is in the next update</div>
}

export default Bookings
