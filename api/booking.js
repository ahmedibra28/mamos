import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/booking'

export default function useBooking() {
  const queryClient = useQueryClient()

  // get all booking
  const getBooking = useQuery(
    'booking',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update booking
  const updateBooking = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['booking']),
    }
  )

  // delete booking
  const deleteBooking = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['booking']),
    }
  )

  // add booking
  const addBooking = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['booking']),
    }
  )

  return { getBooking, updateBooking, deleteBooking, addBooking }
}
