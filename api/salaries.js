import dynamicAPI from './dynamicAPI'
import { useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/pay-salaries'

export default function useSalaries() {
  const queryClient = useQueryClient()

  // update Employees
  const paySalary = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['employees']),
    }
  )

  return { paySalary }
}
