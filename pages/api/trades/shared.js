import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Trade from '../../../models/Trade'
import { isAuth } from '../../../utils/auth'

const handler = nc()

const modelName = 'trade'
const constants = {
  model: Trade,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const { group } = req.user
  const obj = await constants.model
    .find(group === 'logistic' ? {} : { employee: req.user._id })
    .lean()
    .sort({ createdAt: -1 })
    .populate('createdBy')

  res.send(obj)
})

export default handler
