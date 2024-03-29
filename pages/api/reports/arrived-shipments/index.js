import moment from 'moment'
import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    const currentDate = moment().format()
    const start = moment(q).clone().startOf('month').format()
    const end = moment(q).clone().endOf('month').format()

    let query = schemaName.find(
      q
        ? {
            arrivalDate: { $gte: start, $lt: end },
            arrivalDate: { $lt: currentDate },
            type: 'FCL Booking',
          }
        : { arrivalDate: { $lt: currentDate }, type: 'FCL Booking' }
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q
        ? {
            arrivalDate: { $gte: start, $lt: end },
            arrivalDate: { $lt: currentDate },
            type: 'FCL Booking',
          }
        : { arrivalDate: { $lt: currentDate }, type: 'FCL Booking' }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ arrivalDate: -1 })
      .lean()
      .populate('createdBy', ['name'])
      .populate('vendor', ['name'])

    let result = await query

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
