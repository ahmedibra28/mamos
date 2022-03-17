import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import withAuth from '../../../../HOC/withAuth'
import {
  FaArrowAltCircleLeft,
  FaCircle,
  FaShip,
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
  FaPlusCircle,
} from 'react-icons/fa'
import Head from 'next/head'
import useOrders from '../../../../api/orders'
import Message from '../../../../components/Message'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputFile,
  inputNumber,
  inputText,
} from '../../../../utils/dynamicForm'
import { useEffect, useState } from 'react'

const EditInvoiceCargo = () => {
  const router = useRouter()
  const [file, setFile] = useState('')
  const { id } = router.query
  const { getOrderDetails, updateInvoiceCargo } = useOrders('', '', id)

  const { data, isLoading, isError, error } = getOrderDetails

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateInvoiceCargo

  useEffect(() => {
    if (isSuccessUpdate) {
      router.push('/orders')
    }
  }, [isSuccessUpdate])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    defaultValues: {},
  })

  useEffect(() => {
    if (data) {
      setValue('isHasInvoice', data.isHasInvoice)
    }
  }, [data])

  const submitHandler = (data) => {
    const formData = new FormData()
    formData.append('invoiceFile', data.invoiceFile && data.invoiceFile[0])
    formData.append('isHasInvoice', data.isHasInvoice)

    updateMutateAsync({
      _id: id,
      formData,
    })
  }

  const invoiceCharges = 79.0

  return (
    <>
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isLoading ? (
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
        data && (
          <div>
            <form onSubmit={handleSubmit(submitHandler)}>
              <div className='row gx-2 my-2'>
                <div className='col-md-6 col-12 mx-auto'>
                  <div className='row gx-2 my-2'>
                    <div className='col-12'>
                      <h5>OTHER REQUIRED DETAILS</h5>
                      <p>Please answer all below asked questions.</p>
                    </div>

                    <div className=' col-12'>
                      {inputCheckBox({
                        register,
                        errors,
                        name: 'isHasInvoice',
                        label: 'Do you have invoice?',
                        isRequired: false,
                      })}
                    </div>
                    {watch().isHasInvoice ? (
                      <div className='col-md-6 col-12'>
                        {inputFile({
                          register,
                          errors,
                          name: 'invoiceFile',
                          label: 'Upload Invoice',
                          setFile,
                        })}
                      </div>
                    ) : (
                      <>
                        <label>
                          If you do not have invoice, we will charge you
                          additional service to creating new invoice for your
                          cargo?
                        </label>
                        <h6>${invoiceCharges.toFixed(2)}</h6>
                      </>
                    )}

                    <span className='mt-1'></span>
                    <hr />
                  </div>

                  <div className='text-center mb-3'>
                    <button
                      disabled={!isValid}
                      className='btn btn-primary btn-sm'
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(EditInvoiceCargo)), {
  ssr: false,
})
