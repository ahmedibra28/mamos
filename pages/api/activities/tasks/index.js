import nc from 'next-connect'
import db from '../../../../config/db'
import Task from '../../../../models/Task'
import { isAuth } from '../../../../utils/auth'

const schemaName = Task

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = schemaName.find(
      q ? { createdBy: req.user._id } : { createdBy: req.user._id }
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q ? { createdBy: req.user._id } : { createdBy: req.user._id }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('employee', ['name'])
      .populate('createdBy', ['name', 'email'])

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
    const { employee, task } = req.body

    const object = await schemaName.create({
      employee,
      response: '',
      task,
      status: 'Pending',
      createdBy: req.user._id,
    })
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
