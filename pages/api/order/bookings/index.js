import nc from 'next-connect'
import db from '../../../../config/db'
import Transportation from '../../../../models/Transportation'
import { isAuth } from '../../../../utils/auth'

const schemaName = Transportation

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = schemaName.find(q ? { name: { $regex: q, $options: 'i' } } : {})

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q ? { name: { $regex: q, $options: 'i' } } : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query.skip(skip).limit(pageSize).sort({ createdAt: -1 }).lean()

    const result = await query

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const movementTypes = {
  pickUp: ['door to door', 'door to port', 'door to airport'],
  dropOff: ['door to door', 'port to door', 'airport to door'],
  seaport: ['port to port'],
  airport: ['airport to airport'],
}

const FCL = ({ buyer, pickUp, dropOff, other }) => {
  if (!movementTypes.pickUp.includes(other.movementType)) {
    delete pickUp.pickUpTown
    delete pickUp.pickUpWarehouse
    delete pickUp.pickUpCity
    delete pickUp.pickUpAddress
  }
  if (!movementTypes.dropOff.includes(other.movementType)) {
    delete dropOff.dropOffTown
    delete dropOff.dropOffWarehouse
    delete dropOff.dropOffCity
    delete dropOff.dropOffAddress
  }
  if (!other.isHasInvoice) {
    delete other.invoice
  }
  delete other.transportation
  delete other.containerLCL

  return {
    buyer,
    pickUp,
    dropOff,
    other,
  }
}
const LCL = ({ buyer, pickUp, dropOff, other }) => {
  if (!movementTypes.pickUp.includes(other.movementType)) {
    delete pickUp.pickUpTown
    delete pickUp.pickUpWarehouse
    delete pickUp.pickUpCity
    delete pickUp.pickUpAddress
  }
  if (!movementTypes.dropOff.includes(other.movementType)) {
    delete dropOff.dropOffTown
    delete dropOff.dropOffWarehouse
    delete dropOff.dropOffCity
    delete dropOff.dropOffAddress
  }
  if (!other.isHasInvoice) {
    delete other.invoice
  }
  delete other.containerFCL
  delete other.cargoDescription
  delete other.commodity
  delete other.noOfPackages
  delete other.grossWeight
  other.transportation = other?.transportation?._id

  return {
    buyer,
    pickUp,
    dropOff,
    other,
  }
}
const AIR = ({ buyer, pickUp, dropOff, other }) => {
  if (!movementTypes.pickUp.includes(other.movementType)) {
    delete pickUp.pickUpTown
    delete pickUp.pickUpWarehouse
    delete pickUp.pickUpCity
    delete pickUp.pickUpAddress
  }
  if (!movementTypes.dropOff.includes(other.movementType)) {
    delete dropOff.dropOffTown
    delete dropOff.dropOffWarehouse
    delete dropOff.dropOffCity
    delete dropOff.dropOffAddress
  }
  if (!other.isHasInvoice) {
    delete other.invoice
  }
  delete other.containerFCL
  delete other.cargoDescription
  delete other.commodity
  delete other.noOfPackages
  delete other.grossWeight
  other.transportation = other?.transportation?._id

  return {
    buyer,
    pickUp,
    dropOff,
    other,
  }
}

handler.post(async (req, res) => {
  await db()
  try {
    const {
      isTemperatureControlled,
      isHasInvoice,
      importExport,
      transportationType,
      movementType,
      cargoType,
      dropOffTown,
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      pickUpCountry,
      pickUpSeaport,
      dropOffCountry,
      dropOffSeaport,
      cargoDescription,
      commodity,
      noOfPackages,
      grossWeight,
      buyerName,
      buyerMobileNumber,
      buyerEmail,
      buyerAddress,
      pickUpTown,
      pickUpWarehouse,
      pickUpCity,
      pickUpAddress,
      invoice,
      transportation, // Not available FCL
      containerLCL, // Not available FCL
      containerFCL, // Available only FCL
    } = req.body

    const validCargoTypes = ['FCL', 'LCL', 'AIR']
    if (!cargoType || !validCargoTypes.includes(cargoType))
      return res.status(400).json({ error: 'Invalid cargo type' })

    const buyer = {
      buyerName,
      buyerMobileNumber,
      buyerEmail,
      buyerAddress,
    }

    const pickUp = {
      pickUpTown,
      pickUpWarehouse,
      pickUpCity,
      pickUpAddress,
      pickUpCountry,
      pickUpSeaport,
    }

    const dropOff = {
      dropOffTown,
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      dropOffCountry,
      dropOffSeaport,
    }

    const other = {
      isTemperatureControlled,
      isHasInvoice,
      importExport,
      transportationType,
      movementType,
      cargoDescription,
      commodity,
      noOfPackages,
      grossWeight,
      invoice,
      transportation, // Not available FCL
      containerLCL, // Not available FCL
      containerFCL, // Available only FCL
    }

    if (cargoType === 'FCL' && transportationType !== 'plane') {
      const data = FCL({ buyer, pickUp, dropOff, other })
      const object = await Order.create(data)
      return res.status(200).send(object)
    }

    if (cargoType === 'LCL' && transportationType !== 'plane') {
      const data = LCL({ buyer, pickUp, dropOff, other })
      const object = await Order.create(data)
      return res.status(200).send(object)
    }

    if (cargoType === 'AIR' && transportationType === 'plane') {
      const data = AIR({ buyer, pickUp, dropOff, other })
      const object = await Order.create(data)
      return res.status(200).send(object)
    }

    console.log(req.body)
    res.status(200).send(req.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
