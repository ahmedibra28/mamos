import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/employees'

export default function useEmployees() {
  const queryClient = useQueryClient()

  // get all Employees
  const getEmployees = useQuery(
    'employees',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update Employees
  const updateEmployee = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['employees']),
    }
  )

  // delete Employees
  const deleteEmployee = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['employees']),
    }
  )

  // add Employees
  const addEmployee = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['employees']),
    }
  )

  return { getEmployees, updateEmployee, deleteEmployee, addEmployee }
}
