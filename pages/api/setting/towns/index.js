import nc from 'next-connect'
import db from '../../../../config/db'
import Town from '../../../../models/Town'
import Country from '../../../../models/Country'
import Airport from '../../../../models/Airport'
import Seaport from '../../../../models/Seaport'
import { isAuth } from '../../../../utils/auth'
import { priceFormat } from '../../../../utils/priceFormat'

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

    let result = await query

    result = result.map((value) => ({
      ...value,
      cost: priceFormat(value.cost),
      price: priceFormat(value.price),
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

handler.post(async (req, res) => {
  await db()
  try {
    const { name, country, status, cost, price, seaport, airport, isPort } =
      req.body

    if (Number(cost) > Number(price))
      return res
        .status(404)
        .json({ error: 'Cost must be greater than price amount' })

    if (isPort) {
      if (!seaport)
        return res.status(404).json({ error: 'Seaport is required' })
    }
    if (!isPort) {
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

    // check existence of object
    const exist = await schemaName.findOne(
      isPort
        ? {
            name: { $regex: `^${req.body?.name?.trim()}$`, $options: 'i' },
            country: req.body.country,
            seaport: req.body.seaport,
          }
        : {
            name: { $regex: `^${req.body?.name?.trim()}$`, $options: 'i' },
            country: req.body.country,
            airport: req.body.airport,
          }
    )

    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    const requestObj = {
      name,
      country,
      cost,
      price,
      status,
      isPort,
      airport: isPort ? undefined : airport,
      seaport: isPort ? seaport : undefined,
      createdBy: req.user._id,
    }

    const object = await schemaName.create(requestObj)
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
