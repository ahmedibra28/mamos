import { useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'

import useTrades from '../../api/trades'
import { useForm } from 'react-hook-form'
import { dynamicInputSelect } from '../../utils/dynamicForm'
import { useRouter } from 'next/router'

const Shared = () => {
  const router = useRouter()
  const { id } = router.query
  const { getEmployeeUsers, shareTradeToEmployee } = useTrades()
  const { data, isLoading, isError, error } = getEmployeeUsers
  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = shareTradeToEmployee

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const submitHandler = async (data) => {
    updateMutateAsync({
      _id: id,
      employee: data.employee,
    })
  }

  useEffect(() => {
    if (isSuccessUpdate) {
      reset()
      setTimeout(() => {
        router.push('/trade')
      }, 2000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdate])

  return (
    <>
      <Head>
        <title>Trade Sharing</title>
        <meta property='og:title' content='Trade Sharing' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Trade has been shared with employee successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isError && <Message variant='danger'>{error}</Message>}

      <div className='row'>
        <div className='col-md-8 col-12 mx-auto mt-5'>
          <form onSubmit={handleSubmit(submitHandler)}>
            {dynamicInputSelect({
              label: 'Employee',
              name: 'employee',
              data: data && data,
              value: 'name',
              register,
              errors,
            })}
            <button
              type='submit'
              className='btn btn-primary form-control'
              disabled={isLoading || isLoadingUpdate}
            >
              {isLoading || isLoadingUpdate ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Shared
