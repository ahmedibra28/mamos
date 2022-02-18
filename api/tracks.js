import dynamicAPI from './dynamicAPI'
import { useMutation, useQueryClient } from 'react-query'

const url = '/api/track'

export default function useTracks() {
  const queryClient = useQueryClient()

  const getOrderTrack = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['orders']),
    }
  )

  return {
    getOrderTrack,
  }
}
