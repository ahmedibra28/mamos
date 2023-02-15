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
    const q = req.query && req.query.q

    let account = null
    if (q) {
      account = await Account.findOne({ code: q }, { _id: 1 })
    }

    let query = Transaction.find(account ? { account: account._id } : {})

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await Transaction.countDocuments(
      account ? { account: account._id } : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('Customer', ['name'])
      .populate('vendor', ['name'])
      .populate('createdBy', ['name'])

    let result = await query

    result = result?.map((r) => {
      let amount = 0
      if (r?.type === 'Ship') {
        amount = r?.container?.reduce((acc, cur) => acc + Number(cur.cost), 0)
      }
      if (r?.type === 'FCL Booking') {
        amount =
          Number(r?.pickUp?.pickUpPrice) +
          Number(r?.dropOff?.dropOffPrice) +
          Number(r?.amount)
      }
      if (['Demurrage', 'Overweight'].includes(r?.type)) {
        amount = r?.amount
      }
      return {
        ...r,
        amount,
      }
    })

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
