import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { useForm } from 'react-hook-form'
import useTasksHook from '../../../utils/api/tasks'
import { Spinner, Pagination, Message } from '../../../components'
import { inputTextArea } from '../../../utils/dynamicForm'
import FormView from '../../../components/FormView'
import { FaPenAlt } from 'react-icons/fa'

const Employees = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)

  const { getTasksByEmployee, updateTaskByEmployee } = useTasksHook({
    page,
    q: '',
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      auth: true,
    },
  })

  const { data, isLoading, isError, error, refetch } = getTasksByEmployee

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateTaskByEmployee

  useEffect(() => {
    if (isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdate])

  // TableView
  const table = {
    header: ['Name', 'Method', 'Route'],
    body: ['name', 'method', 'route'],
    createdAt: 'createdAt',
    auth: 'auth',
    data: data,
  }

  const editHandler = (item) => {
    setId(item._id)

    setValue('response', item?.response)
    setEdit(true)
  }

  const name = 'Tasks List'
  const label = 'Task'
  const modal = 'task'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data) => {
    edit &&
      mutateAsyncUpdate({
        _id: id,
        response: data.response,
      })
  }

  const form = [
    inputTextArea({
      register,
      errors,
      label: 'Response',
      name: 'response',
      placeholder: 'Response',
    }),
  ]

  const row = false
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Tasks By Employee</title>
        <meta property='og:title' content='Tasks By Employee' key='title' />
      </Head>

      {isSuccessUpdate && (
        <Message variant='success'>
          {label} has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

      <div className='ms-auto text-end'>
        <Pagination data={table.data} setPage={setPage} />
      </div>

      <FormView
        edit={edit}
        formCleanHandler={formCleanHandler}
        form={form}
        watch={watch}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={false}
        handleSubmit={handleSubmit}
        submitHandler={submitHandler}
        modal={modal}
        label={label}
        column={column}
        row={row}
        modalSize={modalSize}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className='bg-light p-3 mt-2'>
          <div className='d-flex align-items-center flex-column mb-2'>
            <h3 className='fw-light text-muted'>
              {name}
              <sup className='fs-6'> [{table.data && table.data.total}] </sup>
            </h3>
          </div>

          {table?.data?.total === 0 && (
            <div className='border border-danger text-center p-3'>
              Sorry No Tasks Available for this time.
            </div>
          )}

          <div className='row gy-3'>
            {table?.data?.data?.map((task) => (
              <div key={task._id} className='col-lg-6 col-12'>
                <div className='card'>
                  <div className='card-body d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='card-title'>
                        Sender:
                        <span className='fw-bold'>
                          {' '}
                          {task?.createdBy?.name}
                        </span>
                      </h6>
                      <h6 className='card-title'>
                        Receiver:
                        <span className='fw-bold'> {task?.employee?.name}</span>
                      </h6>
                      <div className='card-text font-monospace'>
                        <p>
                          <span className='fw-bold'> Comment: </span>{' '}
                          {task?.task}
                        </p>
                        {task?.response && (
                          <p>
                            <span className='fw-bold'> Response: </span>
                            {task?.response}
                          </p>
                        )}
                        <div
                          className={`badge bg-${
                            task?.status === 'pending' ? 'warning' : 'success'
                          }`}
                        >
                          {task?.status?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        className='btn btn-primary btn-sm rounded-pill'
                        onClick={() => editHandler(task)}
                        data-bs-toggle='modal'
                        data-bs-target={`#${modal}`}
                      >
                        <FaPenAlt />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Employees)), {
  ssr: false,
})
