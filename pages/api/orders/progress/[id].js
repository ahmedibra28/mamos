import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { data } = req.body

    const order = await schemaName.findOne({
      _id: id,
      status: 'Pending',
      type: { $in: ['FCL Booking', 'LCL Booking'] },
    })

    if (!order) return res.status(404).json({ error: 'Order not found' })

    order.process = data
    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
