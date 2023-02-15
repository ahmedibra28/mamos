import nc from 'next-connect'
import db from '../../../config/db'
import Transaction from '../../../models/Transaction'
import { isAuth } from '../../../utils/auth'
import moment from 'moment'
// import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    let query = schemaName.find({ type: 'Ship', status: 'Active' })

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments({
      type: 'Ship',
      status: 'Active',
    })

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('vendor', ['name'])

    let result = await query

    result = result.map((trans) => ({
      ...trans,
      departureDate: moment(trans.departureDate).format('YYYY-MM-DD'),
      arrivalDate: moment(trans.arrivalDate).format('YYYY-MM-DD'),
      storageFreeGateInDate: moment(trans.storageFreeGateInDate).format(
        'YYYY-MM-DD'
      ),
      shippingInstructionDate: moment(trans.shippingInstructionDate).format(
        'YYYY-MM-DD'
      ),
      vgmDate: moment(trans.vgmDate).format('YYYY-MM-DD'),
      delayDate: moment(trans.delayDate).format('YYYY-MM-DD'),
    }))

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
