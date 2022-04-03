import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import {
  FaArrowAltCircleLeft,
  FaCircle,
  FaShip,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa'
import Head from 'next/head'
import useOrders from '../../../api/orders'
import useContainers from '../../../api/containers'
import Message from '../../../components/Message'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import { Access, UnlockAccess } from '../../../utils/UnlockAccess'

const Details = () => {
  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails } = useOrders('', '', id)
  const { getContainers } = useContainers()

  const { data, isLoading, isError, error } = getOrderDetails
  const { data: containers } = getContainers

  const filteredContainers =
    containers &&
    containers.find(
      (c) =>
        data && data.cargoType === 'LCL' && data.shipment.container === c._id
    )

  const totalContainerKG =
    data &&
    data.cargoType === 'FCL' &&
    data.containerFCL.reduce(
      (acc, curr) => acc + curr.container.payloadCapacity * curr.quantity,
      0
    )

  const DEFAULT_LCL_CAPACITY =
    filteredContainers &&
    filteredContainers.length *
      filteredContainers.height *
      filteredContainers.width

  const TotalCBM =
    data &&
    data.containerLCL.length > 0 &&
    data.containerLCL.reduce(
      (acc, curr) => acc + curr.length * curr.width * curr.height,
      0
    )

  const TotalKG =
    data &&
    data.containerLCL.length > 0 &&
    data.containerLCL.reduce((acc, curr) => acc + curr.weight * curr.qty, 0)

  const lclService =
    data &&
    data.shipment &&
    (data.cargoType === 'LCL' || data.cargoType === 'AIR')
      ? data.cargoType === 'AIR'
        ? data.shipment.price * TotalKG
        : (data.shipment.price / DEFAULT_LCL_CAPACITY) * TotalCBM
      : 0

  const totalCost = () => {
    const totalContainerKGs = totalContainerKG ? totalContainerKG : 0
    const tService = data.shipment.price * totalContainerKGs
    const iService = data.isHasInvoice ? 0 : 79
    const dropOffService =
      data.movementType === 'Port to Door' ||
      data.movementType === 'Airport to Door' ||
      data.movementType === 'Door to Door' ||
      data.movementType === 'Airport to Door'
        ? data.destination.dropOffTown.price
        : 0
    const pickupService =
      data.movementType === 'Door to Port' ||
      data.movementType === 'Door to Door' ||
      data.movementType === 'Door to Airport'
        ? data.pickup.pickUpTown.price
        : 0

    return tService + iService + dropOffService + pickupService + lclService
  }

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
        data &&
        data.trackingNo && (
          <>
            <div className='col-12'>
              <h5 className='bg-secondary py-1 text-light'>
                Tracking No. {data.trackingNo}
              </h5>
            </div>

            <div className='my-3'>
              <h5 className='bg-secondary py-1 text-light'>
                Pickup Address Info
              </h5>
              <table>
                <tbody>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Country
                    </th>
                    <td>{data.pickup.pickupCountry.name}</td>
                  </tr>
                  <tr>
                    <th scope='row' className='pe-3'>
                      {data.cargoType === 'AIR'
                        ? 'Pickup Airport'
                        : 'Pickup Port'}
                    </th>
                    <td>
                      {data.cargoType === 'AIR'
                        ? data.pickup &&
                          data.pickup.pickupAirport &&
                          data.pickup.pickupAirport.name
                        : data.pickup.pickupPort.name}
                    </td>
                  </tr>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Departing
                    </th>
                    <td>
                      {moment(data.shipment.departureDate).format('MM Do YY')}
                    </td>
                  </tr>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Transit time
                    </th>
                    <td>
                      {' '}
                      {moment(new Date(data.shipment.arrivalDate))
                        .diff(
                          moment(new Date(data.shipment.departureDate)),
                          'days'
                        )
                        .toLocaleString()}{' '}
                      days
                    </td>
                  </tr>
                  {(data.movementType === 'Door to Door' ||
                    data.movementType === 'Door to Port' ||
                    data.movementType === 'Door to Airport') && (
                    <>
                      <tr>
                        <th scope='row' className='pe-3'>
                          City
                        </th>
                        <td>{data.pickup.pickUpCity}</td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Town
                        </th>
                        <td> {data.pickup.pickUpTown.name} </td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Warehouse
                        </th>
                        <td>{data.pickup.pickUpWarehouseName} </td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Postal Code
                        </th>
                        <td> {data.pickup.pickUpPostalCode}</td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Address
                        </th>
                        <td> {data.pickup.pickUpAddress}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <div className='my-3'>
              <h5 className='bg-secondary py-1 text-light'>
                Destination Address Info
              </h5>
              <table>
                <tbody>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Country
                    </th>
                    <td>{data.destination.destCountry.name}</td>
                  </tr>
                  <tr>
                    <th scope='row' className='pe-3'>
                      {data.cargoType === 'AIR'
                        ? 'Destination Airport'
                        : 'Destination Port'}
                    </th>
                    <td>
                      {data.cargoType === 'AIR'
                        ? data.destination &&
                          data.destination.destAirport &&
                          data.destination.destAirport.name
                        : data.destination.destPort.name}
                    </td>
                  </tr>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Arriving
                    </th>
                    <td>
                      {moment(data.shipment.arrivedDate).format('MM Do YY')}
                    </td>
                  </tr>

                  {(data.movementType === 'Door to Door' ||
                    data.movementType === 'Port to Door' ||
                    data.movementType === 'Airport to Door') && (
                    <>
                      <tr>
                        <th scope='row' className='pe-3'>
                          City
                        </th>
                        <td>{data.destination.destCity}</td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Town
                        </th>
                        <td> {data.destination.dropOffTown.name} </td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Warehouse
                        </th>
                        <td>{data.destination.destWarehouseName} </td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Postal Code
                        </th>
                        <td> {data.destination.destPostalCode}</td>
                      </tr>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Address
                        </th>
                        <td> {data.destination.destAddress}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
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
                <h5 className='bg-secondary py-1 text-light'>
                  Containers Info
                </h5>
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
                    <tr>
                      <th scope='row' className='pe-3'>
                        Commodity
                      </th>
                      <td>{data.commodity.name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className='my-3'>
              <h5 className='bg-secondary py-1 text-light'>Cargo Info</h5>
              <table>
                <tbody>
                  {data.cargoType === 'FCL' && (
                    <>
                      <tr>
                        <th scope='row' className='pe-3'>
                          Cargo Description
                        </th>
                        <td>{data.cargoDescription}</td>
                      </tr>
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
                        <td>
                          {data.isTemperatureControlled ? (
                            <FaCheckCircle className='mb-1 text-success' />
                          ) : (
                            <FaTimesCircle className='mb-1 text-danger' />
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                  {(data.cargoType === 'LCL' || data.cargoType === 'AIR') && (
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
                  {data.cargoType === 'LCL' && (
                    <tr>
                      <th scope='row' className='pe-3'>
                        Total CBM
                      </th>
                      <td>{TotalCBM} CBM</td>
                    </tr>
                  )}
                  {data.cargoType === 'AIR' && (
                    <tr>
                      <th scope='row' className='pe-3'>
                        Total KG
                      </th>
                      <td>{TotalKG} KG</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className='my-3'>
              <h5 className='bg-secondary py-1 text-light'>Cost Info</h5>
              <table>
                <tbody>
                  <tr>
                    <th scope='row' className='pe-3'>
                      Payment Method
                    </th>
                    <td>{data && data.paymentMethod}</td>
                  </tr>
                </tbody>

                {!UnlockAccess(Access.admin_logistic) ? (
                  <tbody>
                    <tr>
                      <th scope='row' className='pe-3'>
                        Total Cost
                      </th>
                      <td>${totalCost().toLocaleString()}</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {!data.isHasInvoice && (
                      <tr>
                        <th scope='row' className='pe-3'>
                          Invoice Cost
                        </th>
                        <td>${79}.00</td>
                      </tr>
                    )}
                    {(data.movementType === 'Door to Port' ||
                      data.movementType === 'Door to Door' ||
                      data.movementType === 'Door to Airport') && (
                      <tr>
                        <th scope='row' className='pe-3'>
                          Pickup Cost
                        </th>
                        <td>
                          ${data.pickup.pickUpTown.price.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {(data.movementType === 'Port to Door' ||
                      data.movementType === 'Door to Door') && (
                      <tr>
                        <th scope='row' className='pe-3'>
                          Drop-off Cost
                        </th>
                        <td>
                          ${data.destination.dropOffTown.price.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th scope='row' className='pe-3'>
                        Transportation
                      </th>
                      {(data.cargoType === 'LCL' ||
                        data.cargoType === 'AIR') && (
                        <td>${lclService.toLocaleString()}</td>
                      )}
                      {data.cargoType === 'FCL' && (
                        <td>
                          $
                          {(
                            data.shipment.price * totalContainerKG
                          ).toLocaleString()}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <th scope='row' className='pe-3'>
                        Total Cost
                      </th>
                      <td>${totalCost().toLocaleString()}</td>
                    </tr>
                  </tbody>
                )}
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
                                className={`border border-success rounded-pill position-absolute mt-2 ${
                                  event.isActiveLocation
                                    ? 'text-success'
                                    : 'text-light'
                                }`}
                                style={{ marginLeft: '-20' }}
                              />
                            </div>
                            <h1 className='card-title fs-4'>
                              {event.location}
                            </h1>
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
        )
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Details)), { ssr: false })
