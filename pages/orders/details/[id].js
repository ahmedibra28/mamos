import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { FaArrowAltCircleLeft, FaCircle, FaShip } from 'react-icons/fa'
import Head from 'next/head'
// import useOrders from '../../api/orders'

import useOrders from '../../../api/orders'
import Message from '../../../components/Message'
import Loader from 'react-loader-spinner'
import moment from 'moment'

const Details = () => {
  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails } = useOrders('', '', id)

  const { data, isLoading, isError, error } = getOrderDetails

  console.log(data && data)

  const totalContainerKG =
    data &&
    data.cargoType === 'FCL' &&
    data.containerFCL.reduce(
      (acc, curr) => acc + curr.container.payloadCapacity * curr.quantity,
      0
    )

  return (
    <div className='container py-3 font-monospace'>
      <Head>
        <title>Order Details</title>
        <meta property='og:title' content='Order Details' key='title' />
      </Head>
      <div className='row'>
        <div className='col'>
          <button
            onClick={() => router.back()}
            className='btn btn-primary btn-sm rounded-pill'
          >
            <FaArrowAltCircleLeft className='mb-1' /> Go Back
          </button>
        </div>
        <div className='col'>
          <h3 className='fw-light'>Order Details</h3>
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
          <div className='col-12'>
            <h5 className='bg-secondary py-1 text-light'>
              Tracking No. {data.trackingNo}
            </h5>
          </div>
          <div className='row bg-light mb-2'>
            <div className='col border '>
              <h4>{data.pickup.pickupCountry.name}</h4>
              <h5>{data.pickup.pickupPort.name}</h5>
              <span>
                Departing{' '}
                {moment(data.shipment.departureDate).format('MM Do YY')}
              </span>{' '}
              <br />
              <span>
                {' '}
                Transit time{' '}
                {moment(new Date(data.shipment.arrivalDate))
                  .diff(moment(new Date(data.shipment.departureDate)), 'days')
                  .toLocaleString()}{' '}
                days
              </span>
              {(data.movementType === 'Door to Door' ||
                data.movementType === 'Door to Port') && (
                <div className=' mt-3'>
                  <h5 className='bg-secondary py-1 text-light'>
                    Pickup Address Info
                  </h5>
                  <span>City: {data.pickup.pickUpCity}</span> <br />
                  <span>Town: **********</span> <br />
                  <span>Warehouse: {data.pickup.pickUpWarehouseName}</span>{' '}
                  <br />
                  <span>Postal Code: {data.pickup.pickUpPostalCode}</span>{' '}
                  <br />
                  <span>Address: {data.pickup.pickUpAddress}</span> <br />
                </div>
              )}
            </div>
            <div className='col text-end border'>
              <h4>{data.destination.destCountry.name}</h4>
              <h5>{data.destination.destPort.name}</h5>
              <span>
                Arriving {moment(data.shipment.arrivedDate).format('MM Do YY')}
              </span>

              {(data.movementType === 'Door to Door' ||
                data.movementType === 'Port to Door') && (
                <div className=' mt-3'>
                  <h5 className='bg-secondary py-1 text-light'>
                    Destination Address Info
                  </h5>
                  <span>City: {data.destination.destCity}</span> <br />
                  <span>Town: **********</span> <br />
                  <span>
                    Warehouse: {data.destination.destWarehouseName}
                  </span>{' '}
                  <br />
                  <span>
                    Postal Code: {data.destination.destPostalCode}
                  </span>{' '}
                  <br />
                  <span>Address: {data.destination.destAddress}</span> <br />
                </div>
              )}
            </div>
          </div>

          <div className='my-3'>
            <h5 className='bg-secondary py-1 text-light'>Buyer Info</h5>
            <table>
              <tbody>
                <tr>
                  <th scope='row' className='pe-3'>
                    Name
                  </th>
                  <td>{data.buyer.buyerName}</td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Mobile Number
                  </th>
                  <td>{data.buyer.buyerMobileNumber}</td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Email
                  </th>
                  <td>{data.buyer.buyerEmail}</td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Address
                  </th>
                  <td>{data.buyer.buyerAddress}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {data.cargoType === 'FCL' && (
            <div className='my-3'>
              <h5 className='bg-secondary py-1 text-light'>Containers Info</h5>
              <table>
                <tbody>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Containers
                    </th>
                    <td>
                      {data.containerFCL.map((s) => (
                        <div key={s.container._id}>
                          {s.quantity} x {s.container.name}
                        </div>
                      ))}
                    </td>
                  </tr>
                  <th scope='row' className='pe-3'>
                    Commodity
                  </th>
                  <td>{data.commodity.name}</td>
                </tbody>
              </table>
            </div>
          )}

          <div className='my-3'>
            <h5 className='bg-secondary py-1 text-light'>Cargo Info</h5>
            <table>
              <tbody>
                <tr>
                  <th scope='row' className='pe-3'>
                    Cargo Description
                  </th>
                  <td>{data.cargoDescription}</td>
                </tr>
                {data.cargoType === 'FCL' && (
                  <>
                    <tr>
                      <th scope='row' className='pe-3'>
                        Cargo Type
                      </th>
                      <td>{data.cargoType}</td>
                    </tr>
                    <tr>
                      <th scope='row' className='pe-3'>
                        Gross Weight
                      </th>
                      <td>{data.grossWeight} KG</td>
                    </tr>
                    <tr>
                      <th scope='row' className='pe-3'>
                        No of Packages
                      </th>
                      <td>{data.noOfPackages}</td>
                    </tr>
                    <tr>
                      <th scope='row' className='pe-3'>
                        Is Temperature Controlled?
                      </th>
                      <td>{data.isTemperatureControlled}</td>
                    </tr>
                  </>
                )}
                {data.cargoType === 'LCL' && (
                  <>
                    <tr>
                      <th scope='row' className='pe-3'>
                        Cargo Type
                      </th>
                      <td>{data.cargoType}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className='my-3'>
            <h5 className='bg-secondary py-1 text-light'>Other Info</h5>
            <table>
              <tbody>
                <tr>
                  <th scope='row' className='pe-3'>
                    Trade Type
                  </th>
                  <td>{data.importExport}</td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Movement Type
                  </th>
                  <td>{data.movementType}</td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Transportation Type
                  </th>
                  <td>{data.transportationType}</td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Booked Date
                  </th>
                  <td>{moment(data.createdAt).format('MMM Do YY')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className='my-3'>
            <h5 className='bg-secondary py-1 text-light'>Cost Info</h5>
            <table>
              <tbody>
                {!data.isHasInvoice && (
                  <tr>
                    <th scope='row' className='pe-3'>
                      Invoice Cost
                    </th>
                    <td>${79}.00</td>
                  </tr>
                )}
                <tr>
                  <th scope='row' className='pe-3'>
                    Transportation
                  </th>
                  <td>
                    ${(data.shipment.price * totalContainerKG).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <th scope='row' className='pe-3'>
                    Total Cost
                  </th>
                  <td>**********</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className='my-3'>
            <h5 className='bg-secondary py-1 text-light'>Tradelane Info</h5>
            {data &&
              data.shipment &&
              data.shipment.tradelane &&
              data.shipment.tradelane.map((event) => (
                <div
                  key={event._id}
                  className='card font-monospace bg-transparent border-0 '
                >
                  <div className='card-body'>
                    <div className='row' style={{ marginBottom: '-32px' }}>
                      <div className='col-3 text-end'>
                        <div className='left'>
                          <h6 className='fw-light text-muted'>
                            {moment(event.dateTime).format('MMM Do')}
                          </h6>
                          <h6 className='fw-light text-muted'>
                            {moment(event.dateTime).format('LT')}
                          </h6>
                        </div>
                      </div>
                      <div className='col-9 border border-success border-bottom-0 border-end-0 border-top-0 pb-4'>
                        <div className='right'>
                          <h6 className='card-title fw-light'>
                            {event.actionType}
                          </h6>
                          <div className='position-relative'>
                            <FaCircle
                              className='text-light border border-success rounded-pill position-absolute mt-2'
                              style={{ marginLeft: '-20' }}
                            />
                          </div>
                          <h1 className='card-title fs-4'>{event.location}</h1>
                          <div className='card-text'>
                            <h6 className='fw-light'>
                              <FaShip className='mb-1' /> {event.tradeType}
                            </h6>
                            <h6 className='fw-light'>{event.description}</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), { ssr: false })
