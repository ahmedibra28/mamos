import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/seaports'

export default function useSeaports() {
  const queryClient = useQueryClient()

  // get all seaports
  const getSeaports = useQuery(
    'seaports',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update seaports
  const updateSeaport = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['seaports']),
    }
  )

  // delete seaports
  const deleteSeaport = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['seaports']),
    }
  )

  // add seaports
  const addSeaport = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['seaports']),
    }
  )

  return { getSeaports, updateSeaport, deleteSeaport, addSeaport }
}
