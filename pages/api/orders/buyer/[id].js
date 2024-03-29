import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'
// import Vendor from '../../../../models/Vendor'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { buyerAddress, buyerEmail, buyerMobileNumber, buyerName } = req.body
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
            createdBy: _id,
            type: { $in: ['FCL Booking', 'LCL Booking'] },
          }
    )

    if (!order || !order.buyer.buyerName)
      return res.status(404).json({ error: 'Transaction not found' })

    // const vendor = await Vendor.findOne({
    //   _id: buyerName,
    //   type: 'Customer',
    //   status: 'Active',
    // })
    // if (!vendor) return res.status(400).json({ error: 'Invalid buyer' })

    order.buyer.buyerName = buyerName
    order.buyer.buyerEmail = buyerEmail
    order.buyer.buyerMobileNumber = buyerMobileNumber
    order.buyer.buyerAddress = buyerAddress

    await order.save()

    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
