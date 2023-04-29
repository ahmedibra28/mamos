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
  selectedTransportation,
  selectContainer,
  removeContainer,
  addContainer,

  inputFields,
  handleInputChange,
  handleAddField,
  handleRemoveField,

  commoditiesData,
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
                  {selectedTransportation?.cargo === 'FCL' && (
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
                                &{' '}
                                {container?.container?.details?.CBM?.toFixed(2)}{' '}
                                M<sup>3</sup>
                              </div>
                              <div className='text-center'>
                                <button
                                  disabled={
                                    !selectContainer.find(
                                      (c) =>
                                        c?.container?._id ===
                                        container?.container?._id
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
                                      c?.container?._id ===
                                        container?.container?._id && c.quantity
                                  )}
                                  {!selectContainer.find(
                                    (c) =>
                                      c?.container?._id ===
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
                  )}
                </div>
              ) : (
                form.map((f, i) => <Fragment key={i}>{f}</Fragment>)
              )}

              {selectedTransportation?.cargo === 'LCL' && (
                <div className='bg-light p-3 my-3'>
                  <div className='row gx-2 my-2'>
                    {selectedTransportation && (
                      <div className='row gx-2 my-2'>
                        <div className='col-12'>
                          <h4 className='fw-bold font-monospace'>
                            Cargo Details
                          </h4>
                          <label>Tell us a bit more about your cargo.</label>

                          {inputFields?.map((inputField, index) => (
                            <div key={index}>
                              <h6 className='font-monospace'>{`Package #${
                                index + 1
                              }`}</h6>
                              <div className='row gx-1 p-2'>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Package Quantity
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Package quantity'
                                    name='qty'
                                    id='qty'
                                    value={inputField.qty}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    P. Unit
                                  </label>
                                  <select
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Unit'
                                    name='packageUnit'
                                    id='packageUnit'
                                    value={inputField.packageUnit}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  >
                                    <option value='boxes'>Boxes</option>
                                    <option value='pieces'>Pieces</option>
                                    <option value='pallets'>Pallets</option>
                                    <option value='bags'>Bags</option>
                                  </select>
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Weight as KG
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Weight'
                                    name='weight'
                                    id='weight'
                                    value={inputField.weight}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Commodity
                                  </label>
                                  <select
                                    className='form-control form-control-sm'
                                    placeholder='Commodity'
                                    name='commodity'
                                    id='commodity'
                                    value={inputField.commodity}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
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

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    CBM Unit
                                  </label>
                                  <select
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Unit'
                                    name='unit'
                                    id='unit'
                                    value={inputField.unit}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  >
                                    <option value='cm'>CM</option>
                                  </select>
                                </div>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Length
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Length'
                                    name='length'
                                    id='length'
                                    value={inputField.length}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Width
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Width'
                                    name='width'
                                    id='width'
                                    value={inputField.width}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Height
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Height'
                                    name='height'
                                    id='height'
                                    value={inputField.height}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>
                                <div className='col-12 mt-3'></div>
                                <div className='col-md-4 col-12'>
                                  <button
                                    type='button'
                                    className='btn btn-light btn-sm form-control form control-sm'
                                  >
                                    Total Weight:{' '}
                                    {inputField.qty * inputField.weight} KG
                                  </button>
                                </div>
                                <div className='col-md-4 col-12'>
                                  <button
                                    type='button'
                                    className='btn btn-light btn-sm form-control form control-sm'
                                  >
                                    CBM:{' '}
                                    {(inputField.length *
                                      inputField.width *
                                      inputField.height *
                                      inputField.qty) /
                                      1000000}{' '}
                                    M<sup>3</sup>
                                  </button>
                                </div>
                                <div className='col-md-4 col-12'>
                                  <button
                                    type='button'
                                    onClick={() => handleRemoveField(index)}
                                    className='btn btn-danger btn-sm form-control form-control-sm'
                                  >
                                    <FaTrash className='mb-1' /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='text-center my-3'>
                      <button
                        onClick={() => handleAddField()}
                        type='button'
                        className='btn btn-primary btn-sm my-2'
                      >
                        <FaPlusCircle className='mb-1' /> Add New Package
                      </button>
                    </div>
                  </div>
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
