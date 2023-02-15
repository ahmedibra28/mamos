import nc from 'next-connect'
import db from '../../../config/db'
import { isAuth } from '../../../utils/auth'
import Transaction from '../../../models/Transaction'

const handler = nc()
// handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const transportation = await Transaction.find(
      { status: 'Active' },
      { _id: 1, reference: 1 }
    ).lean()

    return res.status(200).json(transportation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
