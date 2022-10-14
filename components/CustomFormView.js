import { Fragment } from 'react'
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa'

const CustomFormView = ({
  edit,
  formCleanHandler,
  form,
  isLoadingUpdate,
  isLoadingPost,
  handleSubmit,
  submitHandler,
  modal,
  label,
  column,
  row,
  modalSize,
  selectedTransportation,
  selectContainer,
  removeContainer,
  addContainer,
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
              {edit ? `Edit ${label}` : `Post ${label}`}
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
            <form onSubmit={handleSubmit(submitHandler)}>
              {row ? (
                <div className='row'>
                  {form.map((f, i) => (
                    <div key={i} className={column}>
                      {f}
                    </div>
                  ))}
                  <div className='row mt-3 gy-3'>
                    {selectedTransportation?.container?.map((container) => (
                      <div
                        key={container?.container._id}
                        className='col-md-6 col-12'
                      >
                        <div className='card border-0 shadow-sm'>
                          <div className='card-body text-center'>
                            <div className=''>
                              {container?.container?.name} - Fits up to{' '}
                              {container?.container?.details?.seaFreight?.toFixed(
                                2
                              )}{' '}
                              & {container?.container?.details?.CBM?.toFixed(2)}{' '}
                              M<sup>3</sup>
                            </div>
                            <div className='text-center'>
                              <button
                                disabled={
                                  !selectContainer.find(
                                    (c) =>
                                      c?.container._id ===
                                      container?.container._id
                                  )
                                }
                                onClick={() => removeContainer(container)}
                                type='button'
                                className='btn btn-danger btn-sm'
                              >
                                <FaMinusCircle className='mb-1' />
                              </button>

                              <button
                                type='button'
                                className='btn btn-light btn-sm'
                              >
                                {selectContainer.map(
                                  (c) =>
                                    c?.container._id ===
                                      container?.container._id && c.quantity
                                )}
                                {!selectContainer.find(
                                  (c) =>
                                    c?.container._id ===
                                    container?.container?._id
                                ) && 0}
                              </button>

                              <button
                                onClick={() => addContainer(container)}
                                type='button'
                                className='btn btn-success btn-sm'
                              >
                                <FaPlusCircle className='mb-1' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                form.map((f, i) => <Fragment key={i}>{f}</Fragment>)
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
                  type='submit'
                  className='btn btn-primary '
                  disabled={isLoadingPost || isLoadingUpdate}
                >
                  {isLoadingPost || isLoadingUpdate ? (
                    <span className='spinner-border spinner-border-sm' />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomFormView
