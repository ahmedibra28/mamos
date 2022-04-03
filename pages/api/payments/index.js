import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Payment from '../../../models/Payment'
import { isAuth } from '../../../utils/auth'

const handler = nc()

const modelName = 'payment'
const constants = {
  model: Payment,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model
    .find({})
    .lean()
    .sort({ createdAt: -1 })
    .populate('order')
  res.send(obj)
})

export default handler
