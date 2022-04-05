import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const { id } = req.query
  const { group } = req.user
  const fullAccess = ['admin', 'logistic', 'branch'].includes(group)

  const obj = await Order.findOne(
    fullAccess ? { _id: id } : { _id: id, createdBy: req.user._id }
  )
    .populate('destination.destCountry')
    .populate('destination.destPort')
    .populate('destination.destAirport')
    .populate('destination.dropOffTown')
    .populate('pickup.pickUpTown')
    .populate('pickup.pickupCountry')
    .populate('pickup.pickupPort')
    .populate('pickup.pickupAirport')
    .populate('containerFCL.container')
    .populate('containerLCL.commodity')
    .populate('commodity')
    .populate('shipment')

  res.send(obj)
})

handler.delete(async (req, res) => {
  await dbConnect()
  const { group } = req.user
  const fullAccess = ['admin', 'logistic'].includes(group)

  const _id = req.query.id
  const obj = await Order.findOne(
    fullAccess ? { _id } : { _id, createdBy: req.user._id }
  )
  if (!obj) {
    return res.status(404).send('Order not found')
  } else {
    await obj.remove()

    res.json({ status: 'success' })
  }
})

export default handler
