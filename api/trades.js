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

  const getEmployeeUsers = useQuery(
    'employee users',
    async () => await dynamicAPI('get', `${url}/users`, {}),
    { retry: 0 }
  )

  const getSharedByEmployee = useQuery(
    'shared trades',
    async () => await dynamicAPI('get', `${url}/shared`, {}),
    { retry: 0 }
  )

  // update trade status
  const updateTrade = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['trades']),
    }
  )

  const shareTradeToEmployee = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/users/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['employee users']),
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

  return {
    getTrades,
    updateTrade,
    deleteTrade,
    addTrade,
    getEmployeeUsers,
    shareTradeToEmployee,
    getSharedByEmployee,
  }
}
