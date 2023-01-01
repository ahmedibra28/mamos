import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const url = '/api/setting/agencies'

const queryKey = ['agencies']

export default function useAgenciesHook(props) {
  const { page = 1, q = '', limit = 25 } = props
  const queryClient = useQueryClient()

  const getAgencies = useQuery(
    queryKey,
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&q=${q}&limit=${limit}`, {}),
    { retry: 0 }
  )

  const updateAgency = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(queryKey),
    }
  )

  const deleteAgency = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(queryKey),
    }
  )

  const postAgency = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(queryKey),
    }
  )

  return {
    getAgencies,
    updateAgency,
    deleteAgency,
    postAgency,
  }
}
