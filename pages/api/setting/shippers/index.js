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

handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model
    .find({})
    .lean()
    .sort({ createdAt: -1 })
    .populate('departureSeaport', 'name')
    .populate('arrivalSeaport', 'name')
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const {
    isActive,
    name,
    price,
    transportationType,
    departureSeaport,
    arrivalSeaport,
    departureDate,
    arrivalDate,
    cargoType,
    movementType,
  } = req.body
  const createdBy = req.user.id

  const exist = await constants.model.exists({
    name,
    price,
    transportationType,
    departureSeaport,
    arrivalSeaport,
    departureDate,
    arrivalDate,
    cargoType,
    movementType,
  })

  if (exist) {
    return res.status(400).send(constants.existed)
  }
  const createObj = await constants.model.create({
    name,
    price,
    transportationType,
    departureSeaport,
    arrivalSeaport,
    departureDate,
    arrivalDate,
    cargoType,
    movementType,
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
