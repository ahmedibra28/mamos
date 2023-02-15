import moment from 'moment'
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

    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    let order = await schemaName
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
      .populate('other.transportation', ['departureDate'])
      .populate({
        path: 'other.transportation',
        populate: {
          path: 'vendor',
        },
      })

    if (!order) return res.status(404).json({ error: 'Order not found' })

    // find order.other.transportation.vendor
    const transportation = await Transaction.findOne({
      _id: order.other.transportation,
      type: 'Ship',
      status: { $in: ['Active', 'Pending'] },
    }).populate('vendor', ['name'])

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

    if (order.status !== 'Pending')
      return res
        .status(400)
        .json({ error: 'You can not confirm or cancel this order' })

    // if (!order.other.isHasInvoice || !order.other.invoice)
    //   return res
    //     .status(400)
    //     .json({ error: 'Please upload invoice before submitting' })

    if (
      !order.TrackingNo ||
      order.TrackingNo === 'N/A' ||
      order.TrackingNo === 'n/a'
    )
      return res.status(400).json({ error: 'Booking trace number is required' })

    if (!order.buyer.buyerEmail || !order.buyer.buyerMobileNumber)
      return res.status(400).json({ error: 'Buyer information is not Arrived' })

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
        .json({ error: 'The booked date has already expire' })

    order.status = 'Confirmed'
    order.account = ['5000 Cost of Goods Sold']
    order.customer = order.createdBy
    order.amount = Number(
      order.other.containers.reduce(
        (acc, cur) => (acc + cur.price) * cur.quantity,
        0
      )
    )

    const saveOrder = await order.save()

    if (!saveOrder)
      return res.status(400).json({ error: 'Order not confirmed' })

    if (order.pickUp.pickUpCost > 0) {
      const pickUpTransaction = {
        date: new Date(),
        createdBy: order.createdBy,
        reference: order._id,
        type: 'Pick Up',
        account: ['1001 Stock/Inventory'],
        vendor: order.pickUp.pickUpVendor,
        amount: order.pickUp.pickUpCost,
        description: `Pick up for ${order.TrackingNo}`,
      }
      await Transaction.create(pickUpTransaction)
    }

    if (order.dropOff.dropOffCost > 0) {
      const dropOffTransaction = {
        date: new Date(),
        createdBy: order.createdBy,
        reference: order._id,
        type: 'Drop Off',
        account: ['1001 Stock/Inventory'],
        vendor: order.dropOff.dropOffVendor,
        amount: order.dropOff.dropOffCost,
        description: `Drop off for ${order.TrackingNo}`,
      }
      await Transaction.create(dropOffTransaction)
    }

    // Demurrage
    if (order.demurrage > 0) {
      const demurrageTransaction = {
        date: new Date(),
        createdBy: order.createdBy,
        reference: order._id,
        type: 'Demurrage',
        account: ['1001 Stock/Inventory'],
        vendor: transportation.vendor._id,
        amount: Number(order.demurrage), // Marsek
        description: `Demurrage for ${order.TrackingNo}`,
      }
      await Transaction.create(demurrageTransaction)
    }

    // Overweight
    if (order.overWeight.amount > 0) {
      const overWeightTransaction = {
        date: new Date(),
        createdBy: order.createdBy,
        reference: order._id,
        type: 'Overweight',
        account: ['1001 Stock/Inventory'],
        vendor: order.overWeight.vendor,
        amount: Number(order.overWeight.amount),
        description: `Overweight for ${order.TrackingNo}`,
      }
      await Transaction.create(overWeightTransaction)
    }

    return res.status(200).send('Order Confirmed successfully')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
