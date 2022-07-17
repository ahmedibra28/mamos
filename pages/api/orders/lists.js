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
    const { startDate, endDate } = req.body

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

    const orders = await schemaName
      .find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).send(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
