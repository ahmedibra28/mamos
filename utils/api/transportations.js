import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const url = '/api/setting/transportations'

const queryKey = ['transportations']

export default function useTransportationsHook(props) {
  const { page = 1, q = '', limit = 25 } = props
  const queryClient = useQueryClient()

  const getTransportations = useQuery(
    queryKey,
    async () =>
      await dynamicAPI('get', `${url}?page=${page}&q=${q}&limit=${limit}`, {}),
    { retry: 0 }
  )

  const updateTransportation = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const deleteTransportation = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const postTransportation = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  const updateArrivedShipmentToConfirm = useMutation(
    async (obj) =>
      await dynamicAPI('put', `${url}/arrival-confirmation/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries([queryKey]),
    }
  )

  return {
    getTransportations,
    updateTransportation,
    deleteTransportation,
    postTransportation,
    updateArrivedShipmentToConfirm,
  }
}
