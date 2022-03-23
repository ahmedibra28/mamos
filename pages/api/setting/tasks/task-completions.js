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

handler.get(async (req, res) => {
  const { _id } = req.user
  const tasks = await constants.model
    .find({ user: _id })
    .lean()
    .sort({ createdAt: -1 })
  res.status(200).send(tasks)
})

handler.post(async (req, res) => {
  await dbConnect()

  const { feedback, _id } = req.body
  const updatedBy = req.user.id

  const obj = await constants.model.findById(_id)

  if (obj) {
    if (obj.user.toString() !== req.user.id.toString()) {
      return res.status(404).send('You are not authorized this task')
    }

    if (obj.status === 'completed') {
      return res.status(404).send('This task was already completed')
    }

    obj.feedback = feedback
    obj.updatedBy = updatedBy
    await obj.save()

    res.json({ status: constants.success })
  } else {
    return res.status(404).send(constants.failed)
  }
})

export default handler
