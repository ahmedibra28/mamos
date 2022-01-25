import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/commodities'

export default function useCommodities() {
  const queryClient = useQueryClient()

  // get all commodities
  const getCommodities = useQuery(
    'commodities',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update commodities
  const updateCommodity = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['commodities']),
    }
  )

  // delete commodities
  const deleteCommodity = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['commodities']),
    }
  )

  // add commodities
  const addCommodity = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['commodities']),
    }
  )

  return { getCommodities, updateCommodity, deleteCommodity, addCommodity }
}
