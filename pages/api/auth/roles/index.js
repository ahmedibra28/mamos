import nc from 'next-connect'
import db from '../../../../config/db'
import Role from '../../../../models/Role'
import { isAuth } from '../../../../utils/auth'

const schemaName = Role

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
      .populate('permission')
      .populate('clientPermission')

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
    const { name, description } = req.body
    let type
    let permission = []
    let clientPermission = []
    if (name) type = name.toUpperCase().trim().replace(/\s+/g, '_')

    if (req.body.permission) {
      if (Array.isArray(req.body.permission)) {
        permission = req.body.permission
      } else {
        permission = [req.body.permission]
      }
    }

    if (req.body.clientPermission) {
      if (Array.isArray(req.body.clientPermission)) {
        clientPermission = req.body.clientPermission
      } else {
        clientPermission = [req.body.clientPermission]
      }
    }

    permission = permission?.filter((per) => per)
    clientPermission = clientPermission?.filter((client) => client)

    const object = await schemaName.create({
      name,
      description,
      type,
      permission,
      clientPermission,
    })

    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
