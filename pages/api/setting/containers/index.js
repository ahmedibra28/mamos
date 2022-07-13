import nc from 'next-connect'
import db from '../../../../config/db'
import Container from '../../../../models/Container'
import { isAuth } from '../../../../utils/auth'

const schemaName = Container

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

    query = query.skip(skip).limit(pageSize).sort({ createdAt: -1 }).lean()

    let result = await query

    result = result.map((container) => ({
      ...container,
      details: {
        ...container.details,
        CBM: `${
          Math.round(Number(container.details.CBM) * 100) / 100
        } cubic meter`,
      },
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
    const { name, length, width, height, status } = req.body
    // check existence of object
    const exist = await schemaName.findOne({
      name: { $regex: `^${name?.trim()}$`, $options: 'i' },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    const totalCBM = (Number(length) * Number(width) * Number(height)) / 1000

    const additionalData = {
      CBM: totalCBM,
      airFreight: totalCBM * 167,
      seaFreight: totalCBM * 1000,
      roadFreightNational: totalCBM * 300,
      roadFreightInternational: totalCBM * 333,
    }

    const object = await schemaName.create({
      name,
      length,
      width,
      height,
      details: additionalData,
      status,
      createdBy: req.user.id,
    })
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
