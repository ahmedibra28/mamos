import React from 'react'
import moment from 'moment'
import {
  FaCheckCircle,
  FaCloudDownloadAlt,
  FaShip,
  FaPlane,
  FaTruck,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa'
import Image from 'next/image'

const Tabs = ({
  data,
  confirmOrderHandler,
  cancelOrderHandler,
  FaEdit,
  modalBuyer,
  editBuyerHandler,
  modalDropOff,
  editDropOffHandler,
  modalPickUp,
  editPickUpHandler,
  modalOther,
  editOtherHandler,
  modalDocument,
  editDocumentHandler,
  isLoadingUpdateToConfirm,
  isLoadingUpdateToDelete,
}) => {
  const isPending = data?.status === 'pending' ? true : false
  const navItems = [
    'Overview',
    'Buyer',
    'Pick-Up',
    'Drop-Off',
    'Prices',
    'Documents',
    'Other',
  ]
  return (
    <div>
      <nav className='mb-3'>
        <div className='nav nav-tabs' id='nav-tab' role='tablist'>
          {navItems.map((nav, index) => (
            <button
              key={index}
              className={`nav-link ${nav === 'Overview' ? 'active' : ''}`}
              id={`nav-${nav}-tab`}
              data-bs-toggle='tab'
              data-bs-target={`#nav-${nav}`}
              type='button'
              role='tab'
              aria-controls={`#nav-${nav}`}
              aria-selected='true'
            >
              {nav}
            </button>
          ))}
        </div>
      </nav>
      <div className='tab-content' id='nav-tabContent'>
        <div
          className='tab-pane fade show active'
          id='nav-Overview'
          role='tabpanel'
          aria-labelledby='nav-Overview-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-3 col-12 my-auto text-end'>
              <label>Place of receipt</label>
              <h5 className='fw-bold'>Mercin</h5>
              <label>on 16 Jun, 2022, 9:00</label>
            </div>
            <div
              className='col-md-6 col-12 py-2'
              style={{ background: '#EBECED' }}
            >
              <div className='d-flex justify-content-between'>
                <div>
                  <label>Port of loading</label>
                  <h4 className='fw-bold'>
                    <Image
                      width='30'
                      height='20'
                      src='https://flagcdn.com/48x36/tr.png'
                      alt='flag'
                      className='my-auto'
                    />{' '}
                    Mercin, TR
                  </h4>
                  <label>Departing 16 Jul, 2022, 9:32</label>
                </div>
                <div>
                  <label>Port of discharge</label>
                  <h4 className='fw-bold'>
                    Mogadishu, SO{' '}
                    <Image
                      width='30'
                      height='20'
                      src='https://flagcdn.com/48x36/so.png'
                      alt='flag'
                      className='my-auto'
                    />
                  </h4>
                  <label>Arriving 12 Aug, 2022, 23:40</label>
                </div>
              </div>
              <div className='progress my-2'>
                <div
                  className='progress-bar bg-success'
                  role='progressbar'
                  aria-label='Segment one'
                  style={{ width: '50%' }}
                  aria-valuenow='50'
                  aria-valuemin='0'
                  aria-valuemax='100'
                ></div>
                <div
                  className='progress-bar bg-white'
                  role='progressbar'
                  aria-label='Segment two'
                  style={{ width: '25%' }}
                  aria-valuenow='25'
                  aria-valuemin='0'
                  aria-valuemax='100'
                ></div>
                <div
                  className='progress-bar bg-danger'
                  role='progressbar'
                  aria-label='Segment three'
                  style={{ width: '35%' }}
                  aria-valuenow='35'
                  aria-valuemin='0'
                  aria-valuemax='100'
                ></div>
              </div>
              <label>
                Original transit time <span className='fw-bold'>20 Days </span>
              </label>{' '}
              |{' '}
              <label>
                Status:{' '}
                <span className='text-danger fw-bold'>Delayed 12 Days</span>
              </label>
              <label>
                Transport plan change reason:{' '}
                <span className='fw-bold'>
                  Due to schedule changes the connection is not feasible and the
                  transport plan had to be adjusted on a different service
                </span>
              </label>
            </div>
            <div className='col-md-3 col-12 my-auto'>
              <label>Place of delivery</label>
              <h5 className='fw-bold'>Mogadishu</h5>
              <label>on 12 Aug, 2022, 22:14</label>
            </div>
            <br />
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.trackingNo && (
                    <tr>
                      <td className='fw-bold'>Booking Reference</td>
                      <td>{data?.trackingNo}</td>
                    </tr>
                  )}
                  {data?.createdAt && (
                    <tr>
                      <td className='fw-bold'>Booking Date</td>
                      <td>{moment(data?.createdAt).format('ll')}</td>
                    </tr>
                  )}
                  {data?.createdBy && (
                    <tr>
                      <td className='fw-bold'>Booked By</td>
                      <td>{data?.createdBy?.name}</td>
                    </tr>
                  )}
                  {data?.status && (
                    <tr>
                      <td className='fw-bold'>Status</td>
                      <td>
                        <span>
                          {isPending && (
                            <span className='badge bg-warning'>
                              {data?.status}
                            </span>
                          )}
                          {data?.status === 'confirmed' && (
                            <span className='badge bg-success'>
                              {data?.status}
                            </span>
                          )}
                          {data?.status === 'deleted' && (
                            <span className='badge bg-danger'>
                              {data?.status}
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <h5 className='fw-bold mt-5'>Transport Plan</h5>
              {data?.tradelane ? (
                <table className='table table-striped table-borderless caption-top'>
                  <caption>
                    All dates/times are given as reasonable estimates only and
                    subject to change without prior notice.
                  </caption>
                  <tbody>
                    {data?.tradelane?.map((trade) => (
                      <tr key={trade?._id}>
                        <td>
                          {trade?.tradeType === 'ship' && (
                            <FaShip className='text-primary fs-1' />
                          )}
                          {trade?.tradeType === 'track' && (
                            <FaTruck className='text-primary fs-1' />
                          )}
                          {trade?.tradeType === 'plane' && (
                            <FaPlane className='text-primary fs-1' />
                          )}
                        </td>
                        <td>{moment(trade?.dateTime).format('MMM Do YY')}</td>
                        <td>{moment(trade?.dateTime).format('LT')}</td>
                        <td>
                          <span className='fw-bold'>
                            {trade?.actionType} {trade?.location}
                          </span>
                          <br />
                          <span>Terminal: {trade?.description}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='text-danger'>
                  Sorry, the tradelane for this transport is not available yet!
                </div>
              )}
            </div>
            <div className='col-md-4 col-12'>
              <div>
                {isPending && (
                  <>
                    <h6 className='fw-bold'>Booking actions</h6>
                    <button
                      disabled={
                        !isPending || isLoadingUpdateToConfirm ? true : false
                      }
                      onClick={() => confirmOrderHandler()}
                      className='btn btn-success w-100 mb-2'
                    >
                      {isLoadingUpdateToConfirm ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        <>
                          <span className='float-start'>
                            <FaCheckCircle className='mb-1' />
                          </span>
                          CONFIRM BOOKING
                        </>
                      )}
                    </button>
                  </>
                )}
                {data?.status !== 'deleted' && (
                  <button
                    onClick={() => cancelOrderHandler(data)}
                    disabled={
                      !isPending || isLoadingUpdateToDelete ? true : false
                    }
                    className='btn btn-danger w-100 mb-2'
                  >
                    {isLoadingUpdateToDelete ? (
                      <span className='spinner-border spinner-border-sm' />
                    ) : (
                      <>
                        <span className='float-start'>
                          <FaTrash className='mb-1' />
                        </span>
                        CANCEL BOOKING
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className='tab-pane fade'
          id='nav-Buyer'
          role='tabpanel'
          aria-labelledby='nav-Buyer-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.buyer?.buyerName && (
                    <tr>
                      <td className='fw-bold'>Name </td>
                      <td>{data?.buyer?.buyerName} </td>
                    </tr>
                  )}
                  {data?.buyer?.buyerMobileNumber && (
                    <tr>
                      <td className='fw-bold'>Mobile </td>
                      <td>{data?.buyer?.buyerMobileNumber} </td>
                    </tr>
                  )}
                  {data?.buyer?.buyerEmail && (
                    <tr>
                      <td className='fw-bold'>Email </td>
                      <td>{data?.buyer?.buyerEmail} </td>
                    </tr>
                  )}
                  {data?.buyer?.buyerAddress && (
                    <tr>
                      <td className='fw-bold'>Address </td>
                      <td>{data?.buyer?.buyerAddress} </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='col-md-4 col-'>
              <h6 className='fw-bold'>Other actions</h6>
              <button
                disabled={!isPending}
                data-bs-toggle='modal'
                data-bs-target={`#${modalBuyer}`}
                onClick={editBuyerHandler}
                className='btn btn-primary w-100 mb-2'
              >
                <span className='float-start'>
                  <FaEdit className='mb-1' />
                </span>
                UPDATE BUYER DETAILS
              </button>
            </div>
          </div>
        </div>
        <div
          className='tab-pane fade'
          id='nav-Pick-Up'
          role='tabpanel'
          aria-labelledby='nav-Pick-Up-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.pickUp?.pickUpCountry && (
                    <tr>
                      <td className='fw-bold'>Country: </td>
                      <td>{data?.pickUp?.pickUpCountry?.name} </td>
                    </tr>
                  )}
                  {data?.pickUp?.pickUpSeaport && (
                    <tr>
                      <td className='fw-bold'>Seaport: </td>
                      <td>{data?.pickUp?.pickUpSeaport?.name} </td>
                    </tr>
                  )}
                  {data?.pickUp?.pickUpAirport && (
                    <tr>
                      <td className='fw-bold'>Airport: </td>
                      <td>{data?.pickUp?.pickUpAirport?.name} </td>
                    </tr>
                  )}
                  {data?.pickUp?.pickUpTown && (
                    <tr>
                      <td className='fw-bold'>Town: </td>
                      <td>{data?.pickUp?.pickUpTown?.name} </td>
                    </tr>
                  )}
                  {data?.pickUp?.pickUpWarehouse && (
                    <tr>
                      <td className='fw-bold'>Warehouse: </td>
                      <td>{data?.pickUp?.pickUpWarehouse} </td>
                    </tr>
                  )}
                  {data?.pickUp?.pickUpCity && (
                    <tr>
                      <td className='fw-bold'>City: </td>
                      <td>{data?.pickUp?.pickUpCity} </td>
                    </tr>
                  )}
                  {data?.pickUp?.pickUpAddress && (
                    <tr>
                      <td className='fw-bold'>Address: </td>
                      <td>{data?.pickUp?.pickUpAddress} </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='col-md-4 col-12'>
              {data?.pickUp?.pickUpTown?._id && (
                <>
                  <h6 className='fw-bold'>Other actions</h6>
                  <button
                    disabled={!isPending}
                    data-bs-toggle='modal'
                    data-bs-target={`#${modalPickUp}`}
                    onClick={editPickUpHandler}
                    className='btn btn-primary w-100 mb-2'
                  >
                    <span className='float-start'>
                      <FaEdit className='mb-1' />
                    </span>
                    UPDATE PICK-UP DETAILS
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className='tab-pane fade'
          id='nav-Drop-Off'
          role='tabpanel'
          aria-labelledby='nav-Drop-Off-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.dropOff?.dropOffCountry && (
                    <tr>
                      <td className='fw-bold'>Country: </td>
                      <td>{data?.dropOff?.dropOffCountry?.name} </td>
                    </tr>
                  )}
                  {data?.dropOff?.dropOffSeaport && (
                    <tr>
                      <td className='fw-bold'>Seaport: </td>
                      <td>{data?.dropOff?.dropOffSeaport?.name} </td>
                    </tr>
                  )}
                  {data?.dropOff?.dropOffAirport && (
                    <tr>
                      <td className='fw-bold'>Airport: </td>
                      <td>{data?.dropOff?.dropOffAirport?.name} </td>
                    </tr>
                  )}
                  {data?.dropOff?.dropOffTown && (
                    <tr>
                      <td className='fw-bold'>Town: </td>
                      <td>{data?.dropOff?.dropOffTown?.name} </td>
                    </tr>
                  )}
                  {data?.dropOff?.dropOffWarehouse && (
                    <tr>
                      <td className='fw-bold'>Warehouse: </td>
                      <td>{data?.dropOff?.dropOffWarehouse} </td>
                    </tr>
                  )}
                  {data?.dropOff?.dropOffCity && (
                    <tr>
                      <td className='fw-bold'>City: </td>
                      <td>{data?.dropOff?.dropOffCity} </td>
                    </tr>
                  )}
                  {data?.dropOff?.dropOffAddress && (
                    <tr>
                      <td className='fw-bold'>Address: </td>
                      <td>{data?.dropOff?.dropOffAddress} </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='col-md-4 col-'>
              {data?.dropOff?.dropOffTown?._id && (
                <>
                  <h6 className='fw-bold'>Other actions</h6>
                  <button
                    disabled={!isPending}
                    data-bs-toggle='modal'
                    data-bs-target={`#${modalDropOff}`}
                    onClick={editDropOffHandler}
                    className='btn btn-primary w-100 mb-2'
                  >
                    <span className='float-start'>
                      <FaEdit className='mb-1' />
                    </span>
                    UPDATE DROP-OFF DETAILS
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className='tab-pane fade'
          id='nav-Prices'
          role='tabpanel'
          aria-labelledby='nav-Prices-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-7 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.price?.invoicePrice && (
                    <tr>
                      <td className='fw-bold'>Invoice Amount: </td>
                      <td>{data?.price?.invoicePrice} </td>
                    </tr>
                  )}
                  {data?.price?.pickUpPrice && (
                    <tr>
                      <td className='fw-bold'>Pick-up Amount: </td>
                      <td>{data?.price?.pickUpPrice} </td>
                    </tr>
                  )}
                  {data?.price?.dropOffPrice && (
                    <tr>
                      <td className='fw-bold'>Drop-off Amount: </td>
                      <td>{data?.price?.dropOffPrice} </td>
                    </tr>
                  )}
                  {data?.price?.customerPrice && (
                    <tr>
                      <td className='fw-bold'>Cargo Amount: </td>
                      <td>{data?.price?.customerPrice} </td>
                    </tr>
                  )}
                  {data?.price?.customerCBM && (
                    <tr>
                      <td className='fw-bold'>Total CBM: </td>
                      <td>{data?.price?.customerCBM} </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className='col-md-5 col-12'>
              {data?.price?.containerInfo && (
                <>
                  <table className='table table-striped mt-2'>
                    <thead>
                      <tr>
                        <th>Container</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.price?.containerInfo?.map((item, index) => (
                        <tr key={index}>
                          <td>{item?.name}</td>
                          <td>{item?.quantity}</td>
                          <td>${Number(item?.price).toFixed(2)}</td>
                          <td>
                            {(item?.quantity * Number(item?.price)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className='tab-pane fade'
          id='nav-Documents'
          role='tabpanel'
          aria-labelledby='nav-Documents-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  <tr>
                    <td className='fw-bold'>Invoice: </td>
                    <td>
                      {data?.other?.isHasInvoice ? (
                        <a
                          href={data?.other?.invoice}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <button className='btn btn-success btn-sm'>
                            <FaCloudDownloadAlt className='mb-1' /> download
                          </button>
                        </a>
                      ) : (
                        <FaTimesCircle className='text-danger' />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className='col-md-4 col-'>
              {data?.other && (
                <>
                  <h6 className='fw-bold'>Other actions</h6>
                  <button
                    disabled={!isPending}
                    data-bs-toggle='modal'
                    data-bs-target={`#${modalDocument}`}
                    onClick={editDocumentHandler}
                    className='btn btn-primary w-100 mb-2'
                  >
                    <span className='float-start'>
                      <FaEdit className='mb-1' />
                    </span>
                    UPDATE DOCUMENTS DETAILS
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className='tab-pane fade'
          id='nav-Other'
          role='tabpanel'
          aria-labelledby='nav-Other-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.other?.importExport && (
                    <tr>
                      <td className='fw-bold'>Import/Export: </td>
                      <td>{data?.other?.importExport} </td>
                    </tr>
                  )}
                  {data?.other?.transportationType && (
                    <tr>
                      <td className='fw-bold'>Transportation Type: </td>
                      <td>{data?.other?.transportationType} </td>
                    </tr>
                  )}
                  {data?.other?.movementType && (
                    <tr>
                      <td className='fw-bold'>Movement Type: </td>
                      <td>{data?.other?.movementType} </td>
                    </tr>
                  )}
                  {data?.other?.cargoType && (
                    <tr>
                      <td className='fw-bold'>Cargo Type: </td>
                      <td>{data?.other?.cargoType} </td>
                    </tr>
                  )}
                  {data?.other?.cargoDescription && (
                    <tr>
                      <td className='fw-bold'>Cargo Description: </td>
                      <td>{data?.other?.cargoDescription} </td>
                    </tr>
                  )}
                  {data?.other?.noOffPackages && (
                    <tr>
                      <td className='fw-bold'>No. Off Packages: </td>
                      <td>{data?.other?.noOffPackages} </td>
                    </tr>
                  )}
                  {data?.other?.grossWeight && (
                    <tr>
                      <td className='fw-bold'>Gross Weight: </td>
                      <td>{data?.other?.grossWeight} </td>
                    </tr>
                  )}
                  {data?.other?.commodity && (
                    <tr>
                      <td className='fw-bold'>Commodity: </td>
                      <td>{data?.other?.commodity?.name} </td>
                    </tr>
                  )}
                  {data?.other && (
                    <tr>
                      <td className='fw-bold'>Is Temperature Controlled? </td>
                      <td>
                        {data?.other?.isTemperatureControlled ? (
                          <FaCheckCircle className='text-success' />
                        ) : (
                          <FaTimesCircle className='text-danger' />
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className='col-md-4 col-12'>
              <h6 className='fw-bold'>Other actions</h6>

              <button
                disabled={!isPending}
                data-bs-toggle='modal'
                data-bs-target={`#${modalOther}`}
                onClick={editOtherHandler}
                className='btn btn-primary w-100 mb-2'
              >
                <span className='float-start'>
                  <FaEdit className='mb-1' />
                </span>
                UPDATE OTHER DETAILS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tabs