import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/countries'

export default function useCountries() {
  const queryClient = useQueryClient()

  // get all countries
  const getCountries = useQuery(
    'countries',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update countries
  const updateCountry = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['countries']),
    }
  )

  // delete countries
  const deleteCountry = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['countries']),
    }
  )

  // add countries
  const addCountry = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['countries']),
    }
  )

  return { getCountries, updateCountry, deleteCountry, addCountry }
}
