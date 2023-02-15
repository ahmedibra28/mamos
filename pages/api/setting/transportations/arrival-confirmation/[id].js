import nc from 'next-connect'
import db from '../../../../../config/db'
import Transportation from '../../../../../models/Transportation'
import Order from '../../../../../models/Order'
import { isAuth } from '../../../../../utils/auth'
import moment from 'moment'

const schemaName = Transportation
const schemaNameString = 'Transportation'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    const currentDate = moment().format()

    const object = await schemaName.findOne({
      _id: id,
      arrivalDate: { $lt: currentDate },
    })

    if (!object)
      return res
        .status(404)
        .json({ error: 'Shipment not found or not Arrived yet!' })

    object.status = 'Arrived'
    object.updatedBy = req.user._id
    await object.save()

    const orders = await Order.find({ 'other.transportation': id })

    Promise.all(
      orders.map(
        async (o) =>
          await Order.updateOne({ _id: o._id }, { $set: { status: 'Arrived' } })
      )
    )

    res.status(200).send(`${schemaNameString} updated`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
