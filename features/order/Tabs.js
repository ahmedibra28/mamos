import React from 'react'
import moment from 'moment'
import {
  FaCheckCircle,
  FaCloudDownloadAlt,
  FaDownload,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa'

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
      <nav>
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
            <div className='col-md-8 col-12'>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
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
            </div>
            <div className='col-md-4 col-12'>
              <div>
                <h6 className='fw-bold'>Booking actions</h6>
                {isPending && (
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
