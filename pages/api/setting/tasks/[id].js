import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Task from '../../../../models/Task'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'Task'
const constants = {
  model: Task,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)
handler.put(async (req, res) => {
  await dbConnect()

  const { isActive, name, description, user } = req.body
  const _id = req.query.id
  const updatedBy = req.user.id

  const obj = await constants.model.findById(_id)

  if (obj) {
    obj.name = name
    obj.description = description
    obj.user = user
    obj.isActive = isActive
    obj.updatedBy = updatedBy
    await obj.save()

    res.json({ status: constants.success })
  } else {
    return res.status(404).send(constants.failed)
  }
})

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const obj = await constants.model.findById(_id)
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    await obj.remove()

    res.json({ status: constants.success })
  }
})

export default handler
