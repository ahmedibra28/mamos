import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import withAuth from '../../../../HOC/withAuth'
import { FaPlusCircle, FaTrash } from 'react-icons/fa'
import Head from 'next/head'
import Message from '../../../../components/Message'
import Loader from 'react-loader-spinner'
import useCommodities from '../../../../api/commodities'
import useOrders from '../../../../api/orders'
import useContainers from '../../../../api/containers'
import { useEffect, useState } from 'react'

const EditLCLCargo = () => {
  const [selectedShipment, setSelectedShipment] = useState(null)

  const router = useRouter()
  const { id } = router.query
  const { getOrderDetails, getSelectedShipment, updateLCLCargo } = useOrders(
    '',
    '',
    id,
    selectedShipment && selectedShipment._id
  )
  const { getCommodities } = useCommodities()
  const { getContainers } = useContainers()

  const { data, isLoading, isError, error } = getOrderDetails
  const { data: commoditiesData } = getCommodities
  const { data: containersData } = getContainers
  const { data: getSelectedShipmentData } = getSelectedShipment

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateLCLCargo

  useEffect(() => {
    if (isSuccessUpdate) {
      router.push('/orders')
    }
  }, [isSuccessUpdate])

  const [inputFields, setInputFields] = useState([
    {
      qty: 0,
      packageUnit: '',
      weight: 0,
      commodity: '',
      unit: '',
      length: '',
      width: '',
      height: '',
    },
  ])

  useEffect(() => {
    if (data) {
      setSelectedShipment(data.shipment)
    }
    if (data) {
      const iFields = data.containerLCL.map((item) => ({
        commodity: item.commodity._id,
        height: item.height,
        width: item.width,
        packageUnit: item.packageUnit,
        qty: item.qty,
        unit: item.unit,
        weight: item.weight,
        length: item.length,
      }))
      setInputFields(iFields)
    }
  }, [data])

  const submitHandler = (e) => {
    e.preventDefault()

    updateMutateAsync({
      _id: id,
      inputFields,
    })
  }

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        qty: '',
        packageUnit: '',
        weight: '',
        commodity: '',
        unit: '',
        length: '',
        width: '',
        height: '',
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

  const DEFAULT_CONTAINER_CAPACITY =
    containersData &&
    selectedShipment &&
    containersData.filter(
      (item) => item.isActive && item._id === selectedShipment.container
    )

  const DEFAULT_LCL_CAPACITY =
    DEFAULT_CONTAINER_CAPACITY &&
    DEFAULT_CONTAINER_CAPACITY.length > 0 &&
    DEFAULT_CONTAINER_CAPACITY[0].payloadCapacity

  const getFilteredSelectedShipmentData =
    getSelectedShipmentData &&
    data &&
    getSelectedShipmentData.filter((item) => item._id !== data._id)

  const USED_LCL_CAPACITY_ARRAY =
    getFilteredSelectedShipmentData &&
    getFilteredSelectedShipmentData.map(
      (ship) =>
        ship.containerLCL &&
        ship.containerLCL.reduce(
          (acc, curr) => acc + curr.height * curr.width * curr.length,
          0
        )
    )

  const TotalCBM =
    inputFields &&
    inputFields.reduce(
      (acc, curr) => acc + curr.length * curr.width * curr.height,
      0
    )

  const USED_LCL_CBM =
    USED_LCL_CAPACITY_ARRAY &&
    USED_LCL_CAPACITY_ARRAY.reduce((acc, curr) => acc + curr, 0)
  const AVAILABLE_LCL_CBM = DEFAULT_LCL_CAPACITY - USED_LCL_CBM

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
            <form onSubmit={(e) => submitHandler(e)}>
              <div className='row gx-2 my-2'>
                <div className='col-lg-8 col-md-10 col-12 mx-auto'>
                  <div className='row gx-2 my-2'>
                    {selectedShipment && (
                      <div className='row gx-2 my-2'>
                        <div className='col-12'>
                          <h5>CARGO DETAILS</h5>
                          <p>Tel us a bit more about your cargo.</p>

                          <div className='col-12'>
                            <div className='progress'>
                              <div
                                className='progress-bar'
                                role='progressbar'
                                style={{
                                  width: `${
                                    (USED_LCL_CBM * 100) / DEFAULT_LCL_CAPACITY
                                  }%`,
                                }}
                                aria-valuenow={
                                  (USED_LCL_CBM * 100) / DEFAULT_LCL_CAPACITY
                                }
                                aria-valuemin='0'
                                aria-valuemax={DEFAULT_LCL_CAPACITY}
                              >
                                {`${(
                                  (USED_LCL_CBM * 100) /
                                  DEFAULT_LCL_CAPACITY
                                ).toFixed(2)}%`}
                              </div>
                            </div>
                          </div>
                          <div className='col-'>
                            <p className='text-danger text-center'>
                              {AVAILABLE_LCL_CBM < TotalCBM &&
                                `You can not use more than ${AVAILABLE_LCL_CBM} CBM in total`}
                            </p>
                          </div>

                          {inputFields.map((inputField, index) => (
                            <div key={index}>
                              <h6 className='font-monospace'>{`Package #${
                                index + 1
                              }`}</h6>
                              <div className='row gx-1 p-2'>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Package Quantity
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Package quantity'
                                    name='qty'
                                    id='qty'
                                    value={inputField.qty}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    P. Unit
                                  </label>
                                  <select
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Unit'
                                    name='packageUnit'
                                    id='packageUnit'
                                    value={inputField.packageUnit}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  >
                                    <option value='boxes'>Boxes</option>
                                    <option value='pieces'>Pieces</option>
                                    <option value='pallets'>Pallets</option>
                                    <option value='bags'>Bags</option>
                                  </select>
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Weight as KG
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Weight'
                                    name='weight'
                                    id='weight'
                                    value={inputField.weight}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Commodity
                                  </label>
                                  <select
                                    className='form-control form-control-sm'
                                    placeholder='Commodity'
                                    name='commodity'
                                    id='commodity'
                                    value={inputField.commodity}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  >
                                    <option value=''>-------</option>
                                    {commoditiesData &&
                                      commoditiesData.map(
                                        (c) =>
                                          c.isActive && (
                                            <option value={c._id} key={c._id}>
                                              {c.name}
                                            </option>
                                          )
                                      )}
                                  </select>
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    CBM Unit
                                  </label>
                                  <select
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Unit'
                                    name='unit'
                                    id='unit'
                                    value={inputField.unit}
                                    required
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  >
                                    <option value='cm'>CM</option>
                                  </select>
                                </div>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Length
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Length'
                                    name='length'
                                    id='length'
                                    value={inputField.length}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>

                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Width
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Width'
                                    name='width'
                                    id='width'
                                    value={inputField.width}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>
                                <div className='col-md-3 col-6'>
                                  <label htmlFor='item' className='form-label'>
                                    Height
                                  </label>
                                  <input
                                    type='number'
                                    min={0}
                                    className='form-control form-control-sm'
                                    placeholder='Height'
                                    name='height'
                                    id='height'
                                    value={inputField.height}
                                    onChange={(e) =>
                                      handleInputChange(e, index)
                                    }
                                  />
                                </div>
                                <div className='col-12 mt-3'></div>
                                <div className='col-md-4 col-12'>
                                  <button
                                    type='button'
                                    className='btn btn-light btn-sm form-control form control-sm'
                                  >
                                    Total Weight:{' '}
                                    {inputField.qty * inputField.weight} KG
                                  </button>
                                </div>
                                <div className='col-md-4 col-12'>
                                  <button
                                    type='button'
                                    className='btn btn-light btn-sm form-control form control-sm'
                                  >
                                    CBM:{' '}
                                    {inputField.length *
                                      inputField.width *
                                      inputField.height}{' '}
                                    M<sup>3</sup>
                                  </button>
                                </div>
                                <div className='col-md-4 col-12'>
                                  <button
                                    type='button'
                                    onClick={() => handleRemoveField(index)}
                                    className='btn btn-danger btn-sm form-control form-control-sm'
                                  >
                                    <FaTrash className='mb-1' /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedShipment && (
                      <div className='text-center my-3'>
                        <button
                          onClick={() => handleAddField()}
                          type='button'
                          className='btn btn-primary btn-sm my-2'
                        >
                          <FaPlusCircle className='mb-1' /> Add New Package
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='text-center mb-3'>
                <button
                  disabled={
                    AVAILABLE_LCL_CBM < TotalCBM || TotalCBM === 0
                      ? true
                      : false
                  }
                  className='btn btn-primary btn sm'
                >
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

export default dynamic(() => Promise.resolve(withAuth(EditLCLCargo)), {
  ssr: false,
})
