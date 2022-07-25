import { Spinner } from './Spinner'
import TransportationItem from './TransportationItem'

const TransportationModalForm = ({
  modalSize,
  modal,
  label,
  formCleanHandler,
  isLoading,
  selectedTransportation,
  setSelectedTransportation,
  transportationData,
  isLoadingTransportations,
  submitHandler,
}) => {
  return (
    <div
      className='modal fade'
      id={modal}
      data-bs-backdrop='static'
      data-bs-keyboard='false'
      tabIndex='-1'
      aria-labelledby={`${modal}Label`}
      aria-hidden='true'
    >
      <div className={`modal-dialog ${modalSize}`}>
        <div className='modal-content modal-background'>
          <div className='modal-header'>
            <h3 className='modal-title ' id={`${modal}Label`}>
              {label}
            </h3>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
              onClick={formCleanHandler}
            ></button>
          </div>
          <div className='modal-body'>
            {isLoadingTransportations ? (
              <Spinner />
            ) : (
              <div className='row gy-3'>
                {transportationData?.map((item) => (
                  <div
                    key={item._id}
                    className='col-lg-3 col-md-4 col-sm-6 col-12'
                  >
                    <TransportationItem
                      item={item}
                      setSelectedTransportation={setSelectedTransportation}
                      selectedTransportation={selectedTransportation}
                      setSelectContainer={() => {}}
                      cargoType={item[0]?.cargoType}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary '
                data-bs-dismiss='modal'
                onClick={formCleanHandler}
              >
                Close
              </button>
              <button
                type='button'
                onClick={submitHandler}
                className='btn btn-primary '
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className='spinner-border spinner-border-sm' />
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransportationModalForm
