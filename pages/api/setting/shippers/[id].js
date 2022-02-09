import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Shipper from '../../../../models/Shipper'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'Shipper'
const constants = {
  model: Shipper,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

const undefinedChecker = (property) => (property !== '' ? property : null)

handler.use(isAuth)
handler.put(async (req, res) => {
  await dbConnect()

  const {
    isActive,
    name,
    price,
    transportationType,
    departureSeaport,
    arrivalSeaport,
    departureAirport,
    arrivalAirport,
    departureDate,
    arrivalDate,
    movementType,
    availableCapacity,
    tradelane,
    cargoType,
    container,
  } = req.body
  const _id = req.query.id
  const updatedBy = req.user.id

  const obj = await constants.model.findById(_id)

  if (obj) {
    obj.name = name
    obj.transportationType = transportationType
    obj.price = price
    obj.movementType = movementType
    obj.departureSeaport = undefinedChecker(departureSeaport)
    obj.arrivalSeaport = undefinedChecker(arrivalSeaport)
    obj.departureAirport = undefinedChecker(departureAirport)
    obj.arrivalAirport = undefinedChecker(arrivalAirport)
    obj.availableCapacity = undefinedChecker(availableCapacity)
    obj.departureDate = departureDate
    obj.arrivalDate = arrivalDate
    obj.cargoType = cargoType
    obj.tradelane = tradelane
    obj.container = undefinedChecker(container)
    obj.isActive = isActive
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
