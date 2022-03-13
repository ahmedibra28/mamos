import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Expense from '../../../../models/Expense'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'Expense'
const constants = {
  model: Expense,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)
handler.put(async (req, res) => {
  await dbConnect()

  const { name, category, amount, description } = req.body
  const _id = req.query.id
  const updatedBy = req.user.id

  const obj = await constants.model.findById(_id)

  if (obj) {
    obj.name = name
    obj.category = category
    obj.amount = amount
    obj.description = description
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
