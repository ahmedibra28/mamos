import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const url = '/api/activities/tasks'

const queryKey = ['tasks']

export default function useTasksHook(props) {
  const { page = 1, q = '', limit = 25 } = props
  const queryClient = useQueryClient()

  const getTasks = useQuery(
    queryKey,
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&q=${q}&limit=${limit}`, {}),
    { retry: 0 }
  )

  const updateTask = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(queryKey),
    }
  )

  const deleteTask = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(queryKey),
    }
  )

  const postTask = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(queryKey),
    }
  )

  const getTasksByEmployee = useQuery(
    'task-by-employee',
    async () =>
      await dynamicAPI(
        'get',
        `${url}/employees?page=${page}&q=${q}&limit=${limit}`,
        {}
      ),
    { retry: 0 }
  )
  const updateTaskByEmployee = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/employees/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['task-by-employee']),
    }
  )

  return {
    getTasks,
    updateTask,
    deleteTask,
    postTask,
    getTasksByEmployee,
    updateTaskByEmployee,
  }
}
