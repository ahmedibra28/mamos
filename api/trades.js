import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/trades'

export default function useTrades() {
  const queryClient = useQueryClient()

  // get all trades
  const getTrades = useQuery(
    'trades',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update trades
  const updateTrade = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['trades']),
    }
  )

  // delete trades
  const deleteTrade = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['trades']),
    }
  )

  // add trades
  const addTrade = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['trades']),
    }
  )

  return { getTrades, updateTrade, deleteTrade, addTrade }
}
