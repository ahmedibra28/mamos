import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/airports'

export default function useAirports() {
  const queryClient = useQueryClient()

  // get all airports
  const getAirports = useQuery(
    'airports',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update airports
  const updateAirport = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['airports']),
    }
  )

  // delete airports
  const deleteAirport = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['airports']),
    }
  )

  // add airports
  const addAirport = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['airports']),
    }
  )

  return { getAirports, updateAirport, deleteAirport, addAirport }
}
