import { Fragment } from 'react'
import { FaPlusCircle, FaTrash } from 'react-icons/fa'

const TradelaneFormView = ({
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
  inputFields,
  handleInputChange,
  handleAddField,
  handleRemoveField,
}) => {
  const locations = [
    'Ambarli Port Istanbul, TR',
    'Port Said East, EG',
    'Salalah, OM',
    'Turkey, TR',
    'Ambarli Port Istanbul, TR',
    'Izmir Port, TR',
    'Gebze Port of Izmit, TR',
    'Mersin Port, TR',
    'Iskenderum Port, TR',
    'Egypt, EG ',
    'Port Said East, EG',
    'Alexandria Port, EG',
    'Oman, OM',
    'Salalah Port, OM',
    'Saudi Arabia, KSA',
    'King Abdullah Port, KSA',
    'Djibouti, DJ',
    'Djibouti Port, DJ ',
    'Somalia, SO ',
    'Mogdisho Port, SO',
    'Berbera Port, SO',
    'Kenya, KE',
    'Mombasa Port, KE',
  ]

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
                </div>
              ) : (
                form.map((f, i) => <Fragment key={i}>{f}</Fragment>)
              )}

              {inputFields.map((inputField, index) => (
                <div key={index}>
                  <div className='row gx-1 p-2'>
                    <div className='col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        DateTime
                      </label>
                      <input
                        type='datetime-local'
                        className='form-control form-control-sm'
                        placeholder='DateTime'
                        name='dateTime'
                        id='dateTime'
                        value={inputField.dateTime}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>
                    <div className='col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Trade Type
                      </label>
                      <select
                        className='form-control form-control-sm'
                        name='tradeType'
                        id='tradeType'
                        value={inputField.tradeType}
                        onChange={(e) => handleInputChange(e, index)}
                      >
                        <option value=''>Select Trade Type</option>
                        {['Track', 'Ship', 'Train', 'Plane'].map(
                          (type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className='col-md-3 col-6'>
                      <label htmlFor='location' className='form-label'>
                        Location Name
                      </label>
                      <input
                        className='form-control form-control-sm'
                        list='locationList'
                        placeholder='Type to search...'
                        name='location'
                        id='location'
                        value={inputField.location}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <datalist id='locationList'>
                        {locations?.map((l, i) => (
                          <option key={i} value={l}>
                            {l}
                          </option>
                        ))}
                      </datalist>
                    </div>

                    {/* dsfdfdfdkdsnfdsnfds */}
                    {/* <div className='col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Location Name
                      </label>
                      <input
                        type='text'
                        className='form-control form-control-sm'
                        placeholder='Location Name'
                        name='location'
                        id='location'
                        value={inputField.location}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div> */}
                    <div className='col-md-3 col-6'>
                      <label htmlFor='item' className='form-label'>
                        Action Type
                      </label>
                      <select
                        className='form-control form-control-sm'
                        name='actionType'
                        id='actionType'
                        value={inputField.actionType}
                        onChange={(e) => handleInputChange(e, index)}
                      >
                        <option value=''>Select Action Type</option>
                        <option value='Departs At'>Departs At</option>
                        <option value='Arrives At'>Arrives At</option>
                      </select>
                    </div>
                    <div className='col-12'>
                      <button
                        type='button'
                        onClick={() => handleRemoveField(index)}
                        className='btn btn-danger float-end btn-sm mt-1'
                      >
                        <FaTrash className='mb-1' /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className='col-12 text-end'>
                <button
                  onClick={() => handleAddField()}
                  type='button'
                  className='btn btn-primary btn-sm my-2'
                >
                  <FaPlusCircle className='mb-1' /> Add New Event
                </button>
              </div>

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

export default TradelaneFormView
