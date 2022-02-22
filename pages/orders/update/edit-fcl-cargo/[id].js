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
import useCommodities from '../../../../api/commodities'
import useContainers from '../../../../api/containers'
import {
  dynamicInputSelect,
  inputCheckBox,
  inputNumber,
  inputText,
} from '../../../../utils/dynamicForm'
import { useEffect, useState } from 'react'

const EditFCLCargo = () => {
  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails, updateFCLCargo } = useOrders('', '', id)
  const { getContainers } = useContainers()
  const { getCommodities } = useCommodities()

  const { data, isLoading, isError, error } = getOrderDetails
  const { data: containersData } = getContainers
  const { data: commoditiesData } = getCommodities

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateFCLCargo

  useEffect(() => {
    if (isSuccessUpdate) {
      router.push('/orders')
    }
  }, [isSuccessUpdate])

  const customSelectedContainer =
    data &&
    data.containerFCL.map((item) => ({
      quantity: item.quantity,
      ...item.container,
    }))

  const [selectContainer, setSelectContainer] = useState(
    (customSelectedContainer && customSelectedContainer) || []
  )

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
    if (customSelectedContainer && customSelectedContainer.length > 0) {
      setSelectContainer(customSelectedContainer)
    }
    if (data) {
      setValue('isTemperatureControlled', data.isTemperatureControlled)
      setValue('grossWeight', data.grossWeight)
      setValue('cargoDescription', data.cargoDescription)
      setValue('noOfPackages', data.noOfPackages)
      setValue('commodity', data.commodity._id)
    }
  }, [data])

  const totalContainerKG =
    selectContainer &&
    selectContainer.reduce(
      (acc, curr) => acc + curr.payloadCapacity * curr.quantity,
      0
    )

  const addContainer = (container) => {
    const existed = selectContainer.find((c) => c._id === container._id)
    if (existed) {
      const newSelectContainer = selectContainer.map((c) => {
        if (c._id === container._id) {
          return {
            ...container,
            quantity: c.quantity + 1,
          }
        }
        return c
      })
      setSelectContainer(newSelectContainer)
    } else {
      setSelectContainer([...selectContainer, { ...container, quantity: 1 }])
    }
  }

  const removeContainer = (container) => {
    const newSelectContainer = selectContainer.map((c) => {
      if (c._id === container._id && c.quantity > 1) {
        return {
          ...container,
          quantity: c.quantity - 1,
        }
      }
      if (c._id === container._id && c.quantity === 1) {
        return null
      }
      return c
    })

    setSelectContainer(newSelectContainer.filter((f) => f !== null))
  }

  const submitHandler = (data) => {
    console.log({ _id: id, data, selectContainer })
    updateMutateAsync({
      _id: id,
      data,
      selectContainer,
    })
  }

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
            <div className='row gx-2 my-2'>
              <div className='col-md-6 col-12 mx-auto'>
                {containersData &&
                  containersData.map((container) => (
                    <div key={container._id}>
                      <div className='mt-1'>
                        <div className='text-center'>
                          <button
                            disabled={
                              !selectContainer.find(
                                (c) => c._id === container._id
                              )
                            }
                            onClick={() => removeContainer(container)}
                            type='button'
                            className='btn btn-danger btn-sm'
                          >
                            <FaMinusCircle className='mb-1' />
                          </button>

                          <button
                            type='button'
                            className='btn btn-light btn-sm'
                          >
                            {selectContainer.map(
                              (c) => c._id === container._id && c.quantity
                            )}
                            {!selectContainer.find(
                              (c) => c._id === container._id
                            ) && 0}
                          </button>

                          <button
                            onClick={() => addContainer(container)}
                            type='button'
                            className='btn btn-success btn-sm'
                          >
                            <FaPlusCircle className='mb-1' />
                          </button>
                        </div>
                        <div className='d-grid mt-2'>
                          <button
                            type='button'
                            className='btn btn-light btn-sm '
                          >
                            {container.name} - Fits up to{' '}
                            {container.payloadCapacity} &{' '}
                            {(
                              container.length *
                              container.width *
                              container.height *
                              0.000001
                            ).toFixed(0)}{' '}
                            M<sup>3</sup>
                          </button>
                        </div>
                      </div>
                      <br />
                    </div>
                  ))}
              </div>
            </div>
            <form onSubmit={handleSubmit(submitHandler)}>
              <div className='row gx-2 my-2'>
                <div className='col-lg-8 col-md-10 col-12 mx-auto'>
                  <div className='row gx-2 my-2'>
                    <div className='col-12'>
                      <h5>CARGO DETAILS</h5>
                      <p>Tel us a bit more about your cargo.</p>
                    </div>

                    <div className='col-md-6 col-12 mx-auto'>
                      {inputText({
                        register,
                        errors,
                        name: 'cargoDescription',
                        label: 'Cargo Description',
                      })}
                    </div>
                    <div className='col-md-6 col-12 mx-auto'>
                      {dynamicInputSelect({
                        register,
                        errors,
                        label: 'Commodity *',
                        name: 'commodity',
                        value: 'name',
                        data:
                          commoditiesData &&
                          commoditiesData.filter(
                            (commodity) => commodity.isActive
                          ),
                      })}
                    </div>
                    <div className='col-md-6 col-12 mx-auto'>
                      {inputNumber({
                        register,
                        errors,
                        name: 'noOfPackages',
                        label: 'No. of Packages',
                      })}
                    </div>
                    <div className='col-md-6 col-12 mx-auto'>
                      {inputNumber({
                        register,
                        errors,
                        name: 'grossWeight',
                        label: 'Gross Weight as KG',
                        max: totalContainerKG,
                      })}
                    </div>
                    <div className='col-12'>
                      {inputCheckBox({
                        register,
                        errors,
                        name: 'isTemperatureControlled',
                        isRequired: false,
                        label:
                          'My cargo is not temperature-controlled and does not include any hazardous or personal goods',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className='text-center mb-3'>
                <button disabled={!isValid} className='btn btn-primary btn-sm'>
                  Update
                </button>
              </div>
            </form>
          </div>
        )
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(EditFCLCargo)), {
  ssr: false,
})
