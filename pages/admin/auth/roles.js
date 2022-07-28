import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useRolesHook from '../../../utils/api/roles'
import { Spinner, Pagination, Message, Confirm } from '../../../components'
import {
  inputMultipleCheckBox,
  inputText,
  inputTextArea,
} from '../../../utils/dynamicForm'
import TableView from '../../../components/TableView'
import FormView from '../../../components/FormView'
import usePermissionsHook from '../../../utils/api/permissions'
import useClientPermissionsHook from '../../../utils/api/clientPermissions'

const Roles = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const { getRoles, postRole, updateRole, deleteRole } = useRolesHook({
    page,
    q,
  })

  const { getPermissions } = usePermissionsHook({
    limit: 1000000,
  })
  const { getClientPermissions } = useClientPermissionsHook({
    limit: 1000000,
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

  const { data, isLoading, isError, error, refetch } = getRoles
  const { data: permissionData } = getPermissions
  const { data: clientPermissionData } = getClientPermissions

  const uniquePermissions = [
    ...new Set(permissionData?.data?.map((item) => item.name)),
  ]?.map((group) => ({
    [group]: permissionData?.data?.filter(
      (permission) => permission?.name === group
    ),
  }))

  const uniqueClientPermissions = [
    ...new Set(clientPermissionData?.data?.map((item) => item.menu)),
  ]?.map((group) => ({
    [group]: clientPermissionData?.data?.filter(
      (clientPermission) => clientPermission?.menu === group
    ),
  }))

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateRole

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteRole

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postRole

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
    header: ['Name', 'Type', 'Description'],
    body: ['name', 'type', 'description'],
    createdAt: 'createdAt',
    data: data,
  }

  const editHandler = (item) => {
    setId(item._id)

    table.body.map((t) => setValue(t, item[t]))
    setEdit(true)

    const permission = [...new Set(item.permission?.map((item) => item.name))]
      ?.map((group) => ({
        [group]: item?.permission?.filter(
          (permission) => permission?.name === group
        ),
      }))
      ?.map((per) => {
        setValue(
          `permission-${Object.keys(per)[0]}`,
          Object.values(per)[0]?.map((per) => per?._id)
        )
      })

    const clientPermission = [
      ...new Set(item.clientPermission?.map((item) => item.menu)),
    ]
      ?.map((group) => ({
        [group]: item?.clientPermission?.filter(
          (clientPermission) => clientPermission?.menu === group
        ),
      }))
      ?.map((per) => {
        setValue(
          `clientPermission-${Object.keys(per)[0]}`,
          Object.values(per)[0]?.map((per) => per?._id)
        )
      })
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Roles List'
  const label = 'Role'
  const modal = 'role'
  const searchPlaceholder = 'Search by name'

  // FormView
  const formCleanHandler = () => {
    reset(), setEdit(false)
  }

  const submitHandler = (data) => {
    const permission = Object.keys(data)
      .filter((key) => key.startsWith('permission-'))
      ?.map((key) => data[key])
      ?.filter((value) => value)
      ?.join(',')
      .split(',')

    const clientPermission = Object.keys(data)
      .filter((key) => key.startsWith('clientPermission-'))
      ?.map((key) => data[key])
      ?.filter((value) => value)
      ?.join(',')
      .split(',')

    edit
      ? mutateAsyncUpdate({
          _id: id,
          name: data.name,
          permission,
          clientPermission,
          description: data.description,
        })
      : mutateAsyncPost({
          _id: id,
          name: data.name,
          permission,
          clientPermission,
          description: data.description,
        })
  }

  const form = [
    inputText({
      register,
      errors,
      label: 'Name',
      name: 'name',
      placeholder: 'Enter name',
    }),

    uniquePermissions?.length > 0 &&
      uniquePermissions?.map((g, i) => (
        <div key={i} className='mb-1'>
          <label className='fw-bold text-uppercase'>
            {uniquePermissions?.length > 0 && Object.keys(g)[0]}
          </label>

          {inputMultipleCheckBox({
            register,
            errors,
            label: `${uniquePermissions?.length > 0 && Object.keys(g)[0]}`,
            name: `permission-${
              uniquePermissions?.length > 0 && Object.keys(g)[0]
            }`,
            placeholder: `${
              uniquePermissions?.length > 0 && Object.keys(g)[0]
            }`,
            data:
              uniquePermissions?.length > 0 &&
              Object.values(g)[0]?.map((item) => ({
                name: `${item.method} - ${item.description}`,
                _id: item._id,
              })),
            isRequired: false,
          })}
        </div>
      )),

    inputTextArea({
      register,
      errors,
      label: 'Description',
      name: 'description',
      placeholder: 'Description',
    }),

    uniqueClientPermissions?.length > 0 &&
      uniqueClientPermissions?.map((g, i) => (
        <div key={i} className='mb-1'>
          <label className='fw-bold text-uppercase'>
            {uniqueClientPermissions?.length > 0 && Object.keys(g)[0]}
          </label>

          {inputMultipleCheckBox({
            register,
            errors,
            label: `${
              uniqueClientPermissions?.length > 0 && Object.keys(g)[0]
            }`,
            name: `clientPermission-${
              uniqueClientPermissions?.length > 0 && Object.keys(g)[0]
            }`,
            placeholder: `${
              uniqueClientPermissions?.length > 0 && Object.keys(g)[0]
            }`,
            data:
              uniqueClientPermissions?.length > 0 &&
              Object.values(g)[0]?.map((item) => ({
                name: `${item.menu} - ${item.path}`,
                _id: item._id,
              })),
            isRequired: false,
          })}
        </div>
      )),
  ]

  const row = false
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-lg'

  return (
    <>
      <Head>
        <title>Roles</title>
        <meta property='og:title' content='Roles' key='title' />
      </Head>

      {isSuccessDelete && (
        <Message variant='success'>
          {label} has been deleted successfully.
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
        <TableView
          table={table}
          editHandler={editHandler}
          deleteHandler={deleteHandler}
          searchHandler={searchHandler}
          isLoadingDelete={isLoadingDelete}
          name={name}
          label={label}
          modal={modal}
          setQ={setQ}
          q={q}
          searchPlaceholder={searchPlaceholder}
          searchInput={true}
          addBtn={true}
        />
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Roles)), {
  ssr: false,
})
