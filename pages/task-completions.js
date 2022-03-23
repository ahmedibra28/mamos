import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
import { FaFileDownload, FaPenAlt, FaPlus } from 'react-icons/fa'

import useTasks from '../api/tasks'

import { CSVLink } from 'react-csv'

import { inputTextArea } from '../utils/dynamicForm'
import moment from 'moment'
import { useForm } from 'react-hook-form'

const Task = () => {
  const { getTaskByUser, taskCompletion } = useTasks()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
    },
  })

  const { data, isLoading, isError, error } = getTaskByUser

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = taskCompletion

  const [id, setId] = useState(null)

  const formCleanHandler = () => {
    reset()
  }

  useEffect(() => {
    if (isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdate])

  const submitHandler = async (data) => {
    updateMutateAsync({
      _id: id,
      feedback: data.feedback,
    })
  }

  const editHandler = (task) => {
    setId(task._id)
    setValue('feedback', task.feedback)
  }

  const toUpper = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <>
      <Head>
        <title>Task</title>
        <meta property='og:title' content='Task' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Task has been submitted successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

      <div
        className='modal fade'
        id='editTaskModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editTaskModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editTaskModalLabel'>
                Task Submission
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
              {isLoading ? (
                <div className='text-center'>
                  <Loader
                    type='ThreeDots'
                    color='#00BFFF'
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                  />
                </div>
              ) : isError ? (
                <Message variant='danger'>{error}</Message>
              ) : (
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className='row'>
                    {inputTextArea({
                      register,
                      label: 'Feedback',
                      errors,
                      name: 'feedback',
                    })}
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
                      disabled={isLoadingUpdate}
                    >
                      {isLoadingUpdate ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='position-relative'>
        <button
          className='btn btn-primary position-fixed rounded-3 animate__bounceIn'
          style={{
            bottom: '20px',
            right: '25px',
          }}
          data-bs-toggle='modal'
          data-bs-target='#editTaskModal'
        >
          <FaPlus className='mb-1' />
        </button>

        <CSVLink data={data ? data : []} filename='task.csv'>
          <button
            className='btn btn-success position-fixed rounded-3 animate__bounceIn'
            style={{
              bottom: '60px',
              right: '25px',
            }}
          >
            <FaFileDownload className='mb-1' />
          </button>
        </CSVLink>
      </div>

      <div className='row mt-2'>
        <div className='col-md-4 col-6 me-auto'>
          <h3 className='fw-light font-monospace'>Tasks</h3>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <div className='row'>
            {data &&
              data.map((task) => (
                <div key={task._id} className='col-lg-4 col-md-6 col-12'>
                  <div className='card position-relative'>
                    <div className='card-body'>
                      <h5 className='card-title text-center text-uppercase'>
                        {task.name}
                      </h5>
                      <hr />
                      <div className='card-text'>
                        <p>
                          <strong>Assignment: </strong> <br />
                          {task.description}
                        </p>
                        <p>
                          <strong>Feedback: </strong> <br />
                          {task.feedback}
                        </p>
                      </div>
                    </div>
                    <div className='card-footer text-center'>
                      <button className='btn btn-success btn-sm w-100 mb-1'>
                        {task.status}
                      </button>
                      <span className='text-muted'>
                        {moment(task.createdAt).format('lll')}
                      </span>
                    </div>
                    <button
                      className='btn btn-primary btn-sm rounded-pill position-absolute'
                      style={{ top: '-10px', right: '-10px' }}
                      onClick={() => editHandler(task)}
                      data-bs-toggle='modal'
                      data-bs-target='#editTaskModal'
                    >
                      <FaPenAlt />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Task)), {
  ssr: false,
})
