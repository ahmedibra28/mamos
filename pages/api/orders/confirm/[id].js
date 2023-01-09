import moment from 'moment'
import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
import Account from '../../../../models/Account'
import Transaction from '../../../../models/Transaction'
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
      .populate({
        path: 'other.transportation',
        populate: {
          path: 'vendor',
        },
      })

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

    // if (!order.buyer.buyerEmail || !order.buyer.buyerMobileNumber)
    if (!order.buyer.buyerName)
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
        .json({ error: 'The booked date has already expire' })

    order.status = 'confirmed'

    // update the transaction => accounts receivable
    const ap = await Account.findOne({ code: 21000 }, { _id: 1 })
    const ar = await Account.findOne({ code: 12100 }, { _id: 1 })
    const gos = await Account.findOne({ code: 40000 }, { _id: 1 })

    await order.save()

    const common = {
      date: new Date(),
      discount: 0,
      createdBy: order.createdBy,
      order: order._id,
    }

    // Pick Up
    if (order.pickUp.pickUpCost && order.pickUp.pickUpPrice) {
      const pickUpTransaction = {
        ...common,
        account: ap?._id,
        vendor: order.pickUp.pickUpVendor,
        amount: Number(order.pickUp.pickUpCost),
        description: `Pick-Up Track Rent`,
      }
      await Transaction.create(pickUpTransaction)

      const pickUpGOSTransaction = {
        ...common,
        account: gos?._id,
        vendor: order.buyer?.buyerName,
        amount: Number(order.pickUp.pickUpPrice),
        description: `Pick-Up Track Rent`,
      }
      await Transaction.create(pickUpGOSTransaction)

      const pickUpARTransaction = {
        ...common,
        account: ar?._id,
        vendor: order.buyer?.buyerName,
        amount: Number(order.pickUp.pickUpPrice),
        description: `Pick-Up Track Rent`,
      }
      await Transaction.create(pickUpARTransaction)
    }

    // Drop Off
    if (order.dropOff.dropOffCost && order.dropOff.dropOffPrice) {
      const dropOffTransaction = {
        ...common,
        account: ap?._id,
        vendor: order.dropOff.dropOffVendor,
        amount: Number(order.dropOff.dropOffCost),
        description: `Drop-Off Track Rent`,
      }
      await Transaction.create(dropOffTransaction)

      const dropOffGOSTransaction = {
        ...common,
        account: gos?._id,
        vendor: order.buyer?.buyerName,
        amount: Number(order.dropOff.dropOffPrice),
        description: `Drop-Off Track Rent`,
      }
      await Transaction.create(dropOffGOSTransaction)

      const dropOffARTransaction = {
        ...common,
        account: ar?._id,
        vendor: order.buyer?.buyerName,
        amount: Number(order.dropOff.dropOffPrice),
        description: `Drop-Off Track Rent`,
      }
      await Transaction.create(dropOffARTransaction)
    }
    // Demurrage
    if (order.demurrage > 0) {
      const demurrageTransaction = {
        ...common,
        account: ap?._id,
        vendor: order.other.transportation.vendor._id,
        amount: Number(order.demurrage), // Marsek
        description: `Demurrage`,
      }
      await Transaction.create(demurrageTransaction)
    }

    // Overweight
    if (order.overWeight.amount > 0) {
      const overWeightTransaction = {
        ...common,
        account: ap?._id,
        vendor: order.overWeight.vendor, // Gov
        amount: Number(order.overWeight.amount),
        description: `Overweight`,
      }
      await Transaction.create(overWeightTransaction)
    }

    // Container for account gos
    const containerGOSTransaction = {
      ...common,
      amount: Number(
        order.other.containers.reduce(
          (acc, cur) => (acc + cur.price) * cur.quantity,
          0
        )
      ),
      account: gos?._id,
      vendor: order.buyer?.buyerName,
      description: `FCL Booking`,
    }
    await Transaction.create(containerGOSTransaction)

    // Container for account receivable
    const containerTransaction = {
      ...common,
      amount: Number(
        order.other.containers.reduce(
          (acc, cur) => (acc + cur.price) * cur.quantity,
          0
        )
      ),
      account: ar?._id,
      vendor: order.buyer?.buyerName,
      description: `FCL Booking`,
    }
    await Transaction.create(containerTransaction)

    return res.status(200).send('Order confirmed successfully')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
