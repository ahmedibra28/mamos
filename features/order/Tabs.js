import moment from 'moment'
import {
  FaCheckCircle,
  FaCloudDownloadAlt,
  FaShip,
  FaPlane,
  FaTruck,
  FaTimesCircle,
  FaTrash,
  FaPaperPlane,
  FaTrain,
} from 'react-icons/fa'
import { inputCheckBox } from '../../utils/dynamicForm'
import { getDays } from '../../utils/helper'
import { hide } from '../../utils/UnlockAccess'

const Tabs = ({
  data,
  confirmOrderHandler,
  isLoadingUpdateProgress,
  cancelOrderHandler,
  setCancelledReason,
  cancelledReason,
  setIsCancel,
  isCancel,

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
  editBookingDateHandler,
  modalBookingDate,
  payment,
  setPayment,
  updatePayment,

  registerProcess,
  errorsProcess,
  handleSubmitProcess,
  submitHandlerProcess,
  steps,
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
    'Payments',
  ]

  const originalDays = getDays(
    data?.other?.transportation?.arrivalDate,
    data?.other?.transportation?.departureDate
  )

  const traveledDays = getDays(
    moment().format(),
    data?.other?.transportation?.departureDate
  )

  let delayedDays =
    getDays(
      data?.other?.transportation?.delayDate,
      data?.other?.transportation?.arrivalDate
    ) <= 0
      ? 0
      : getDays(
          data?.other?.transportation?.delayDate,
          data?.other?.transportation?.arrivalDate
        )

  const durationDays = originalDays + delayedDays
  delayedDays = traveledDays >= durationDays ? 0 : delayedDays

  const remainingDays =
    traveledDays >= durationDays ? 0 : durationDays - traveledDays
  const delayedDaysPercentage = (delayedDays * 100) / durationDays
  const traveledDaysPercentage = (traveledDays * 100) / durationDays
  const remainingDaysPercentage = (remainingDays * 100) / durationDays

  const paymentOptions = [
    {
      name: 'payment',
      id: 'payment1',
      label: 'Pre-payment',
      value: 'prepayment',
    },
    {
      name: 'payment',
      id: 'payment2',
      label: 'Partial payment',
      value: 'partial',
    },
    {
      name: 'payment',
      id: 'payment3',
      label: 'Payment due',
      value: 'due',
    },
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
              <h5 className='fw-bold'>
                {data?.pickUp?.pickUpSeaport?.name ||
                  data?.pickUp?.pickUpAirport?.name}
              </h5>
              <label>
                on{' '}
                {moment(data?.other?.transportation?.departureDate).format(
                  'MMM Do YYYY'
                )}
              </label>
            </div>
            <div
              className='col-md-6 col-12 py-2'
              style={{ background: '#EBECED' }}
            >
              <div className='d-flex justify-content-between'>
                <div>
                  <label>Place of loading</label>
                  <h5 className='fw-bold'>
                    {/* <Image
                      width='30'
                      height='20'
                      src='https://flagcdn.com/48x36/tr.png'
                      alt='flag'
                      className='my-auto'
                    />*/}
                    {data?.pickUp?.pickUpSeaport?.name ||
                      data?.pickUp?.pickUpAirport?.name}
                  </h5>
                  <label>
                    Departing{' '}
                    {moment(data?.other?.transportation?.departureDate).format(
                      'MMM Do YYYY'
                    )}
                  </label>
                </div>
                <div>
                  <label>Place of discharge</label>
                  <h5 className='fw-bold'>
                    {data?.dropOff?.dropOffSeaport?.name ||
                      data?.dropOff?.dropOffAirport?.name}
                    {/* , {data?.dropOff?.dropOffCountry?.name} */}
                    {/* <Image
                      width='30'
                      height='20'
                      src='https://flagcdn.com/48x36/so.png'
                      alt='flag'
                      className='my-auto'
                    /> */}
                  </h5>
                  <label>
                    Arriving{' '}
                    {moment(data?.other?.transportation?.delayDate).format(
                      'll'
                    )}
                  </label>
                </div>
              </div>
              <div className='progress my-2'>
                <div
                  className='progress-bar bg-success'
                  role='progressbar'
                  aria-label='Segment one'
                  style={{ width: `${traveledDaysPercentage}%` }}
                  aria-valuenow={traveledDaysPercentage}
                  aria-valuemin='0'
                  aria-valuemax='100'
                ></div>
                <div
                  className='progress-bar bg-white'
                  role='progressbar'
                  aria-label='Segment two'
                  style={{
                    width: `${remainingDaysPercentage}%`,
                  }}
                  aria-valuenow={remainingDaysPercentage}
                  aria-valuemin='0'
                  aria-valuemax='100'
                ></div>
                <div
                  className='progress-bar bg-danger'
                  role='progressbar'
                  aria-label='Segment three'
                  style={{ width: `${delayedDaysPercentage}%` }}
                  aria-valuenow={delayedDaysPercentage}
                  aria-valuemin='0'
                  aria-valuemax='100'
                ></div>
              </div>
              <label>
                Original transit time{' '}
                <span className='fw-bold'>{originalDays} Days</span>
              </label>
              {delayedDays > 0 && (
                <>
                  {' | '}
                  <label>
                    Status:{' '}
                    <span className='text-danger fw-bold'>
                      Delayed {delayedDays} Days
                    </span>
                  </label>

                  <label>
                    Transport plan change reason:{' '}
                    <span className='fw-bold'>
                      Due to schedule changes the connection is not feasible and
                      the transport plan had to be adjusted on a different
                      service
                    </span>
                  </label>
                </>
              )}
            </div>
            <div className='col-md-3 col-12 my-auto text-start'>
              <label>Place of delivery</label>
              <h5 className='fw-bold'>
                {data?.dropOff?.dropOffSeaport?.name ||
                  data?.dropOff?.dropOffAirport?.name}
              </h5>
              <label>
                on{' '}
                {moment(data?.other?.transportation?.delayDate).format(
                  'MMM Do YYYY'
                )}
              </label>
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
                            <span className='badge bg-info'>
                              {data?.status}
                            </span>
                          )}
                          {data?.status === 'arrived' && (
                            <span className='badge bg-success'>
                              {data?.status}
                            </span>
                          )}
                          {data?.status === 'cancelled' && (
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
                          {trade?.tradeType === 'train' && (
                            <FaTrain className='text-primary fs-1' />
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

                    <form onSubmit={handleSubmitProcess(submitHandlerProcess)}>
                      <div className='mt-3 border border-5 border-warning border-top-0 border-bottom-0 border-end-0 mb-2'>
                        <label className='fw-bold ms-2'>
                          Please complete these steps to submit this booking
                        </label>

                        <ul className='list-group list-group-flush'>
                          {steps?.map((step) => (
                            <li
                              key={step?._id}
                              className='list-group-item bg-transparent'
                            >
                              {inputCheckBox({
                                register: registerProcess,
                                error: errorsProcess,
                                name: step?.value,
                                label: step?.label,
                                placeholder: step?.label,
                                isRequired: false,
                                resetStyle: true,
                              })}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type='submit'
                        disabled={
                          !isPending || isLoadingUpdateProgress ? true : false
                        }
                        className='btn btn-warning w-100 mb-2'
                      >
                        {isLoadingUpdateProgress ? (
                          <span className='spinner-border spinner-border-sm' />
                        ) : (
                          <>
                            <span className='float-start'>
                              <FaCheckCircle className='mb-1' />
                            </span>
                            UPDATE CURRENT PROGRESS
                          </>
                        )}
                      </button>
                    </form>

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
                {data?.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => setIsCancel(true)}
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
                    {isCancel && (
                      <div className='mb-2'>
                        <label htmlFor='cancelledReason'>
                          Cancelling Reason
                        </label>
                        <textarea
                          cols='30'
                          rows='3'
                          type='text'
                          className='form-control'
                          onChange={(e) => setCancelledReason(e.target.value)}
                          value={cancelledReason}
                        />
                        <button
                          disabled={
                            !isPending || isLoadingUpdateToDelete ? true : false
                          }
                          onClick={() => cancelOrderHandler(data)}
                          className='btn btn-danger btn-sm float-end mt-1'
                        >
                          {isLoadingUpdateToDelete ? (
                            <span className='spinner-border spinner-border-sm' />
                          ) : (
                            <>
                              <span className='float-start'>
                                <FaTrash className='mb-1' />
                              </span>
                              CONFIRM
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
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
                      <td>
                        {hide(['LOGISTIC']) ? (
                          <span className='badge bg-danger'>N/A</span>
                        ) : (
                          data?.price?.invoicePrice
                        )}{' '}
                      </td>
                    </tr>
                  )}
                  {data?.price?.pickUpPrice && (
                    <tr>
                      <td className='fw-bold'>Pick-up Amount: </td>
                      <td>
                        {hide(['LOGISTIC']) ? (
                          <span className='badge bg-danger'>N/A</span>
                        ) : (
                          data?.price?.pickUpPrice
                        )}{' '}
                      </td>
                    </tr>
                  )}
                  {data?.price?.dropOffPrice && (
                    <tr>
                      <td className='fw-bold'>Drop-off Amount: </td>
                      <td>
                        {hide(['LOGISTIC']) ? (
                          <span className='badge bg-danger'>N/A</span>
                        ) : (
                          data?.price?.dropOffPrice
                        )}{' '}
                      </td>
                    </tr>
                  )}
                  {data?.price?.customerPrice && (
                    <tr>
                      <td className='fw-bold'>Cargo Amount: </td>
                      <td>
                        {hide(['LOGISTIC']) ? (
                          <span className='badge bg-danger'>N/A</span>
                        ) : (
                          data?.price?.customerPrice
                        )}{' '}
                      </td>
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
                          <td>
                            {' '}
                            {hide(['LOGISTIC']) ? (
                              <span className='badge bg-danger'>N/A</span>
                            ) : (
                              `$${Number(item?.price).toFixed(2)}`
                            )}{' '}
                          </td>
                          <td>
                            {hide(['LOGISTIC']) ? (
                              <span className='badge bg-danger'>N/A</span>
                            ) : (
                              `$${(
                                item?.quantity * Number(item?.price)
                              ).toFixed(2)}`
                            )}
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
                      <td>{data?.other?.grossWeight} KG </td>
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

              <h5 className='fw-bold mt-5'>Containers Details </h5>
              <table className='table table-striped table-borderless mt-2'>
                <tbody>
                  {data?.other?.transportation && (
                    <>
                      <tr>
                        <td className='fw-bold'>Storage Free Gate In</td>
                        <td>
                          {moment(
                            data?.other?.transportation?.storageFreeGateInDate
                          ).format('MMM Do YYYY')}
                        </td>
                      </tr>
                      <tr>
                        <td className='fw-bold'>Shipping Instructions</td>
                        <td>
                          {moment(
                            data?.other?.transportation?.shippingInstructionDate
                          ).format('MMM Do YYYY')}
                        </td>
                      </tr>
                      <tr>
                        <td className='fw-bold'>Customs Declaration & VGM</td>
                        <td>
                          {moment(data?.other?.transportation?.vgmDate).format(
                            'MMM Do YYYY'
                          )}
                        </td>
                      </tr>
                    </>
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
              <button
                disabled={!isPending}
                data-bs-toggle='modal'
                data-bs-target={`#${modalBookingDate}`}
                onClick={editBookingDateHandler}
                className='btn btn-warning w-100 mb-2'
              >
                <span className='float-start'>
                  <FaEdit className='mb-1' />
                </span>
                CHANGE BOOKING DATE
              </button>
            </div>
          </div>
        </div>
        <div
          className='tab-pane fade'
          id='nav-Payments'
          role='tabpanel'
          aria-labelledby='nav-Payments-tab'
          tabIndex='0'
        >
          <div className='row gy-3'>
            <div className='col-md-8 col-12'>
              <label className='mb-3'>How do you want to pay? </label>
              {paymentOptions?.map((p, i) => (
                <div key={i} className='form-check'>
                  <input
                    onChange={(e) => setPayment(e.target.value)}
                    className='form-check-input'
                    type='radio'
                    name={p?.name}
                    value={p?.value}
                    checked={p?.value === payment}
                    id={p?.id}
                  />
                  <label className='form-check-label' htmlFor={p?.id}>
                    {p?.label}
                  </label>
                </div>
              ))}
            </div>
            <div className='col-md-4 col-12'>
              <h6 className='fw-bold'>Other actions</h6>

              <button
                disabled={!isPending}
                onClick={updatePayment}
                className='btn btn-primary w-100 mb-2'
              >
                <span className='float-start'>
                  <FaPaperPlane className='mb-1' />
                </span>
                SUBMIT PAYMENT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tabs
