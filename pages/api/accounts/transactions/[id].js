import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'
import Account from '../../../../models/Account'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    // 12100	Accounts Receivable
    // 21000	Accounts Payable
    // 2023	Receipts
    // 2022	Payments

    const accounts = await Account.find({
      code: { $in: [12100, 21000, 2023, 2022] },
    }).lean()

    const transactions = await Transaction.find({
      vendor: id,
      account: { $in: accounts.map((acc) => acc._id) },
    })
      .sort({ createdAt: 1 })
      .lean()
      .populate('vendor', ['name'])
      .populate('account', ['name', 'code'])

    res.status(200).json(transactions)

    // const vTransactions = await Transaction.find({ vendor: id }).lean()
    // if (vTransactions.length > 0) return res.json(vTransactions)

    // const cTransactions = await Transaction.find({ Customer: id }).lean()
    // if (cTransactions.length > 0) return res.json(cTransactions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
