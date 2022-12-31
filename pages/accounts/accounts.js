import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useAccountsHook from '../../utils/api/accounts'
import useAccountTypesHook from '../../utils/api/accountTypes'
import { Spinner, Pagination, Message, Confirm } from '../../components'
import {
  dynamicInputSelect,
  inputNumber,
  inputText,
  inputTextArea,
  staticInputSelect,
} from '../../utils/dynamicForm'
import TableView from '../../components/TableView'
import FormView from '../../components/FormView'

const Account = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const { getAccounts, postAccount, updateAccount, deleteAccount } =
    useAccountsHook({
      page,
      q,
    })

  const { getAccountTypes } = useAccountTypesHook({
    page,
    q,
    limit: 100,
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
      confirmed: true,
      blocked: false,
    },
  })

  const { data, isLoading, isError, error, refetch } = getAccounts
  const { data: accountTypeData } = getAccountTypes

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateAccount

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteAccount

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postAccount

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
    header: ['Account No', 'Name', 'Account Type', 'Opening Balance', 'Status'],
    body: ['accNo', 'name', 'accountType.name', 'openingBalance', 'status'],
    data: data,
  }

  const editHandler = (item) => {
    setId(item._id)

    table.body.map((t) => setValue(t, item[t]))
    setValue('description', item?.description)
    setValue('accountType', item?.accountType?._id)
    setEdit(true)
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Account List'
  const label = 'Account '
  const modal = 'account'
  const searchPlaceholder = 'Search by name'

  // FormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
  }

  const submitHandler = (data) => {
    edit
      ? mutateAsyncUpdate({
          _id: id,
          ...data
        })
      : mutateAsyncPost(data)
  }

  const form = [
    inputNumber({
      register,
      errors,
      label: 'Account No',
      name: 'accNo',
      placeholder: 'Enter account no',
    }),
    inputText({
      register,
      errors,
      label: 'Name',
      name: 'name',
      placeholder: 'Enter name',
    }),
    dynamicInputSelect({
      register,
      errors,
      label: 'Account Type',
      name: 'accountType',
      placeholder: 'Select account type',
      value: 'name',
      data: accountTypeData?.data?.filter((acc) => acc.status === 'active'),
    }),
    inputNumber({
      register,
      errors,
      label: 'Opening Balance',
      name: 'openingBalance',
      placeholder: 'Enter opening balance',
    }),
    inputTextArea({
      register,
      errors,
      label: 'Description',
      name: 'description',
      placeholder: 'Enter description',
      isRequired: false,
    }),
    staticInputSelect({
      register,
      errors,
      label: 'Status',
      name: 'status',
      placeholder: 'Enter status',
      data: [{ name: 'active' }, { name: 'inactive' }],
    }),
  ]

  const row = true
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-xl'

  return (
    <>
      <Head>
        <title>Accounts</title>
        <meta property='og:title' content='Accounts' key='title' />
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

export default dynamic(() => Promise.resolve(withAuth(Account)), {
  ssr: false,
})
