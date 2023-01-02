export const inputText = (args) => {
  const { register, placeholder, errors, name, label, isRequired = true } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, isRequired && { required: `${label} is required` })}
        type='text'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputTel = (args) => {
  const { register, placeholder, errors, name, label, isRequired = true } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, isRequired && { required: `${label} is required` })}
        type='tel'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputTextArea = (args) => {
  const { register, placeholder, errors, name, label, isRequired = true } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <textarea
        rows='5'
        cols='30'
        {...register(name, isRequired && { required: `${label} is required` })}
        type='text'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputNumber = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    label,
    isRequired = true,
    max,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, {
          required: isRequired ? `${label} is required` : null,
          max: max
            ? {
                value: max,
                message: `Your ${label} required to be less than or equal to ${max}`,
              }
            : null,
        })}
        type='number'
        step='0.01'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputEmail = (args) => {
  const { register, placeholder, errors, label, name } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, {
          required: `${label} is required`,
          pattern: {
            value: /\S+@\S+\.+\S+/,
            message: 'Entered value does not match email format',
          },
        })}
        type='email'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputPassword = (args) => {
  const {
    register,
    placeholder,
    errors,
    watch,
    name,
    label,
    validate = false,
    isRequired = true,
    minLength = false,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, {
          required: isRequired ? `${label} is required` : null,
          minLength: minLength
            ? {
                value: 6,
                message: 'Password must have at least 6 characters',
              }
            : null,
          validate: validate
            ? (value) =>
                value === watch().password || 'The passwords do not match'
            : null,
        })}
        type='password'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const dynamicInputSelect = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    label,
    data,
    isRequired = true,
    value,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <select
        {...register(name, isRequired && { required: `${label} is required` })}
        type='text'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      >
        <option value=''>-------</option>
        {data &&
          data.map((d) => (
            <option key={d._id} value={d._id}>
              {name === 'pickUpSeaport' || name === 'dropOffSeaport'
                ? `${d?.name} - ${d?.country?.name}`
                : d[value]}
            </option>
          ))}
      </select>
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const staticInputSelect = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    data,
    label,
    isRequired = true,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <select
        {...register(name, isRequired && { required: `${label} is required` })}
        type='text'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      >
        <option value=''>-------</option>
        {data &&
          data.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
      </select>
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputCheckBox = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    label,
    isRequired = true,
    resetStyle = false,
  } = args

  return (
    <div className={`${!resetStyle && 'mb-3'}`}>
      <div className='form-check form-switch'>
        <input
          className='form-check-input'
          type='checkbox'
          id={name}
          {...register(
            name,
            isRequired && { required: `${label} is required` }
          )}
        />
        <label className='form-check-label' htmlFor={name}>
          {label}
        </label>
      </div>
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputMultipleCheckBox = (args) => {
  const { register, errors, name, data, label, isRequired = true } = args

  return (
    <div className='mb-3'>
      <div className='row g-1 mb-3'>
        {data &&
          data?.map((d) => (
            <div key={d._id} className='col-6'>
              <div className='form-check form-switch'>
                <input
                  {...register(
                    name,
                    isRequired && { required: `${label} is required` }
                  )}
                  className='form-check-input'
                  type='checkbox'
                  value={d._id}
                  id={`flexCheck${d._id}`}
                />
                <label
                  className='form-check-label'
                  htmlFor={`flexCheck${d._id}`}
                >
                  {d.name}
                </label>
              </div>
            </div>
          ))}
      </div>
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputFile = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    isRequired = true,
    label,
    setFile,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, isRequired && { required: `${label} is required` })}
        type='file'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
        id='formFile'
        onChange={(e) => setFile(e.target.files[0])}
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const inputDate = (args) => {
  const { register, placeholder, errors, name, label, isRequired = true } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <input
        {...register(name, isRequired && { required: `${label} is required` })}
        type='date'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const InputAutoCompleteSelect = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    data,
    label,
    isRequired = true,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor='exampleDataList' className='form-label'>
        {label}
      </label>
      <input
        list='datalistOptions'
        autoComplete='off'
        id='exampleDataList'
        {...register(name, isRequired && { required: `${label} is required` })}
        type='text'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      />
      <datalist id='datalistOptions'>
        <option value=''>-------------</option>
        {data &&
          data.map((d) => (
            <option key={d._id} value={`${d.city} - ${d.country}`}>
              {`${d.city} - ${d.country}`}
            </option>
          ))}
      </datalist>

      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}

export const dynamicInputSelectNumber = (args) => {
  const {
    register,
    placeholder,
    errors,
    name,
    label,
    data,
    isRequired = true,
  } = args

  return (
    <div className='mb-3'>
      <label htmlFor={name}>{label}</label>
      <select
        {...register(name, isRequired && { required: `${label} is required` })}
        type='text'
        placeholder={`${placeholder}`}
        className='form-control form-control-lg2'
      >
        <option value=''>-------</option>

        {[...Array(data).keys()].map((num) => (
          <option key={num + 1} value={num + 1}>
            {num + 1}
          </option>
        ))}
      </select>
      {errors && errors[name] && (
        <span className='text-danger'>{errors[name].message}</span>
      )}
    </div>
  )
}
