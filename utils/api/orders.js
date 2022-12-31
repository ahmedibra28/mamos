import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const url = '/api/orders'

const queryKey = ['orders']

export default function useOrdersHook(props) {
  const { page = 1, id, q = '', limit = 25 } = props
  const queryClient = useQueryClient()

  const getOrders = useQuery(
    queryKey,
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&q=${q}&limit=${limit}`, {}),
    { retry: 0 }
  )

  const getOrderDetails = useQuery(
    [`order ${id}`],
    async () => await dynamicAPI('get', `${url}/${id}`, {}),
    { retry: 3, enabled: !!id }
  )

  const updateOrder = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const deleteOrder = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const postOrder = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const postOrdersList = useMutation(
    async (obj) => await dynamicAPI('post', `${url}/lists?page=${page}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const postAvailableTransportations = useMutation(
    async (obj) => await dynamicAPI('post', `${url}/transportations`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['order transportations']),
    }
  )

  const updateOrderBuyer = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/buyer/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderPickUp = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/pickup/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderDropOff = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/dropoff/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderOther = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/other/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderToConfirm = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/confirm/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderToDelete = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/cancel/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderDocument = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/document/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )
  const updateOrderBookingDate = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/booking/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )

  const updateOrderPayment = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/payment/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )

  const updateOrderArrivedBuyerStatus = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/status/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () =>
        queryClient.invalidateQueries([`arrived-booked-shipments`]),
    }
  )

  const updateOrderProgress = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/progress/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([`order ${id}`]),
    }
  )

  return {
    getOrders,
    updateOrder,
    deleteOrder,
    postOrder,
    postAvailableTransportations,
    postOrdersList,
    getOrderDetails,
    updateOrderBuyer,
    updateOrderPickUp,
    updateOrderDropOff,
    updateOrderOther,
    updateOrderToConfirm,
    updateOrderToDelete,
    updateOrderDocument,
    updateOrderBookingDate,
    updateOrderPayment,
    updateOrderArrivedBuyerStatus,
    updateOrderProgress,
  }
}
