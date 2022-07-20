import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import useOrdersHook from '../../../utils/api/orders'
import { Spinner, Message } from '../../../components'
import { FaPlusCircle, FaSearch, FaTrash } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import moment from 'moment'

const Details = () => {
  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails } = useOrdersHook({
    id,
  })

  const { data, isLoading, isError, error } = getOrderDetails

  return (
    <>
      <Head>
        <title>Book New Orders</title>
        <meta property='og:title' content='Book New Orders' key='title' />
      </Head>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='bg-light p-3 my-2'>
          <div className='row'>
            <div className='col-md-6 col-12'>
              {/* Buyer Info */}
              <div className='mb-4'>
                {data?.buyer && <h4 className='fw-bold'>BUYER DETAILS</h4>}
                {data?.buyer?.buyerName && (
                  <div>
                    <span className='fw-bold'>Name: </span>
                    <span>{data?.buyer?.buyerName} </span>
                  </div>
                )}
                {data?.buyer?.buyerMobileNumber && (
                  <div>
                    <span className='fw-bold'>Mobile: </span>
                    <span>{data?.buyer?.buyerMobileNumber} </span>
                  </div>
                )}
                {data?.buyer?.buyerEmail && (
                  <div>
                    <span className='fw-bold'>Email: </span>
                    <span>{data?.buyer?.buyerEmail} </span>
                  </div>
                )}
                {data?.buyer?.buyerAddress && (
                  <div>
                    <span className='fw-bold'>Address: </span>
                    <span>{data?.buyer?.buyerAddress} </span>
                  </div>
                )}
              </div>

              {/* PickUp Info */}
              <div className='mb-4'>
                {data?.pickUp && <h4 className='fw-bold'>PICK-UP DETAILS</h4>}
                {data?.pickUp?.pickUpCountry && (
                  <div>
                    <span className='fw-bold'>Country: </span>
                    <span>{data?.pickUp?.pickUpCountry?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpSeaport && (
                  <div>
                    <span className='fw-bold'>Seaport: </span>
                    <span>{data?.pickUp?.pickUpSeaport?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpAirport && (
                  <div>
                    <span className='fw-bold'>Airport: </span>
                    <span>{data?.pickUp?.pickUpAirport?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpTown && (
                  <div>
                    <span className='fw-bold'>Town: </span>
                    <span>{data?.pickUp?.pickUpTown?.name} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpWarehouse && (
                  <div>
                    <span className='fw-bold'>Warehouse: </span>
                    <span>{data?.pickUp?.pickUpWarehouse} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpCity && (
                  <div>
                    <span className='fw-bold'>City: </span>
                    <span>{data?.pickUp?.pickUpCity} </span>
                  </div>
                )}
                {data?.pickUp?.pickUpAddress && (
                  <div>
                    <span className='fw-bold'>Address: </span>
                    <span>{data?.pickUp?.pickUpAddress} </span>
                  </div>
                )}
              </div>

              {/* DropOff Info */}
              <div className='mb-4'>
                {data?.dropOff && <h4 className='fw-bold'>DROP-OFF DETAILS</h4>}
                {data?.dropOff?.dropOffCountry && (
                  <div>
                    <span className='fw-bold'>Country: </span>
                    <span>{data?.dropOff?.dropOffCountry?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffSeaport && (
                  <div>
                    <span className='fw-bold'>Seaport: </span>
                    <span>{data?.dropOff?.dropOffSeaport?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffAirport && (
                  <div>
                    <span className='fw-bold'>Airport: </span>
                    <span>{data?.dropOff?.dropOffAirport?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffTown && (
                  <div>
                    <span className='fw-bold'>Town: </span>
                    <span>{data?.dropOff?.dropOffTown?.name} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffWarehouse && (
                  <div>
                    <span className='fw-bold'>Warehouse: </span>
                    <span>{data?.dropOff?.dropOffWarehouse} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffCity && (
                  <div>
                    <span className='fw-bold'>City: </span>
                    <span>{data?.dropOff?.dropOffCity} </span>
                  </div>
                )}
                {data?.dropOff?.dropOffAddress && (
                  <div>
                    <span className='fw-bold'>Address: </span>
                    <span>{data?.dropOff?.dropOffAddress} </span>
                  </div>
                )}
              </div>
            </div>
            <div className='col-md-6 col-12'>
              {/* Order Info */}
              <div className='mb-4'>
                {data?.other && <h4 className='fw-bold'>ORDER DETAILS</h4>}
                {data?.trackingNo && (
                  <div>
                    <span className='fw-bold'>Tracking No: </span>
                    <span>{data?.trackingNo} </span>
                  </div>
                )}
                {data?.createdBy && (
                  <div>
                    <span className='fw-bold'>Ordered By: </span>
                    <span>{data?.createdBy?.name} </span>
                  </div>
                )}
                {data?.status && (
                  <div>
                    <span className='fw-bold'>Status: </span>
                    <span>
                      {data?.status === 'pending' && (
                        <span className='badge bg-warning'>{data?.status}</span>
                      )}
                      {data?.status === 'confirmed' && (
                        <span className='badge bg-success'>{data?.status}</span>
                      )}
                      {data?.status === 'deleted' && (
                        <span className='badge bg-danger'>{data?.status}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              {/* Other Info */}
              <div className='mb-4'>
                {data?.other && <h4 className='fw-bold'>OTHER DETAILS</h4>}

                {data?.other?.importExport && (
                  <div>
                    <span className='fw-bold'>Import/Export: </span>
                    <span>{data?.other?.importExport} </span>
                  </div>
                )}
                {data?.other?.transportationType && (
                  <div>
                    <span className='fw-bold'>Transportation Type: </span>
                    <span>{data?.other?.transportationType} </span>
                  </div>
                )}
                {data?.other?.movementType && (
                  <div>
                    <span className='fw-bold'>Movement Type: </span>
                    <span>{data?.other?.movementType} </span>
                  </div>
                )}
                {data?.other?.cargoType && (
                  <div>
                    <span className='fw-bold'>Cargo Type: </span>
                    <span>{data?.other?.cargoType} </span>
                  </div>
                )}
                {data?.other?.cargoDescription && (
                  <div>
                    <span className='fw-bold'>Cargo Description: </span>
                    <span>{data?.other?.cargoDescription} </span>
                  </div>
                )}
                {data?.other?.noOffPackages && (
                  <div>
                    <span className='fw-bold'>No. Off Packages: </span>
                    <span>{data?.other?.noOffPackages} </span>
                  </div>
                )}
                {data?.other?.grossWeight && (
                  <div>
                    <span className='fw-bold'>Gross Weight: </span>
                    <span>{data?.other?.grossWeight} </span>
                  </div>
                )}
                {data?.other?.commodity && (
                  <div>
                    <span className='fw-bold'>Commodity: </span>
                    <span>{data?.other?.commodity?.name} </span>
                  </div>
                )}
                {data?.other?.transportation && (
                  <>
                    <div>
                      <span className='fw-bold'>Transportor: </span>
                      <span>{data?.other?.transportation?.name} </span>
                    </div>
                    <div>
                      <span className='fw-bold'>Departure Date: </span>
                      <span>
                        {moment(data?.other?.departureDate).format('ll')}
                      </span>
                    </div>
                    <div>
                      <span className='fw-bold'>Arrival Date: </span>
                      <span>
                        {moment(data?.other?.arrivalDate).format('ll')}
                      </span>
                    </div>
                  </>
                )}
                {data?.other && (
                  <div>
                    <span className='fw-bold'>Is Temperature Controlled? </span>
                    <span>
                      {data?.other?.isTemperatureControlled ? (
                        <FaCheckCircle className='text-success' />
                      ) : (
                        <FaTimesCircle className='text-danger' />
                      )}
                    </span>
                  </div>
                )}
                {data?.other && (
                  <div>
                    <span className='fw-bold'>Is Has Invoice? </span>
                    <span>
                      {data?.other?.isHasInvoice ? (
                        <FaCheckCircle className='text-success' />
                      ) : (
                        <FaTimesCircle className='text-danger' />
                      )}
                    </span>
                  </div>
                )}
                {data?.other?.invoice && (
                  <div>
                    <span className='fw-bold'>Invoice: </span>
                    <span>{data?.other?.invoice} </span>
                  </div>
                )}
              </div>

              {/* Pricing Info */}
              <div className='mb-4'>
                {data?.other && <h4 className='fw-bold'>PRICING DETAILS</h4>}
                {data?.other?.importExport && (
                  <div>
                    <span className='fw-bold'>Import/Export: </span>
                    <span>{data?.other?.importExport} </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), {
  ssr: false,
})
