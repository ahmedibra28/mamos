import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Order from '../../../models/Order'
import Transportation from '../../../models/Transportation'
import { isAuth } from '../../../utils/auth'
import autoIncrement from '../../../utils/autoIncrement'

const schemaName = Order

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
}

const FCL = async ({ buyer, pickUp, dropOff, other, res }) => {
  if (!movementTypes.pickUp.includes(other.movementType)) {
    delete pickUp.pickUpTown
    delete pickUp.pickUpWarehouse
    delete pickUp.pickUpCity
    delete pickUp.pickUpAddress
  }
  delete pickUp.pickUpAirport

  if (!movementTypes.dropOff.includes(other.movementType)) {
    delete dropOff.dropOffTown
    delete dropOff.dropOffWarehouse
    delete dropOff.dropOffCity
    delete dropOff.dropOffAddress
  }
  delete dropOff.dropOffAirport

  if (!other.isHasInvoice) {
    delete other.invoice
  }
  delete other.containerLCL

  other.transportation = other?.transportation?._id

  if (other?.containerFCL?.length === 0)
    return res
      .status(404)
      .json({ error: 'Please select at least one container' })

  const object = await Transportation.find({
    departureSeaport: pickUp.pickUpSeaport,
    arrivalSeaport: dropOff.dropOffSeaport,
    cargoType: 'FCL',
    status: 'active',
    departureDate: { $gt: moment().format() },
  }).lean()

  if (object.length === 0)
    return res.status(404).json({ error: 'Transportation not found' })

  return {
    buyer,
    pickUp,
    dropOff,
    other,
  }
}
const LCL = async ({ buyer, pickUp, dropOff, other, res }) => {
  if (!movementTypes.pickUp.includes(other.movementType)) {
    delete pickUp.pickUpTown
    delete pickUp.pickUpWarehouse
    delete pickUp.pickUpCity
    delete pickUp.pickUpAddress
  }
  delete pickUp.pickUpAirport

  if (!movementTypes.dropOff.includes(other.movementType)) {
    delete dropOff.dropOffTown
    delete dropOff.dropOffWarehouse
    delete dropOff.dropOffCity
    delete dropOff.dropOffAddress
  }
  delete dropOff.dropOffAirport

  if (!other.isHasInvoice) {
    delete other.invoice
  }
  delete other.containerFCL
  delete other.cargoDescription
  delete other.commodity
  delete other.noOfPackages
  delete other.grossWeight

  const USED_CBM = other?.transportation?.USED_CBM

  const DEFAULT_CAPACITY_CONTAINERS = other?.transportation?.container?.reduce(
    (acc, curr) =>
      acc +
      (Number(curr.container.length) *
        Number(curr.container.width) *
        Number(curr.container.height)) /
        1000,
    0
  )

  const REQUEST_CBM = other?.containerLCL?.reduce(
    (acc, curr) =>
      acc +
      (Number(curr.length) * Number(curr.width) * Number(curr.height)) / 1000,
    0
  )

  if (DEFAULT_CAPACITY_CONTAINERS < REQUEST_CBM + USED_CBM)
    return res
      .status(400)
      .json({ error: 'You have exceeded the maximum available CBM' })

  other.transportation = other?.transportation?._id

  const object = await Transportation.find({
    departureSeaport: pickUp.pickUpSeaport,
    arrivalSeaport: dropOff.dropOffSeaport,
    cargoType: 'LCL',
    status: 'active',
    departureDate: { $gt: moment().format() },
  }).lean()

  if (object.length === 0)
    return res.status(404).json({ error: 'Transportation not found' })

  return {
    buyer,
    pickUp,
    dropOff,
    other,
  }
}
const AIR = async ({ buyer, pickUp, dropOff, other, res }) => {
  if (!movementTypes.pickUp.includes(other.movementType)) {
    delete pickUp.pickUpTown
    delete pickUp.pickUpWarehouse
    delete pickUp.pickUpCity
    delete pickUp.pickUpAddress
  }
  delete pickUp.pickUpSeaport

  if (!movementTypes.dropOff.includes(other.movementType)) {
    delete dropOff.dropOffTown
    delete dropOff.dropOffWarehouse
    delete dropOff.dropOffCity
    delete dropOff.dropOffAddress
  }
  delete dropOff.dropOffSeaport

  if (!other.isHasInvoice) {
    delete other.invoice
  }
  delete other.containerFCL
  delete other.cargoDescription
  delete other.commodity
  delete other.noOfPackages
  delete other.grossWeight

  const USED_CBM = other?.transportation?.USED_CBM

  const DEFAULT_CAPACITY_CONTAINERS = other?.transportation?.container?.reduce(
    (acc, curr) =>
      acc +
      (Number(curr.container.length) *
        Number(curr.container.width) *
        Number(curr.container.height)) /
        1000,
    0
  )

  const REQUEST_CBM = other?.containerLCL?.reduce(
    (acc, curr) =>
      acc +
      (Number(curr.length) * Number(curr.width) * Number(curr.height)) / 1000,
    0
  )

  if (DEFAULT_CAPACITY_CONTAINERS < REQUEST_CBM + USED_CBM)
    return res
      .status(400)
      .json({ error: 'You have exceeded the maximum available CBM' })

  other.transportation = other?.transportation?._id

  const object = await Transportation.find({
    departureAirport: pickUp.pickUpAirport,
    arrivalAirport: dropOff.dropOffAirport,
    cargoType: 'AIR',
    status: 'active',
    departureDate: { $gt: moment().format() },
  }).lean()

  if (object.length === 0)
    return res.status(404).json({ error: 'Transportation not found' })

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
      dropOffAirport,
      cargoDescription,
      commodity,
      noOfPackages,
      grossWeight,
      buyerName,
      buyerMobileNumber,
      buyerEmail,
      buyerAddress,
      pickUpAirport,
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

    if (!buyerName || !buyerMobileNumber || !buyerEmail || !buyerAddress)
      return res.status(400).json({ error: 'Buyer details are required' })

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
      pickUpAirport,
    }

    const dropOff = {
      dropOffTown,
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      dropOffCountry,
      dropOffSeaport,
      dropOffAirport,
    }

    const other = {
      isTemperatureControlled,
      isHasInvoice,
      importExport,
      transportationType,
      movementType,
      cargoDescription,
      cargoType,
      commodity,
      noOfPackages,
      grossWeight,
      invoice,
      transportation, // Not available FCL
      containerLCL, // Not available FCL
      containerFCL, // Available only FCL
    }

    const lastRecord = await Order.findOne(
      {},
      { trackingNo: 1 },
      { sort: { createdAt: -1 } }
    )

    const trackingNo = lastRecord
      ? autoIncrement(lastRecord.trackingNo)
      : autoIncrement('MB000000')

    if (cargoType === 'FCL' && transportationType !== 'plane') {
      const data = await FCL({ buyer, pickUp, dropOff, other, res })
      const object = await Order.create({
        ...data,
        createdBy: req.user.id,
        trackingNo,
      })
      return res.status(200).send(object)
    }

    if (cargoType === 'LCL' && transportationType !== 'plane') {
      const data = await LCL({ buyer, pickUp, dropOff, other, res })
      const object = await Order.create({
        ...data,
        createdBy: req.user.id,
        trackingNo,
      })
      return res.status(200).send(object)
    }

    if (cargoType === 'AIR' && transportationType === 'plane') {
      const data = await AIR({ buyer, pickUp, dropOff, other, res })
      const object = await Order.create({
        ...data,
        createdBy: req.user.id,
        trackingNo,
      })
      return res.status(200).send(object)
    }

    res.status(200).send(req.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
