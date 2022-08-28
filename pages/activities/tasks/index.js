import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useTasksHook from '../../../utils/api/tasks'
import useUsersHook from '../../../utils/api/users'
import { Spinner, Pagination, Message, Confirm } from '../../../components'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputText,
  inputTextArea,
  staticInputSelect,
} from '../../../utils/dynamicForm'
import TableView from '../../../components/TableView'
import FormView from '../../../components/FormView'
import { FaEdit, FaPenAlt, FaSearch, FaTimesCircle } from 'react-icons/fa'

const Tasks = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const { getTasks, postTask, updateTask, deleteTask } = useTasksHook({
    page,
    q,
  })
  const { getUsers } = useUsersHook({
    page: 1,
    limit: 10000000,
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

  const { data, isLoading, isError, error, refetch } = getTasks
  const { data: usersData } = getUsers

  const userInfo =
    typeof window !== 'undefined' && localStorage.getItem('userInfo')
      ? JSON?.parse(
          typeof window !== 'undefined' && localStorage.getItem('userInfo')
        )
      : null

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateTask

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteTask

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postTask

  useEffect(() => {
    if (isSuccessPost || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessPost, isSuccessUpdate])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const searchHandler = (e) => {
    e.preventDefault()
    refetch()
    setPage(1)
  }

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

    setValue('task', item?.task)
    setValue('employee', item?.employee?._id)
    setEdit(true)
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Tasks List'
  const label = 'Task'
  const modal = 'task'
  const searchPlaceholder = 'Search by email'

  // FormView
  const formCleanHandler = () => {
    reset(), setEdit(false)
  }

  const submitHandler = (data) => {
    edit
      ? mutateAsyncUpdate({
          _id: id,
          employee: data.employee,
          task: data.task,
        })
      : mutateAsyncPost(data)
  }

  const form = [
    dynamicInputSelect({
      register,
      errors,
      label: 'Employee',
      name: 'employee',
      placeholder: 'Select a employee',
      value: 'name',
      data: usersData?.data?.filter(
        (user) => user?._id !== userInfo?._id && !user.blocked
      ),
    }),

    inputTextArea({
      register,
      errors,
      label: 'Task',
      name: 'task',
      placeholder: 'Task',
    }),
  ]

  const row = false
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Tasks</title>
        <meta property='og:title' content='Tasks' key='title' />
      </Head>

      {isSuccessDelete && (
        <Message variant='success'>
          {label} has been cancelled successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {isSuccessUpdate && (
        <Message variant='success'>
          {label} has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessPost && (
        <Message variant='success'>
          {label} has been Created successfully.
        </Message>
      )}
      {isErrorPost && <Message variant='danger'>{errorPost}</Message>}

      <div className='ms-auto text-end'>
        <Pagination data={table.data} setPage={setPage} />
      </div>

      <FormView
        edit={edit}
        formCleanHandler={formCleanHandler}
        form={form}
        watch={watch}
        isLoadingUpdate={isLoadingUpdate}
        isLoadingPost={isLoadingPost}
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
            <button
              className='btn btn-outline-primary btn-sm shadow my-2'
              data-bs-toggle='modal'
              data-bs-target={`#${modal}`}
            >
              Add New {label}
            </button>
            <form onSubmit={searchHandler}>
              <div className='input-group'>
                <select
                  name='q'
                  onChange={(e) => setQ(e.target.value)}
                  className='form-control'
                >
                  <option value=''>-------------</option>
                  {usersData?.data?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user?.name}
                    </option>
                  ))}
                </select>
                <div className='input-group-append'>
                  <button type='submit' className='btn btn-outline-secondary'>
                    <FaSearch />
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className='row gy-3'>
            {table?.data?.data?.map((task) => (
              <div key={task._id} className='col-lg-6 col-12'>
                <div className='card'>
                  <div className='card-body d-flex justify-content-between align-items-center'>
                    <div>
                      <h5 className='card-title'>{task?.employee?.name}</h5>
                      <div className='card-text'>
                        <p>
                          <span className='fw-bold'> Comment: </span>{' '}
                          {task?.task}
                        </p>
                        {task?.response && (
                          <p>
                            <span className='fw-bold'> Response: </span>
                            {task?.task}
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
                      <br />
                      <button
                        onClick={() => deleteHandler(task?._id)}
                        disabled={isLoadingDelete}
                        className='btn btn-danger btn-sm rounded-pill mt-1'
                      >
                        {isLoadingDelete ? (
                          <span className='spinner-border spinner-border-sm' />
                        ) : (
                          <span>
                            <FaTimesCircle />
                          </span>
                        )}
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

export default dynamic(() => Promise.resolve(withAuth(Tasks)), {
  ssr: false,
})
