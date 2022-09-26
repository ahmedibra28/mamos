import nc from 'next-connect'
import db from '../../../../config/db'
import Task from '../../../../models/Task'
import { isAuth } from '../../../../utils/auth'

const schemaName = Task
const schemaNameString = 'Task'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { employee, response, task } = req.body

    const object = await schemaName.findOne({
      _id: id,
      createdBy: req.user._id,
    })
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    object.employee = employee
    object.response = response
    object.task = task
    object.updatedBy = req.user._id
    await object.save()
    res.status(200).send(`${schemaNameString} updated`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const object = await schemaName.findOne({
      _id: id,
      createdBy: req.user._id,
    })
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    await object.remove()
    res.status(200).send(`${schemaNameString} removed`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
