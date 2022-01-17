import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/shippers'

export default function useShippers() {
  const queryClient = useQueryClient()

  // get all shippers
  const getShippers = useQuery(
    'shippers',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update shippers
  const updateShipper = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['shippers']),
    }
  )

  // delete shippers
  const deleteShipper = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['shippers']),
    }
  )

  // add shippers
  const addShipper = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['shippers']),
    }
  )

  return { getShippers, updateShipper, deleteShipper, addShipper }
}
