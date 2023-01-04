import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    let query = Transaction.find({ vendor: id })

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await Transaction.countDocuments({ vendor: id })

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ date: -1 })
      .lean()
      .populate('vendor', ['name'])
      .populate('account', ['name', 'code'])

    const result = await query

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
    })

    // const vTransactions = await Transaction.find({ vendor: id }).lean()
    // if (vTransactions.length > 0) return res.json(vTransactions)

    // const cTransactions = await Transaction.find({ customer: id }).lean()
    // if (cTransactions.length > 0) return res.json(cTransactions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
