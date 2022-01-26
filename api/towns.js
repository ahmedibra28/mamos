import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/towns'

export default function useTowns() {
  const queryClient = useQueryClient()

  // get all towns
  const getTowns = useQuery(
    'towns',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update towns
  const updateTown = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['towns']),
    }
  )

  // delete towns
  const deleteTown = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['towns']),
    }
  )

  // add towns
  const addTown = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['towns']),
    }
  )

  return { getTowns, updateTown, deleteTown, addTown }
}
