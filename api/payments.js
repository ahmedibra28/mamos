import dynamicAPI from './dynamicAPI'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const url = '/api/payments'

export default function usePayments() {
  const queryClient = useQueryClient()

  // get all payments
  const getPayments = useQuery(
    'payments',
    async () => await dynamicAPI('get', url, {}),
    { retry: 0 }
  )

  // update payments
  const updatePayment = useMutation(
    async (obj) => await dynamicAPI('put', `${url}/${obj._id}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['payments']),
    }
  )

  // delete payments
  const deletePayment = useMutation(
    async (obj) =>
      await dynamicAPI(
        'delete',
        `${url}/${obj.paymentId}?subpaymentid=${obj.subPaymentId}`,
        {}
      ),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['payments']),
    }
  )

  // add payments
  const addPayment = useMutation(
    async (obj) => await dynamicAPI('post', url, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['payments']),
    }
  )

  return { getPayments, updatePayment, deletePayment, addPayment }
}
