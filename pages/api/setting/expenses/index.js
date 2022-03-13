import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Expense from '../../../../models/Expense'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'expense'
const constants = {
  model: Expense,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model.find({}).lean().sort({ createdAt: -1 })
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const { name, category, amount, description } = req.body
  const createdBy = req.user.id

  const createObj = await constants.model.create({
    name,
    amount,
    description,
    category,
    createdBy,
  })

  if (createObj) {
    res.status(201).json({ status: constants.success })
  } else {
    return res.status(400).send(constants.failed)
  }
})

export default handler
