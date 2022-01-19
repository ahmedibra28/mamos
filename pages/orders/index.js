import React from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'

const Orders = () => {
  return <div>Here is the user orders</div>
}

export default dynamic(() => Promise.resolve(withAuth(Orders)), { ssr: false })
