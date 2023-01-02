import nc from 'next-connect'
import db from '../../../../config/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    let result = await schemaName
      .find({ 'other.transportation': id })
      .lean()
      .sort({ createdAt: -1 })
      .populate('createdBy', ['name'])
      .populate({
        path: 'other.transportation',
        populate: {
          path: 'vendor',
        },
      })

    res.status(200).send(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
