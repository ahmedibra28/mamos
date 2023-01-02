import nc from 'next-connect'
import db from '../../../../config/db'
import Tradelane from '../../../../models/Tradelane'
import Transportation from '../../../../models/Transportation'
import { isAuth } from '../../../../utils/auth'

const schemaName = Tradelane

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    const transportation = await Transportation.findOne({ name: q })

    let query = schemaName.find(
      q && transportation ? { transportation: transportation._id } : {}
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q && transportation ? { transportation: transportation._id } : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      // .populate('transportation')
      .populate({
        path: 'transportation',
        populate: {
          path: 'vendor',
        },
      })

    const result = await query

    // const tradelanes = await Tradelane.find({}).lean()
    let transportations = await Transportation.find(
      {
        status: 'active',
      },
      { reference: 1 }
    ).lean()

    const tradelanes = await Tradelane.find({}, { transportation: 1 }).lean()

    const newTransportation = transportations.filter(
      (trans) =>
        !tradelanes
          .map((trade) => trade.transportation.toString())
          .includes(trans._id.toString())
    )

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
      newTransportation,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  await db()
  try {
    const { transportation, tradelane, status } = req.body

    if (!tradelane || !transportation)
      return res.status(404).json({ error: 'All fields are required' })

    if (tradelane.length === 0)
      return res.status(404).json({ error: `Tradelane can't be empty` })

    const transportationObj = await Transportation.findOne({
      _id: transportation,
      status: 'active',
    })
    if (!transportationObj)
      return res.status(404).json({ error: 'Transportation not found' })

    // check existence of object
    const object = await schemaName.findOne({
      transportation,
    })

    if (!object) {
      const result = await schemaName.create({
        transportation,
        tradelane,
        status,
        createdBy: req.user._id,
      })
      return res.status(200).send(result)
    }

    if (object.status !== 'active')
      return res.status(400).json({ error: 'Tradelane is not active' })

    object.tradelane = [...object.tradelane, ...tradelane]
    object.updatedBy = req.user._id
    const result = await object.save()

    res.status(200).send(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
