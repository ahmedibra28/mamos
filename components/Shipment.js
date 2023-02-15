import moment from 'moment'
import Link from 'next/link'
import React from 'react'
import { FaCircle, FaSadTear } from 'react-icons/fa'
import Pagination from './Pagination'
import Search from './Search'

const Shipment = ({ data, setPage, q, setQ, handleSearch }) => {
  return (
    <>
      <div className='d-flex align-items-center flex-column mb-2'>
        <h3 className='fw-light text-muted'>
          Shipments
          <sup className='fs-6'> [{data && data.total}] </sup>
        </h3>

        <div className='col-auto'>
          <Search
            placeholder='Search by Tracking no.'
            setQ={setQ}
            q={q}
            searchHandler={handleSearch}
          />
        </div>
      </div>

      <div className='row gy-3 mb-3'>
        <div className='d-flex justify-content-between'>
          <Link
            href='/orders/bookings'
            className='btn btn-primary btn text-light rounded-pill px-3 py-2 my-auto'
          >
            Start booking
          </Link>
          <div className='ms-auto text-end'>
            <Pagination data={data} setPage={setPage} />
          </div>
        </div>

        <hr className='mt-4 mb-2' />

        {data?.data
          // ?.filter((d) => ['Pending', 'Active'].includes(d?.status))
          ?.map((obj) => (
            <div key={obj?._id} className='col-lg-6 col-12'>
              <div className='card border-0 bg-light'>
                <div className='card-body'>
                  <div className='d-flex justify-content-between'>
                    <div>
                      <span className='badge bg-primary ms-1'>
                        {obj?.TrackingNo}
                      </span>
                      <span className='badge bg-primary ms-1'>
                        {obj?.other?.importExport}
                      </span>
                      <span className='badge bg-primary ms-1'>
                        {obj?.other?.movementType}
                      </span>
                      <span className='badge bg-warning ms-1'>
                        {obj?.other?.transportation?.vendor?.name}
                      </span>
                    </div>
                    <div>
                      <button
                        className={`btn btn-${
                          obj?.status === 'Pending'
                            ? 'warning'
                            : obj?.status === 'Confirmed'
                            ? 'success'
                            : obj?.status === 'cancelled' && 'danger'
                        } btn-sm me-1`}
                      >
                        Booking is {obj?.status}
                      </button>
                      <Link
                        href={`/orders/details/${obj?._id}`}
                        className='btn btn-info btn-sm'
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                  <div className='d-flex justify-content-between my-3'>
                    <div>
                      <span>
                        {moment(
                          obj?.other?.transportation?.departureDate
                        ).format('D MMM')}
                      </span>
                      <FaCircle className='mb-1 mx-2' />

                      <span className='fw-bold'>
                        {obj?.pickUp?.pickUpSeaport?.name},
                      </span>
                      <span className='fw-bold ms-1'>
                        {obj?.pickUp?.pickUpCountry?.name}
                      </span>
                    </div>
                    <div>
                      <span>
                        {moment(obj?.other?.transportation?.delayDate).format(
                          'D MMM'
                        )}
                      </span>
                      <FaCircle className='mb-1 mx-2' />
                      <span className='fw-bold'>
                        {obj?.dropOff?.dropOffSeaport?.name},
                      </span>
                      <span className='fw-bold ms-1'>
                        {obj?.dropOff?.dropOffCountry?.name}
                      </span>
                    </div>
                  </div>

                  <div className='d-flex justify-content-between my-3'>
                    <div>
                      <span>Buyer</span>
                      <h6 className='fw-bold'>{obj?.buyer?.buyerName}</h6>
                    </div>
                    <div>
                      <span>Booked By</span>
                      <h6 className='fw-bold'>{obj?.createdBy?.name}</h6>
                    </div>
                    <div>
                      <span>Shipment Reference</span>
                      <h6 className='fw-bold'>
                        {obj?.other?.transportation?.reference}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {data?.data.length === 0 && (
          <div className='text-center text-danger'>
            <FaSadTear className='mb-1' />
            <span className='ms-2'>Sorry, no results were found!</span>
          </div>
        )}
      </div>
    </>
  )
}

export default Shipment
