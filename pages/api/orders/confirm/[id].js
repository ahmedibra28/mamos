import moment from 'moment'
import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    const order = await schemaName
      .findOne(
        !allowed.includes(role)
          ? { _id: id, status: 'pending' }
          : { _id: id, status: 'pending', createdBy: _id }
      )
      .populate('other.transportation', ['departureDate'])

    if (!order) return res.status(404).json({ error: 'Order not found' })

    // validate order data

    if (
      !order.process.loadingOnTrack ||
      !order.process.containerInPort ||
      !order.process.checkingVGM ||
      !order.process.instructionForShipments ||
      !order.process.clearanceCertificate ||
      !order.process.paymentDetails
    )
      return res
        .status(404)
        .json({ error: 'You have to complete booking progress' })

    if (order.other.containers.length === 0)
      return res
        .status(400)
        .json({ error: 'You have not selected any containers' })

    if (!order.other.payment)
      return res.status(400).json({ error: 'Payment is required' })

    if (order.status !== 'pending')
      return res
        .status(400)
        .json({ error: 'You can not confirm or cancel this order' })

    // if (!order.other.isHasInvoice || !order.other.invoice)
    //   return res
    //     .status(400)
    //     .json({ error: 'Please upload invoice before submitting' })

    if (
      !order.trackingNo ||
      order.trackingNo === 'N/A' ||
      order.trackingNo === 'n/a'
    )
      return res.status(400).json({ error: 'Booking trace number is required' })

    if (!order.buyer.buyerEmail || !order.buyer.buyerMobileNumber)
      return res.status(400).json({ error: 'Buyer information is not arrived' })

    const movementTypes = {
      pickUp: ['door to door', 'door to port'],
      dropOff: ['door to door', 'port to door'],
    }
    if (movementTypes.pickUp.includes(order.other.movementType)) {
      if (order.pickUp.pickUpCost <= 0 || order.pickUp.pickUpPrice <= 0)
        return res
          .status(400)
          .json({ error: 'Pick up cost and price are required' })
    }
    if (movementTypes.dropOff.includes(order.other.movementType)) {
      if (order.dropOff.dropOffCost <= 0 || order.dropOff.dropOffPrice <= 0)
        return res
          .status(400)
          .json({ error: 'Drop off cost and price are required' })
    }

    const today = moment().format()
    const departureDate = moment(
      order.other.transportation.departureDate
    ).format()

    if (today > departureDate)
      return res
        .status(400)
        .json({ error: 'The booked date has already expired' })

    order.status = 'confirmed'

    await order.save()

    return res.status(200).send('Order confirmed successfully')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
