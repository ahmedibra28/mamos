import React from 'react'
import useNoticesHook from '../utils/api/notices'

const Notice = () => {
  const notice = useNoticesHook({
    page: 1,
    q: '',
  })
  const { data, isLoading } = notice?.getNotices

  const object = !isLoading && data?.data[0]

  if (isLoading) return <div></div>

  if (!isLoading && object && data && object.status === 'Active') {
    return (
      <div
        className='alert alert-warning bg-warning alert-dismissible fade show m-0 border-0 rounded-0 text-center'
        role='alert'
      >
        {object.description || ''}
        <button
          type='button'
          className='btn-close'
          data-bs-dismiss='alert'
          aria-label='Close'
        ></button>
      </div>
    )
  } else {
    return <div></div>
  }
}

export default Notice
