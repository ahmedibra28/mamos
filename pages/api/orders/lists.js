import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const { startDate, endDate, status } = req.body
    const { role } = req.user

    if (!startDate || !endDate)
      return res.status(404).json({ error: 'Dates must be provided' })

    const start = moment(startDate).clone().startOf('day').format()
    const end = moment(endDate).clone().endOf('day').format()

    if (startDate && endDate) {
      const s = new Date(startDate)
      const e = new Date(endDate)

      if (s > e) {
        return res.status(400).send('Please check the range of the date')
      }
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN']
    const canAccess = allowedRoles.includes(role)

    let query = schemaName.find(
      status
        ? canAccess
          ? { status, createdAt: { $gte: start, $lt: end } }
          : {
              status,
              createdBy: req.user._id,
              createdAt: { $gte: start, $lt: end },
            }
        : canAccess
        ? { createdAt: { $gte: start, $lt: end } }
        : {
            createdBy: req.user._id,
            createdAt: { $gte: start, $lt: end },
          }
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize

    let total = await schemaName.countDocuments(
      status
        ? canAccess
          ? { status, createdAt: { $gte: start, $lt: end } }
          : {
              status,
              createdBy: req.user._id,
              createdAt: { $gte: start, $lt: end },
            }
        : canAccess
        ? { createdAt: { $gte: start, $lt: end } }
        : {
            createdBy: req.user._id,
            createdAt: { $gte: start, $lt: end },
          }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('createdBy', ['name'])
      .populate('other.transportation')
      .populate('other.transportation.vendor')

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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
