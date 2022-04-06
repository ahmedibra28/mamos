import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import User from '../../../../models/User'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'trade'
const constants = {
  model: User,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model
    .find({ group: 'employee' })
    .lean()
    .sort({ createdAt: -1 })
  res.send(obj)
})

export default handler
