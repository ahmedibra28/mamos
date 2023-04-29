import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
// import Town from '../../../../models/Town'
import { isAuth } from '../../../../utils/auth'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const {
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      dropOffVendor,
      dropOffCost,
      dropOffPrice,
    } = req.body

    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    const order = await schemaName.findOne(
      !allowed.includes(role)
        ? {
            _id: id,
            status: 'Pending',
            type: { $in: ['FCL Booking', 'LCL Booking'] },
          }
        : {
            _id: id,
            status: 'Pending',
            type: { $in: ['FCL Booking', 'LCL Booking'] },
            createdBy: _id,
          }
    )

    if (!order) return res.status(404).json({ error: 'Order not found' })

    // const town = await Town.findById(dropOffTown, { country: 1 }).lean()

    // if (town.country.toString() !== order.dropOff.dropOffCountry.toString())
    //   return res
    //     .status(400)
    //     .json({ error: 'Please select available towns only' })

    if (Number(dropOffCost) > Number(dropOffPrice))
      return res
        .status(400)
        .json({ error: 'Drop off cost can not be grater than drop off price' })

    order.dropOff.dropOffWarehouse = dropOffWarehouse
    order.dropOff.dropOffCity = dropOffCity
    order.dropOff.dropOffAddress = dropOffAddress
    order.dropOff.dropOffVendor = dropOffVendor
    order.dropOff.dropOffCost = dropOffCost
    order.dropOff.dropOffPrice = dropOffPrice

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
