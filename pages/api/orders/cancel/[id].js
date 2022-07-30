import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { cancelledReason } = req.body
    if (!cancelledReason)
      return res.status(400).json({ error: 'Cancel reason is required' })

    const { role, _id } = req.user

    const admin = role === 'SUPER_ADMIN' && true

    const order = await schemaName.findOne(
      admin
        ? { _id: id, status: 'pending' }
        : { _id: id, status: 'pending', createdBy: _id }
    )

    if (!order) return res.status(404).json({ error: 'Order not found' })

    order.status = 'cancelled'
    order.cancelledReason = cancelledReason

    await order.save()

    return res.status(200).send('Order cancelled successfully')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
