import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useTradelanesHook from '../../utils/api/tradelanes'
import useTransportationsHook from '../../utils/api/transportations'
import { Spinner, Pagination, Message, Confirm } from '../../components'
import { dynamicInputSelect, staticInputSelect } from '../../utils/dynamicForm'
import TableView from '../../components/TableView'
import TradelaneFormView from '../../components/TradelaneFormView'
import moment from 'moment'

const Tradelanes = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')
  const [inputFields, setInputFields] = useState([
    {
      dateTime: '',
      tradeType: '',
      actionType: '',
      location: '',
      description: '',
    },
  ])

  const { getTradelanes, postTradelane, updateTradelane, deleteTradelane } =
    useTradelanesHook({
      page,
      q,
    })
  const { getTransportations } = useTransportationsHook({
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
    defaultValues: {},
  })

  const { data, isLoading, isError, error, refetch } = getTradelanes
  const { data: transportationsData } = getTransportations

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateTradelane

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteTradelane

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postTradelane

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
    header: ['Transportation', 'Reference', 'Status'],
    body: ['transportation.name', 'transportation.reference', 'status'],
    createdAt: 'createdAt',
    data: data,
  }

  const editHandler = (item) => {
    setId(item._id)

    table.body.map((t) => setValue(t, item[t]))
    setValue('transportation', item?.transportation?._id)
    setInputFields(
      item.tradelane
        ? item.tradelane.map((fields) => ({
            dateTime: moment(fields.dateTime).format('YYYY-MM-DDTHH:mm:ss'),
            tradeType: fields.tradeType,
            actionType: fields.actionType,
            location: fields.location,
            description: fields.description,
          }))
        : [
            {
              dateTime: '',
              tradeType: '',
              actionType: '',
              location: '',
              description: '',
            },
          ]
    )

    setEdit(true)
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Tradelanes List'
  const label = 'Tradelane'
  const modal = 'tradelane'
  const searchPlaceholder = 'Search by shipper name'

  // TradelaneFormView
  const formCleanHandler = () => {
    reset()
    setEdit(false)
    setInputFields([
      {
        dateTime: '',
        tradeType: '',
        actionType: '',
        location: '',
        description: '',
      },
    ])
  }

  const submitHandler = (data) => {
    edit
      ? mutateAsyncUpdate({
          _id: id,
          transportation: data.transportation,
          tradelane: inputFields,
          status: data.status,
        })
      : mutateAsyncPost({ ...data, tradelane: inputFields })
  }

  const form = [
    dynamicInputSelect({
      register,
      errors,
      label: 'Transportation',
      name: 'transportation',
      placeholder: 'Select transportation',
      data: transportationsData?.data?.filter(
        (item) => item.status === 'active'
      ),
      value: 'reference',
    }),

    staticInputSelect({
      register,
      errors,
      label: 'Status',
      name: 'status',
      placeholder: 'Select status',
      data: [{ name: 'active' }, { name: 'inactive' }],
    }),
  ]

  const row = true
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-lg'

  // dynamic input fields
  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        dateTime: '',
        tradeType: '',
        actionType: '',
        location: '',
        description: '',
      },
    ])
  }

  const handleRemoveField = (index) => {
    const list = [...inputFields]
    list.splice(index, 1)
    setInputFields(list)
  }

  const handleInputChange = (e, index) => {
    const { name, value } = e.target
    const old = inputFields[index]
    const updated = { ...old, [name]: value }
    var list = [...inputFields]
    list[index] = updated
    setInputFields(list)
  }

  return (
    <>
      <Head>
        <title>Tradelanes</title>
        <meta property='og:title' content='Tradelanes' key='title' />
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

      <TradelaneFormView
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
        inputFields={inputFields}
        handleInputChange={handleInputChange}
        handleAddField={handleAddField}
        handleRemoveField={handleRemoveField}
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

export default dynamic(() => Promise.resolve(withAuth(Tradelanes)), {
  ssr: false,
})
