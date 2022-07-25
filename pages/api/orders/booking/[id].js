import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
import Transportation from '../../../../models/Transportation'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { selectedTransportation } = req.body
    const { role, _id } = req.user

    const admin = role === 'SUPER_ADMIN' && true

    const order = await schemaName
      .findOne(
        admin
          ? { _id: id, status: 'pending' }
          : { _id: id, status: 'pending', createdBy: _id }
      )
      .populate('other.transportation')

    if (!order) return res.status(404).json({ error: 'Order not found' })

    const transportation = await Transportation.findOne({
      _id: selectedTransportation._id,
      status: 'active',
    }).lean()

    if (!transportation)
      return res.status(404).json({ error: 'Transportation not found' })

    order.other.transportation = transportation._id

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
