import nc from 'next-connect'
import dbConnect from '../../../../../utils/db'
import Order from '../../../../../models/Order'
import DeliveryMode from '../../../../../models/DeliveryMode'
import { isAuth } from '../../../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.post(async (req, res) => {
  await dbConnect()

  const { _id, mode } = req.body
  const updatedBy = req.user.id

  if (req.user.group !== 'agent') {
    return res.status(401).send('Your are authorized this action')
  }

  const obj = await Order.findOne({ _id, isDelivered: true })

  if (obj) {
    const delivery = await DeliveryMode.findOne({ order: obj._id })
    if (delivery) {
      delivery.mode = mode
      delivery.updatedBy = updatedBy
      await delivery.save()
    }

    res.json({ status: 'success' })
  } else {
    return res.status(404).send('Order not found')
  }
})

export default handler
