import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/setting/tasks'

export default function useTasks() {
  const queryClient = useQueryClient()

  // get all tasks
  const getTasks = useQuery(
    'tasks',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update tasks
  const updateTask = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['tasks']),
    }
  )

  // delete tasks
  const deleteTask = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['tasks']),
    }
  )

  // add tasks
  const addTask = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['tasks']),
    }
  )

  // get all users
  const getAllUsers = useQuery(
    'users tasks',
    async () => await dynamicAPI('get', `${url}/users`, {}),
    { retry: 0 }
  )

  // task completed
  const taskCompletion = useMutation(
    async (obj) => await dynamicAPI('post', `${url}/task-completions`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['tasks']),
    }
  )

  // get task by user
  const getTaskByUser = useQuery(
    'tasks by user',
    async () => await dynamicAPI('get', `${url}/task-completions`, {}),
    { retry: 0 }
  )

  return {
    getTasks,
    updateTask,
    deleteTask,
    addTask,
    getAllUsers,
    taskCompletion,
    getTaskByUser,
  }
}
