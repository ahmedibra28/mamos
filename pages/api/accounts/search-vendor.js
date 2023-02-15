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
    const { vendor } = req.body

    const transactions = await Transaction.find({
      status: 'Active',
      vendor,
      account: {
        $in: ['1001 Stock/Inventory', '2100 Creditors Control Account'],
      },
    })
      .select('type amount container vendor')
      .populate('vendor', ['name'])
      .lean()

    const totalOverWeight = transactions
      ?.filter((trans) => trans.type === 'Overweight')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalDemurrage = transactions
      ?.filter((trans) => trans.type === 'Demurrage')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalContainer = transactions
      ?.map((trans) => trans.type === 'Ship' && trans?.container)
      ?.flat()
      ?.filter((trans) => trans)
      ?.reduce((acc, cur) => acc + Number(cur.cost), 0)

    const totalPickUp = transactions
      ?.filter((trans) => trans.type === 'Pick Up')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalDropOff = transactions
      ?.filter((trans) => trans.type === 'Drop Off')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalPayment = transactions
      ?.filter((trans) => trans.type === 'Payment')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    res.status(200).json({
      amount:
        totalOverWeight +
        totalDemurrage +
        totalPickUp +
        totalDropOff +
        totalContainer -
        Number(totalPayment),
      vendor: transactions[0]?.vendor?.name,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
