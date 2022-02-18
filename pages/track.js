import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
import { FaSearch } from 'react-icons/fa'
import useTracks from '../api/tracks'
import { useForm } from 'react-hook-form'
import { inputCheckBox, inputText } from '../utils/dynamicForm'

const Track = () => {
  const { getOrderTrack } = useTracks()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const {
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    error: errorSearch,
    isSuccess: isSuccessSearch,
    data,
    mutateAsync: addMutateAsync,
  } = getOrderTrack

  const submitHandler = async (data) => {
    addMutateAsync(data)
  }

  return (
    <>
      <Head>
        <title>Tracking</title>
        <meta property='og:title' content='Tracking' key='title' />
      </Head>
      {isSuccessSearch && (
        <Message variant='success'>
          Order track has been found successfully.
        </Message>
      )}
      {isErrorSearch && <Message variant='danger'>{errorSearch}</Message>}

      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row g-0'>
          <div className='col-10'>
            {inputText({ register, label: 'Name', errors, name: 'name' })}
          </div>
          <div className='col-2 my-auto'>
            <button
              type='submit'
              className='btn btn-primary btn-lg mt-2'
              disabled={isLoadingSearch}
            >
              {isLoadingSearch ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </form>

      {isLoadingSearch ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isErrorSearch ? (
        <Message variant='danger'>{errorSearch}</Message>
      ) : (
        data && <>{JSON.stringify(data)}</>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Track)), {
  ssr: false,
})
