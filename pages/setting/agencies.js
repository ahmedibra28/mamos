import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useAgenciesHook from '../../utils/api/agencies'
import { Spinner, Pagination, Message, Confirm } from '../../components'
import {
  InputAutoCompleteSelect,
  inputEmail,
  inputPassword,
  inputTel,
  inputText,
  inputTextArea,
  staticInputSelect,
} from '../../utils/dynamicForm'
import TableView from '../../components/TableView'
import FormView from '../../components/FormView'
import { cities } from '../../utils/data'

const Agencies = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const { getAgencies, postAgency, updateAgency, deleteAgency } =
    useAgenciesHook({
      page,
      q,
    })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const { data, isLoading, isError, error, refetch } = getAgencies

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateAgency

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteAgency

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postAgency

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
    header: [
      'Agency Name',
      'Contact Person',
      'Mobile',
      'Email',
      'City',
      'Address',
      'Status',
    ],
    body: [
      'name',
      'contactPerson',
      'mobile',
      'email',
      'city',
      'address',
      'status',
    ],
    // createdAt: 'createdAt',
    data: data,
  }

  const editHandler = (item) => {
    setId(item._id)

    table.body.map((t) => setValue(t, item[t]))
    setEdit(true)
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Agencies List'
  const label = 'Agency'
  const modal = 'town'
  const searchPlaceholder = 'Search by name'

  // FormView
  const formCleanHandler = () => {
    reset(), setEdit(false)
  }

  const submitHandler = (data) => {
    edit
      ? mutateAsyncUpdate({
          _id: id,
          name: data.name,
          contactPerson: data.contactPerson,
          mobile: data.mobile,
          email: data.email,
          address: data.address,
          city: data.city,
          status: data.status,
        })
      : mutateAsyncPost(data)
  }

  const form = [
    inputText({
      register,
      errors,
      label: 'Agency Name',
      name: 'name',
      placeholder: 'Enter agency name',
    }),
    inputText({
      register,
      errors,
      label: 'Contact Person',
      name: 'contactPerson',
      placeholder: 'Enter contact person name',
    }),
    inputTel({
      register,
      errors,
      label: 'Mobile',
      name: 'mobile',
      placeholder: 'Enter mobile',
    }),
    inputEmail({
      register,
      errors,
      label: 'Email',
      name: 'email',
      placeholder: 'Enter email',
    }),
    InputAutoCompleteSelect({
      register,
      errors,
      label: 'City',
      name: 'city',
      placeholder: 'Select city',
      data: cities,
    }),
    staticInputSelect({
      register,
      errors,
      label: 'Status',
      name: 'status',
      placeholder: 'Select status',
      data: [{ name: 'active' }, { name: 'inactive' }],
    }),
    inputTextArea({
      register,
      errors,
      label: 'Address',
      name: 'address',
      placeholder: 'Enter address',
    }),

    !edit && '',
    !edit && <hr key='01' />,
    !edit && <hr key='02' />,
    !edit && (
      <h4 key='03' className='font-monospace text-primary'>
        Agency Access Credentials
      </h4>
    ),
    !edit && '',
    !edit &&
      inputEmail({
        register,
        errors,
        label: 'Auth Email',
        name: 'authEmail',
        placeholder: 'Enter auth email address',
      }),
    !edit &&
      inputPassword({
        register,
        errors,
        label: 'Auth Password',
        name: 'authPassword',
        placeholder: 'Enter auth password',
        isRequired: false,
      }),
  ]

  const row = true
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-lg'

  return (
    <>
      <Head>
        <title>Agencies</title>
        <meta property='og:title' content='Agencies' key='title' />
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

export default dynamic(() => Promise.resolve(withAuth(Agencies)), {
  ssr: false,
})
