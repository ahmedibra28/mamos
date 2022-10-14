import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Transportation from '../../../models/Transportation'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transportation

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
        status: 'active',
        vgmDate: { $gt: moment().format() },
      })
      .lean()
      .sort({ createdAt: -1 })
      .populate('arrivalSeaport')
      .populate('departureSeaport')
      .populate('container.container')

    object = object.map((obj) => ({
      ...obj,
      cost: priceFormat(
        obj?.container?.reduce((acc, curr) => acc + Number(curr?.cost), 0) || 0
      ),
      price: priceFormat(
        obj?.container?.reduce((acc, curr) => acc + Number(curr?.price), 0) || 0
      ),
    }))

    const data = []
    const newPromiseObject = Promise.all(
      object?.map(async (trans) => {
        const order = await Order.find(
          { 'other.transportation': trans?._id },
          { _id: 1 }
        ).lean()
        if (order && order?.length === 0) data.push(trans)
      })
    )

    await newPromiseObject

    res.status(200).send(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
