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
    let {
      importExport,
      isTemperatureControlled,
      transportation,
      containers,
      commodity,
      noOfPackages,
      cargoDescription,
      grossWeight,
      TrackingNo,
      demurrage,
      overWeight,
      overWeightVendor,
    } = req.body

    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    const order = await schemaName
      .findOne(
        !allowed.includes(role)
          ? { _id: id, status: 'Pending', type: 'FCL Booking' }
          : {
              _id: id,
              status: 'Pending',
              type: 'FCL Booking',
              createdBy: _id,
            }
      )
      .populate('other.transportation')

    if (!order || !order.other.importExport)
      return res.status(404).json({ error: 'Order not found' })

    transportation = transportation._id
    if (containers.length === 0)
      return res
        .status(404)
        .json({ error: 'Please select at least one container' })

    order.other.importExport = importExport
    order.other.isTemperatureControlled = isTemperatureControlled
    order.other.containers = containers
    order.other.transportation = transportation
    order.other.commodity = commodity
    order.other.noOfPackages = noOfPackages
    order.other.cargoDescription = cargoDescription
    order.other.grossWeight = grossWeight
    order.TrackingNo = TrackingNo

    order.demurrage = demurrage
    if (overWeightVendor) {
      order.overWeight = {
        amount: overWeight,
        vendor: overWeightVendor,
      }
    }

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
