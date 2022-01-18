import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Seaport from '../../../../models/Seaport'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'seaport'
const constants = {
  model: Seaport,
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
    .populate('country')
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const { isActive, name, country } = req.body
  const createdBy = req.user.id

  const exist = await constants.model.exists({ name, country })

  if (exist) {
    return res.status(400).send(constants.existed)
  }
  const createObj = await constants.model.create({
    name,
    country,
    isActive,
    createdBy,
  })

  if (createObj) {
    res.status(201).json({ status: constants.success })
  } else {
    return res.status(400).send(constants.failed)
  }
})

export default handler
