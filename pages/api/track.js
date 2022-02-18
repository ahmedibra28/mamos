import nc from 'next-connect'
import dbConnect from '../../utils/db'
import Order from '../../models/Order'
import { isAuth } from '../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()
  const trackingNo = req.body.name && req.body.name.toUpperCase()
  const { group } = req.user

  const obj = await Order.findOne(
    group === 'admin' ? { trackingNo } : { trackingNo, createdBy: req.user._id }
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

  if (obj) {
    res.send(obj)
  } else {
    return res.status(404).send('Invalid tracking no')
  }
})

export default handler
