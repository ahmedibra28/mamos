import dynamicAPI from './dynamicAPI'
import { useMutation, useQueryClient } from 'react-query'

const url = '/api/report'

export default function useReports() {
  const queryClient = useQueryClient()

  const getExpenses = useMutation(
    async (obj) => await dynamicAPI('post', `${url}/expenses`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['expenses']),
    }
  )

  const getIncomes = useMutation(
    async (obj) => await dynamicAPI('post', `${url}/incomes`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['incomes']),
    }
  )

  return { getExpenses, getIncomes }
}
