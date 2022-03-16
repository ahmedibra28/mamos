import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Shipper from '../../../../models/Shipper'
import { isAuth } from '../../../../utils/auth'
import Expense from '../../../../models/Expense'

const handler = nc()

const modelName = 'shipper'
const constants = {
  model: Shipper,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

const undefinedChecker = (property) => (property !== '' ? property : null)

handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model
    .find({})
    .lean()
    .sort({ createdAt: -1 })
    .populate('departureSeaport', 'name')
    .populate('arrivalSeaport', 'name')
    .populate('departureAirport', 'name')
    .populate('arrivalAirport', 'name')
    .populate('container')
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const {
    isActive,
    name,
    price,
    cost,
    transportationType,
    departureSeaport,
    arrivalSeaport,
    departureAirport,
    arrivalAirport,
    departureDate,
    arrivalDate,
    cargoType,
    movementType,
    availableCapacity,
    container,
  } = req.body.data
  const { tradelane } = req.body
  const createdBy = req.user.id

  const createObj = await constants.model.create({
    name,
    price,
    cost,
    transportationType,
    departureSeaport: undefinedChecker(departureSeaport),
    arrivalSeaport: undefinedChecker(arrivalSeaport),
    departureAirport: undefinedChecker(departureAirport),
    arrivalAirport: undefinedChecker(arrivalAirport),
    departureDate,
    arrivalDate,
    cargoType: undefinedChecker(cargoType),
    movementType,
    availableCapacity: undefinedChecker(availableCapacity),
    tradelane,
    container,
    isActive,
    createdBy,
  })

  if (createObj) {
    await Expense.create({
      type: `Container`,
      amount: cost,
      description: `Renting ${createObj.id} Container`,
      shipper: createObj._id,
      createdBy: createdBy,
    })

    res.status(201).json({ status: constants.success })
  } else {
    return res.status(400).send(constants.failed)
  }
})

export default handler
