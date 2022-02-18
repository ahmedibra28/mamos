import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/orders'

export default function useOrders(page, search, id, shipment) {
  const queryClient = useQueryClient()

  // get all order
  const getOrders = useQuery(
    'orders',
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&&search=${search}`, {}),
    { retry: 0 }
  )

  // get order details
  const getOrderDetails = useQuery(
    ['order', id],
    async () => await dynamicAPI('get', `${url}/details/${id}`, {}),
    { enabled: !!id, retry: 0 }
  )

  // update order
  const updateOrder = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['orders']),
    }
  )

  // delete order
  const deleteOrder = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/details/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['orders']),
    }
  )

  // add order
  const addOrder = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['orders']),
    }
  )

  // get selected shipment
  const getSelectedShipment = useQuery(
    ['selected shipment', shipment],
    async () => await dynamicAPI('get', `${url}/${shipment}`, {}),
    { enabled: !!shipment, retry: 0 }
  )

  return {
    getOrders,
    updateOrder,
    deleteOrder,
    addOrder,
    getOrderDetails,
    getSelectedShipment,
  }
}
