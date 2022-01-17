import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/counties'

export default function useCountries() {
  const queryClient = useQueryClient()

  // get all counties
  const getCountries = useQuery(
    'counties',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update counties
  const updateCountry = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['counties']),
    }
  )

  // delete counties
  const deleteCountry = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['counties']),
    }
  )

  // add counties
  const addCountry = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['counties']),
    }
  )

  return { getCountries, updateCountry, deleteCountry, addCountry }
}
