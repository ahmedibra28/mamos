import nc from 'next-connect'
import db from '../../../../config/db'
import Town from '../../../../models/Town'
import Country from '../../../../models/Country'
import Airport from '../../../../models/Airport'
import Seaport from '../../../../models/Seaport'
import { isAuth } from '../../../../utils/auth'

const schemaName = Town

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = schemaName.find(q ? { name: { $regex: q, $options: 'i' } } : {})

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q ? { name: { $regex: q, $options: 'i' } } : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('country', ['name'])
      .populate('airport', ['name'])
      .populate('seaport', ['name'])

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

handler.post(async (req, res) => {
  await db()
  try {
    const { cost, price, seaport, airport, isSeaport } = req.body

    if (Number(cost) < Number(price))
      return res
        .status(404)
        .json({ error: 'Cost must be greater than price amount' })

    if (isSeaport) {
      if (!seaport)
        return res.status(404).json({ error: 'Seaport is required' })
    }
    if (!isSeaport) {
      if (!airport)
        return res.status(404).json({ error: 'Airport is required' })
    }

    // check if status is active
    if (req.body.country) {
      const obj = await Country.findOne({
        country: req.body.country,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Country not found' })
    }
    if (req.body.airport) {
      const obj = await Airport.findOne({
        airport: req.body.airport,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Airport not found' })
    }
    if (req.body.seaport) {
      const obj = await Seaport.findOne({
        seaport: req.body.seaport,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Seaport not found' })
    }

    const object = await schemaName.create({
      ...req.body,
      createdBy: req.user.id,
    })
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
