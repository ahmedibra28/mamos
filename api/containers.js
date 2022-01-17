import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/containers'

export default function useContainers() {
  const queryClient = useQueryClient()

  // get all containers
  const getContainers = useQuery(
    'containers',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update containers
  const updateContainer = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['containers']),
    }
  )

  // delete containers
  const deleteContainer = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['containers']),
    }
  )

  // add containers
  const addContainer = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['containers']),
    }
  )

  return { getContainers, updateContainer, deleteContainer, addContainer }
}
