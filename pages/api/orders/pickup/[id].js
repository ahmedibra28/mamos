import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
// import Town from '../../../../models/Town'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const {
      pickUpWarehouse,
      pickUpCity,
      pickUpAddress,
      // pickUpTown,
      pickUpCost,
      pickUpPrice,
    } = req.body

    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    const order = await schemaName.findOne(
      !allowed.includes(role)
        ? { _id: id, status: 'pending' }
        : { _id: id, status: 'pending', createdBy: _id }
    )

    if (!order) return res.status(404).json({ error: 'Order not found' })

    // const town = await Town.findById(pickUpTown, { country: 1 }).lean()

    // if (town.country.toString() !== order.pickUp.pickUpCountry.toString())
    //   return res
    //     .status(400)
    //     .json({ error: 'Please select available towns only' })

    if (Number(pickUpCost) > Number(pickUpPrice))
      return res
        .status(400)
        .json({ error: 'Pick up cost can not be grater than pick up price' })

    order.pickUp.pickUpWarehouse = pickUpWarehouse
    order.pickUp.pickUpCity = pickUpCity
    order.pickUp.pickUpAddress = pickUpAddress
    // order.pickUp.pickUpTown = pickUpTown
    order.pickUp.pickUpCost = pickUpCost
    order.pickUp.pickUpPrice = pickUpPrice

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
