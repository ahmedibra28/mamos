import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Transaction from '../../../models/Transaction'
// import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transaction

const handler = nc()
// handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const { _id, cargo } = req.body

    const transportation = await Transaction.find({
      _id,
      cargo,
      status: 'Pending',
      type: 'LCL Booking',
    }).lean()

    res.status(200).send(transportation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
