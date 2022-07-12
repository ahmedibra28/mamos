import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import { confirmAlert } from 'react-confirm-alert'
import { useForm } from 'react-hook-form'
import useTownsHook from '../../utils/api/towns'
import useCountriesHook from '../../utils/api/countries'
import useAirportsHook from '../../utils/api/airports'
import useSeaportsHook from '../../utils/api/seaports'
import { Spinner, Pagination, Message, Confirm } from '../../components'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputNumber,
  inputText,
  staticInputSelect,
} from '../../utils/dynamicForm'
import TableView from '../../components/TableView'
import FormView from '../../components/FormView'

const Towns = () => {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [q, setQ] = useState('')

  const { getTowns, postTown, updateTown, deleteTown } = useTownsHook({
    page,
    q,
  })
  const { getCountries } = useCountriesHook({
    limit: 100,
  })
  const { getAirports } = useAirportsHook({
    limit: 1000,
  })
  const { getSeaports } = useSeaportsHook({
    limit: 1000,
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
      isPort: false,
    },
  })

  const { data, isLoading, isError, error, refetch } = getTowns
  const { data: countriesData } = getCountries
  const { data: airportsData } = getAirports
  const { data: seaportsData } = getSeaports

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: mutateAsyncUpdate,
  } = updateTown

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: mutateAsyncDelete,
  } = deleteTown

  const {
    isLoading: isLoadingPost,
    isError: isErrorPost,
    error: errorPost,
    isSuccess: isSuccessPost,
    mutateAsync: mutateAsyncPost,
  } = postTown

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
      'Country',
      'Town',
      'Airport',
      'Seaport',
      'Cost',
      'Price',
      'Status',
    ],
    body: [
      'country.name',
      'name',
      'airport.name',
      'seaport.name',
      'cost',
      'price',
      'status',
    ],
    createdAt: 'createdAt',
    data: data,
  }

  const editHandler = (item) => {
    setId(item._id)

    table.body.map((t) => setValue(t, item[t]))
    setValue('country', item?.country?._id)
    setValue('seaport', item?.seaport?._id)
    setValue('airport', item?.airport?._id)
    setValue('isPort', item?.isPort)
    setValue('cost', item?.cost?.replace('$', ''))
    setValue('price', item?.price?.replace('$', ''))

    setEdit(true)
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => mutateAsyncDelete(id)))
  }

  const name = 'Towns List'
  const label = 'Town'
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
          country: data.country,
          seaport: data.seaport,
          airport: data.airport,
          isPort: data.isPort,
          cost: data.cost,
          price: data.price,
          status: data.status,
        })
      : mutateAsyncPost(data)
  }

  const form = [
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
      label: 'Country',
      name: 'country',
      placeholder: 'Select country',
      data: countriesData?.data?.filter((item) => item.status === 'active'),
      value: 'name',
    }),
    watch().country &&
      inputCheckBox({
        register,
        errors,
        label: 'Is Port?',
        name: 'isPort',
        placeholder: 'Select option',
        isRequired: false,
      }),
    watch().country &&
      !watch().isPort &&
      dynamicInputSelect({
        register,
        errors,
        label: 'Airport',
        name: 'airport',
        placeholder: 'Select airport',
        data: airportsData?.data?.filter(
          (item) =>
            item.status === 'active' && item.country?._id === watch().country
        ),
        value: 'name',
      }),
    watch().country &&
      watch().isPort &&
      dynamicInputSelect({
        register,
        errors,
        label: 'Seaport',
        name: 'seaport',
        placeholder: 'Select seaport',
        data: seaportsData?.data?.filter(
          (item) =>
            item.status === 'active' && item.country?._id === watch().country
        ),
        value: 'name',
      }),
    inputNumber({
      register,
      errors,
      label: 'Cost',
      name: 'cost',
      placeholder: 'Enter cost',
    }),
    inputNumber({
      register,
      errors,
      label: 'Price',
      name: 'price',
      placeholder: 'Enter price',
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

  const row = false
  const column = 'col-md-6 col-12'
  const modalSize = 'modal-md'

  return (
    <>
      <Head>
        <title>Towns</title>
        <meta property='og:title' content='Towns' key='title' />
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

export default dynamic(() => Promise.resolve(withAuth(Towns)), {
  ssr: false,
})
