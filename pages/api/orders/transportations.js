import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Transaction from '../../../models/Transaction'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const { pickUpSeaport, dropOffSeaport } = req.body

    let object = await schemaName
      .find({
        departureSeaport: pickUpSeaport,
        arrivalSeaport: dropOffSeaport,
        status: 'Active',
        vgmDate: { $gt: moment().format() },
      })
      .lean()
      .sort({ createdAt: -1 })
      .populate('container.container')
      .populate('vendor', ['name'])

    object = object.map((obj) => ({
      ...obj,
      cost: priceFormat(
        obj.container.reduce((acc, curr) => acc + Number(curr.cost), 0) || 0
      ),
      price: priceFormat(
        obj.container.reduce((acc, curr) => acc + Number(curr.price), 0) || 0
      ),
    }))

    const data = []
    const newPromiseObject = Promise.all(
      object.map(async (trans) => {
        const order = await Transaction.exists({
          'other.transportation': trans._id,
          $or: [{ status: { $ne: 'cancelled' } }],
        })

        if (!order) data.push(trans)
      })
    )

    await newPromiseObject

    res.status(200).send(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
