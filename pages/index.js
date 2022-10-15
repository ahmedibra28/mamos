import moment from 'moment'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Message, Spinner } from '../components'
// import FormContainer from '../components/FormContainer'
import Shipment from '../components/Shipment'
import withAuth from '../HOC/withAuth'
import useOrdersHook from '../utils/api/orders'

const Home = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const orderHook = useOrdersHook({
    page,
    q,
  })

  useEffect(() => {
    orderHook.getOrders.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) orderHook.getOrders.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const handleSearch = () => orderHook.getOrders.refetch()

  return (
    <div className='container'>
      {orderHook.getOrders.isLoading ? (
        <Spinner />
      ) : orderHook.getOrders.isError ? (
        <Message variant='danger'>{orderHook.getOrders.error}</Message>
      ) : (
        <Shipment
          data={orderHook.getOrders.data}
          setPage={setPage}
          q={q}
          setQ={setQ}
          handleSearch={handleSearch}
        />
      )}
      {/* <FormContainer>
        <div className='text-center'>
          <h6>Version 1.3 is coming soon</h6>
        </div>
      </FormContainer> */}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
