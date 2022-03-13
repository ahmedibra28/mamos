import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/expenses'

export default function useExpenses() {
  const queryClient = useQueryClient()

  // get all expenses
  const getExpenses = useQuery(
    'expenses',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update expenses
  const updateExpense = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['expenses']),
    }
  )

  // delete expenses
  const deleteExpense = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['expenses']),
    }
  )

  // add expenses
  const addExpense = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['expenses']),
    }
  )

  return { getExpenses, updateExpense, deleteExpense, addExpense }
}
