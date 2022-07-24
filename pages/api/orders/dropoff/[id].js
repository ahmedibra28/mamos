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
    const { dropOffWarehouse, dropOffCity, dropOffAddress, dropOffTown } =
      req.body

    const { role, _id } = req.user

    const admin = role === 'SUPER_ADMIN' && true

    const order = await schemaName.findOne(
      admin
        ? { _id: id, status: 'pending' }
        : { _id: id, status: 'pending', createdBy: _id }
    )

    if (!order || !order.dropOff.dropOffTown)
      return res.status(404).json({ error: 'Order not found' })

    const town = await Town.findById(dropOffTown, { country: 1 }).lean()

    if (town.country.toString() !== order.dropOff.dropOffCountry.toString())
      return res
        .status(400)
        .json({ error: 'Please select available towns only' })

    order.dropOff.dropOffWarehouse = dropOffWarehouse
    order.dropOff.dropOffCity = dropOffCity
    order.dropOff.dropOffAddress = dropOffAddress
    order.dropOff.dropOffTown = dropOffTown

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
