import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import {
  FaCheckCircle,
  FaFileDownload,
  FaPenAlt,
  FaPlus,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa'
import moment from 'moment'
import useReports from '../../api/reports'

import { CSVLink } from 'react-csv'

import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../../components/Confirm'
import { useForm } from 'react-hook-form'
import {
  dynamicInputSelect,
  inputDate,
  inputNumber,
  inputText,
  staticInputSelect,
} from '../../utils/dynamicForm'

const incomes = () => {
  const { getIncomes } = useReports()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const { data, isLoading, isError, error, mutateAsync } = getIncomes

  const incomes = data?.incomes || []
  const total = data?.total || 0

  const categories = [
    { name: 'Container' },
    { name: 'Drop Off' },
    { name: 'Pick Up' },
  ]

  const submitHandler = async (data) => {
    mutateAsync(data)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className='row gx-1 d-flex justify-content-center'>
          <div className='col-auto'>
            {staticInputSelect({
              register,
              errors,
              name: 'category',
              label: 'Category',
              data: categories,
            })}
          </div>
          <div className='col-auto'>
            {inputDate({
              register,
              errors,
              name: 'startDate',
              label: 'Start',
            })}
          </div>
          <div className='col-auto'>
            {inputDate({
              register,
              errors,
              name: 'endDate',
              label: 'End',
            })}
          </div>
          <div className='col-auto my-auto'>
            <button
              type='submit'
              className='btn btn-primary btn-lg mt-2'
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='spinner-border spinner-border-sm' />
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </form>

      {data &&
        data.incomes &&
        data.incomes.length > 0 &&
        (isLoading ? (
          <div className='text-center'>
            <Loader
              type='ThreeDots'
              color='#00BFFF'
              height={100}
              width={100}
              timeout={3000} //3 secs
            />
          </div>
        ) : isError ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <>
            <button className='btn btn-light'>$ {total}</button>
            <div className='table-responsive '>
              <table className='table table-sm hover bordered table-striped caption-top '>
                <caption>{data && incomes.length} records were found</caption>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data &&
                    incomes.map((income) => (
                      <tr key={income._id}>
                        <td>{income.type}</td>
                        <td>${income.amount.toFixed(2)}</td>
                        <td>{moment(income.createdAt).format('lll')}</td>
                        <td>{income.description}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
    </div>
  )
}

export default incomes
