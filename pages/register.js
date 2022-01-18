import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Message from '../components/Message'
import FormContainer from '../components/FormContainer'

import { registerUser } from '../api/users'
import { useMutation } from 'react-query'

import { useForm } from 'react-hook-form'
import { customLocalStorage } from '../utils/customLocalStorage'
import Head from 'next/head'
import {
  inputEmail,
  inputNumber,
  inputPassword,
  inputText,
} from '../utils/dynamicForm'

const Register = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const { isLoading, isError, error, isSuccess, mutateAsync } = useMutation(
    'registerUser',
    registerUser,
    {
      retry: 0,
      onSuccess: () => {
        reset()
        router.push('/')
      },
    }
  )

  useEffect(() => {
    customLocalStorage() && customLocalStorage().userInfo && router.push('/')
  }, [router])

  const submitHandler = (data) => {
    mutateAsync(data)
  }
  return (
    <FormContainer>
      <Head>
        <title>Sign up</title>
        <meta property='og:title' content='Signup' key='title' />
      </Head>
      <h3 className='fw-light font-monospace text-center'>Sign Up</h3>
      {isSuccess && (
        <Message variant='success'>User has registered successfully</Message>
      )}

      {isError && <Message variant='danger'>{error}</Message>}

      <p className='text-center'>
        Create an account to start shipping and tracking you shipments easily.
      </p>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row'>
          <div className='col-12'>
            {inputText({ register, errors, label: 'Name', name: 'name' })}
          </div>
          <div className='col-md-6 col-12'>
            {inputEmail({ register, errors, label: 'Email', name: 'email' })}
          </div>
          <div className='col-md-6 col-12'>
            {inputNumber({
              register,
              errors,
              label: 'Mobile Number',
              name: 'mobile',
            })}
          </div>
          <div className='col-md-6 col-12'>
            {inputPassword({
              register,
              errors,
              label: 'Password',
              name: 'password',
              isRequired: true,
              minLength: true,
            })}
          </div>
          <div className='col-md-6 col-12'>
            {inputPassword({
              register,
              errors,
              watch,
              name: 'confirmPassword',
              label: 'Confirm Password',
              validate: true,
              minLength: true,
            })}
          </div>
        </div>

        <button
          type='submit'
          className='btn btn-primary form-control'
          disabled={isLoading}
        >
          {isLoading ? (
            <span className='spinner-border spinner-border-sm' />
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <Link href='/login' type='submit'>
        <a className='btn btn-outline-primary form-control mt-2 '>Login</a>
      </Link>

      <div className='row py-3'>
        <div className='col'>
          Have an Account?
          <Link href='/login'>
            <a className='ps-1 text-decoration-none'>Login </a>
          </Link>
        </div>
      </div>
    </FormContainer>
  )
}

export default Register
