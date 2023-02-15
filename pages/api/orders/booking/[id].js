import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import Transportation from '../../../../models/Transportation'
import { isAuth } from '../../../../utils/auth'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { selectedTransportation } = req.body
    const { role, _id } = req.user

    if (selectedTransportation.cargo !== 'FCL')
      return res.status(400).json({ error: 'Invalid cargo type request' })

    const allowed = ['AUTHENTICATED']

    const order = await schemaName
      .findOne(
        !allowed.includes(role)
          ? { _id: id, status: 'Pending', transportType: 'FCL Booking' }
          : {
              _id: id,
              status: 'Pending',
              createdBy: _id,
              transportType: 'FCL Booking',
            }
      )
      .populate('other.transportation')

    if (!order) return res.status(404).json({ error: 'Order not found' })

    const transportation = await Transportation.findOne({
      _id: selectedTransportation._id,
      status: 'Active',
    }).lean()

    if (!transportation)
      return res.status(404).json({ error: 'Transportation not found' })

    order.other.transportation = transportation._id
    order.other.containers = []

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
