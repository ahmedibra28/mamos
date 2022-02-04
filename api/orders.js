import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/orders'

export default function useOrders(page, search) {
  const queryClient = useQueryClient()

  // get all order
  const getOrders = useQuery(
    'order',
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&&search=${search}`, {}),
    { retry: 0 }
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
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
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

  return { getOrders, updateOrder, deleteOrder, addOrder }
}
