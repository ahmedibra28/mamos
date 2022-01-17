import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Shipper from '../../../../models/Shipper'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'shipper'
const constants = {
  model: Shipper,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model.find({}).lean().sort({ createdAt: -1 })
  res.send(obj)
})

handler.post(async (req, res) => {
  await dbConnect()

  const { isActive, name, type, price, deliveryTime } = req.body
  const createdBy = req.user.id

  const exist = await constants.model.exists({
    name,
    type,
    price,
    deliveryTime,
  })

  if (exist) {
    return res.status(400).send(constants.existed)
  }
  const createObj = await constants.model.create({
    name,
    type,
    price,
    deliveryTime,
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
