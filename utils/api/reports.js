import dynamicAPI from './dynamicAPI'
import {
  useQuery,
  //  useMutation,
  // useQueryClient,
} from 'react-query'

const url = '/api/reports'

export default function useReportsHook(props) {
  const { page = 1, q = '', limit = 25 } = props
  // const queryClient = useQueryClient()

  const getBookingsReport = useQuery(
    ['booking-report'],
    async () =>
      await dynamicAPI(
        'get',
        `${url}/bookings/?page=${page}&q=${q}&limit=${limit}`,
        {}
      ),
    { retry: 0 }
  )

  const getShippingStatusReport = useQuery(
    ['shipping-status-report'],
    async () =>
      await dynamicAPI(
        'get',
        `${url}/shipping-status/?page=${page}&q=${q}&limit=${limit}`,
        {}
      ),
    { retry: 0 }
  )

  const getArrivedShipmentsReport = useQuery(
    ['arrived-shipments-report'],
    async () =>
      await dynamicAPI(
        'get',
        `${url}/arrived-shipments/?page=${page}&q=${q}&limit=${limit}`,
        {}
      ),
    { retry: 0 }
  )

  return {
    getBookingsReport,
    getShippingStatusReport,
    getArrivedShipmentsReport,
  }
}
