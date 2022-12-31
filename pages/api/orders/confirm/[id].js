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

    // update the transaction => accounts receivable
    const acc = await Account.findOne({ accNo: 10910 }, { _id: 1 })
    const accExp = await Account.findOne({ accNo: 501 }, { _id: 1 })

    const common = {
      refId: order._id,
      transactionType: 'debit',
      discount: 0,
      createdBy: order.createdBy,
      date: moment().format(),
    }

    if (order.pickUp.pickUpCost) {
      const pickUpTransaction = {
        ...common,
        account: acc?._id,
        amount: Number(order.pickUp.pickUpCost),
        being: 'Pick up container',
        description: `Pick up container`,
      }
      await Transaction.create(pickUpTransaction)
    }
    if (order.dropOff.dropOffCost) {
      const dropOffTransaction = {
        ...common,
        account: acc?._id,
        amount: Number(order.dropOff.dropOffCost),
        being: 'Drop off container',
        description: `Drop off container`,
      }
      await Transaction.create(dropOffTransaction)
    }

    if (order.demurrage > 0) {
      const demurrageTransaction = {
        ...common,
        account: accExp?._id,
        amount: Number(order.demurrage),
        being: 'Demurrage',
        description: `Demurrage`,
      }
      await Transaction.create(demurrageTransaction)
    }
    if (order.customClearance > 0) {
      const customClearanceTransaction = {
        ...common,
        account: accExp?._id,
        amount: Number(order.customClearance),
        being: 'Custom clearance',
        description: `Custom clearance`,
      }
      await Transaction.create(customClearanceTransaction)
    }
    if (order.overWeight > 0) {
      const overWeightTransaction = {
        ...common,
        account: accExp?._id,
        amount: Number(order.overWeight),
        being: 'Over weight',
        description: `Over weight`,
      }
      await Transaction.create(overWeightTransaction)
    }

    const containerTransaction = {
      ...common,
      account: acc?._id,
      amount: Number(
        order.other.containers.reduce(
          (acc, cur) => (acc + cur.cost) * cur.quantity,
          0
        )
      ),
      being: 'FCL booking',
      description: `FCL booking`,
    }

    await Transaction.create(containerTransaction)

    return res.status(200).send('Order confirmed successfully')
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
