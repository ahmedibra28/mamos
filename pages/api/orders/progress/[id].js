import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
import Town from '../../../../models/Town'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { pickUpWarehouse, pickUpCity, pickUpAddress, pickUpTown } = req.body

    const order = await schemaName.findOne({ _id: id, status: 'pending' })

    if (!order) return res.status(404).json({ error: 'Order not found' })

    //order.pickUp.pickUpCity = pickUpCity

    console.log(req.body)

    // await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
