import nc from 'next-connect'
import db from '../../../config/db'
import { isAuth } from '../../../utils/auth'
import Transaction from '../../../models/Transaction'
import Account from '../../../models/Account'

const handler = nc()
// handler.use(isAuth)

handler.post(async (req, res) => {
  await db()
  try {
    const { customer } = req.body

    const transactions = await Transaction.find({
      $or: [
        {
          type: 'Receipt',
          customer: { $in: [customer] },
        },
        {
          type: 'FCL Booking',
          createdBy: { $in: [customer] },
        },
      ],

      status: {
        $in: ['Confirmed', 'Active'],
      },
      account: {
        $in: ['5000 Cost of Goods Sold', 'TEMP 555'],
      },
    })
      .select(
        'type amount pickUp.pickUpPrice, dropOff.dropOffPrice createdBy status'
      )
      .populate('createdBy', ['name'])
      .lean()

    const totalPickUp =
      transactions
        ?.filter(
          (trans) =>
            trans.type === 'FCL Booking' &&
            trans.status === 'Confirmed' &&
            trans.pickUp
        )
        .reduce((acc, cur) => acc + Number(cur.pickUp.pickUpPrice), 0) || 0

    const totalDropOff =
      transactions
        ?.filter(
          (trans) =>
            trans.type === 'FCL Booking' &&
            trans.status === 'Confirmed' &&
            trans.dropOff
        )
        .reduce((acc, cur) => acc + Number(cur.dropOff.dropOffPrice), 0) || 0

    const totalAmount =
      transactions?.reduce((acc, cur) => acc + Number(cur.amount), 0) || 0

    const totalReceipt = transactions
      ?.filter((trans) => trans.type === 'Receipt')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    res.status(200).json({
      amount: totalPickUp + totalDropOff + totalAmount - Number(totalReceipt),
      customer: transactions[0]?.createdBy?.name,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
