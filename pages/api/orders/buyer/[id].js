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
    const { buyerAddress, buyerEmail, buyerMobileNumber, buyerName } = req.body
    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    const order = await schemaName.findOne(
      !allowed.includes(role)
        ? { _id: id, status: 'pending' }
        : { _id: id, status: 'pending', createdBy: _id }
    )

    if (!order || !order.buyer.buyerName)
      return res.status(404).json({ error: 'Order not found' })

    order.buyer.buyerName = buyerName
    order.buyer.buyerEmail = buyerEmail
    order.buyer.buyerMobileNumber = buyerMobileNumber
    order.buyer.buyerAddress = buyerAddress

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
