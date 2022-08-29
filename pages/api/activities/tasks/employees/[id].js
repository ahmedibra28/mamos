import nc from 'next-connect'
import db from '../../../../../config/db'
import Task from '../../../../../models/Task'
import { isAuth } from '../../../../../utils/auth'

const schemaName = Task
const schemaNameString = 'Task'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { response } = req.body

    const object = await schemaName.findOne({ employee: req.user._id, _id: id })
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    object.response = response
    object.status = 'completed'
    object.updatedBy = req.user._id
    await object.save()
    res.status(200).send(`${schemaNameString} updated`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
