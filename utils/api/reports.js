import dynamicAPI from './dynamicAPI'
import {
  useQuery,
  //  useMutation,
  // useQueryClient,
} from 'react-query'

const url = '/api/reports'

const queryKey = 'reports'

export default function useReportsHook(props) {
  const { page = 1, q = '', limit = 25 } = props
  // const queryClient = useQueryClient()

  const getBookingsReport = useQuery(
    queryKey,
    async () =>
      await dynamicAPI(
        'get',
        `${url}/bookings/?page=${page}&q=${q}&limit=${limit}`,
        {}
      ),
    { retry: 0 }
  )

  return {
    getBookingsReport,
  }
}
