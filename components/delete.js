import { Fragment } from 'react'
import { FaMinusCircle, FaPlusCircle, FaTrash } from 'react-icons/fa'

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

  handleInputChange,
  inputFields,
  handleRemoveField,
  handleAddField,
  commoditiesData,
  AVAILABLE_CBM,
  DEFAULT_CAPACITY,
  USED_CBM,
  selectedTransportation,
  cargo,
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
                  {cargo === 'FCL' ? (
                    <div className='row mt-3 gy-3'>
                      {selectedTransportation?.container?.map((container) => (
                        <div
                          key={container?.container._id}
                          className='col-lg-4 col-md-6 col-12'
                        >
                          <div className='card border-0 shadow-sm'>
                            <div className='card-body text-center'>
                              <div className=''>
                                {container?.container?.name} - Fits up to{' '}
                                {container?.container?.details?.seaFreight?.toFixed(
                                  2
                                )}{' '}
                                & {container?.container?.details?.CBM} M
                                <sup>3</sup>
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
                  ) : (
                    <>
                      <div className='col-12'>
                        <div className='progress ' style={{ height: '20px' }}>
                          <div
                            className={`progress-bar bg-warning ${
                              (USED_CBM * 100) / DEFAULT_CAPACITY > 90 &&
                              'bg-danger'
                            }`}
                            role='progressbar'
                            style={{
                              width: `${(USED_CBM * 100) / DEFAULT_CAPACITY}%`,
                            }}
                            aria-valuenow={(USED_CBM * 100) / DEFAULT_CAPACITY}
                            aria-valuemin='0'
                            aria-valuemax={DEFAULT_CAPACITY}
                          >
                            {`${((USED_CBM * 100) / DEFAULT_CAPACITY).toFixed(
                              2
                            )}%`}
                          </div>
                        </div>
                      </div>
                      <div className='col-12'>
                        <p className='text-danger text-center'>
                          {AVAILABLE_CBM < 0 &&
                            `You have exceeded the maximum available CBM `}
                        </p>
                      </div>

                      {inputFields.map((inputField, index) => (
                        <div key={index} className='mt-3'>
                          <h6 className='font-monospace'>{`Package #${
                            index + 1
                          }`}</h6>
                          <div className='row gy-3'>
                            <div className='col-lg-2 col-md-3 col-6'>
                              <label htmlFor='item' className='form-label'>
                                Package Qty
                              </label>
                              <input
                                type='number'
                                min={0}
                                className='form-control '
                                placeholder='Package quantity'
                                name='qty'
                                id='qty'
                                value={inputField.qty}
                                required
                                onChange={(e) => handleInputChange(e, index)}
                              />
                            </div>

                            <div className='col-lg-2 col-md-3 col-6'>
                              <label htmlFor='item' className='form-label'>
                                Commodity
                              </label>
                              <select
                                className='form-control '
                                placeholder='Commodity'
                                name='commodity'
                                id='commodity'
                                value={inputField.commodity}
                                required
                                onChange={(e) => handleInputChange(e, index)}
                              >
                                <option value=''>-------</option>
                                {commoditiesData?.data?.map(
                                  (c) =>
                                    c.status === 'Active' && (
                                      <option value={c._id} key={c._id}>
                                        {c.name}
                                      </option>
                                    )
                                )}
                              </select>
                            </div>

                            <div className='col-lg-2 col-md-3 col-6'>
                              <label htmlFor='item' className='form-label'>
                                Length (cm)
                              </label>
                              <input
                                type='number'
                                min={0}
                                className='form-control '
                                placeholder='Length'
                                name='length'
                                id='length'
                                value={inputField.length}
                                onChange={(e) => handleInputChange(e, index)}
                              />
                            </div>

                            <div className='col-lg-2 col-md-3 col-6'>
                              <label htmlFor='item' className='form-label'>
                                Width (cm)
                              </label>
                              <input
                                type='number'
                                min={0}
                                className='form-control '
                                placeholder='Width'
                                name='width'
                                id='width'
                                value={inputField.width}
                                onChange={(e) => handleInputChange(e, index)}
                              />
                            </div>
                            <div className='col-lg-2 col-md-3 col-6'>
                              <label htmlFor='item' className='form-label'>
                                Height (cm)
                              </label>
                              <input
                                type='number'
                                min={0}
                                className='form-control '
                                placeholder='Height'
                                name='height'
                                id='height'
                                value={inputField.height}
                                onChange={(e) => handleInputChange(e, index)}
                              />
                            </div>

                            <div className='col-lg-2 col-md-3 col-6 mb-0 my-auto text-end'>
                              <button
                                type='button'
                                onClick={() => handleRemoveField(index)}
                                className='btn btn-danger'
                              >
                                <FaTrash className='mb-1' /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className='text-end mt-3'>
                        <button
                          onClick={() => handleAddField()}
                          type='button'
                          className='btn btn-primary'
                        >
                          <FaPlusCircle className='mb-1' /> Add Package
                        </button>
                      </div>
                    </>
                  )}
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
