import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/order/bookings'

const queryKey = 'bookings'

export default function useBookingsHook(props) {
  const { page = 1, q = '', limit = 25 } = props
  const queryClient = useQueryClient()

  const getBookings = useQuery(
    queryKey,
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&q=${q}&limit=${limit}`, {}),
    { retry: 0 }
  )

  const updateBooking = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const deleteBooking = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const postBooking = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const postAvailableTransportations = useMutation(
    async (obj) => await dynamicAPI('post', `${url}/transportations`, obj),
    {
      retry: 0,
      onSuccess: () =>
        queryClient.invalidateQueries(['booking transportations']),
    }
  )

  return {
    getBookings,
    updateBooking,
    deleteBooking,
    postBooking,
    postAvailableTransportations,
  }
}
