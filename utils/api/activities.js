import dynamicAPI from './dynamicAPI'
import {
  useQuery,
  //  useMutation,
  // useQueryClient,
} from 'react-query'

const url = '/api/activities'

export default function useActivitiesHook(props) {
  const { page = 1, q = '', limit = 25, id = '' } = props
  // const queryClient = useQueryClient()

  const getOrderActivities = useQuery(
    ['order-activities'],
    async () =>
      await dynamicAPI(
        'get',
        `${url}/orders/?page=${page}&q=${q}&limit=${limit}`,
        {}
      ),
    { retry: 0 }
  )

  const getOrderActivitiesById = useQuery(
    ['order-activity-details'],
    async () => await dynamicAPI('get', `${url}/orders/${id}`, {}),
    { retry: 3, enabled: !!id }
  )

  return {
    getOrderActivities,
    getOrderActivitiesById,
  }
}
