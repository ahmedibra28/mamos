import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Order from '../../../models/Order'
import Transportation from '../../../models/Transportation'
import { isAuth } from '../../../utils/auth'

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
    let total = await schemaName.countDocuments(
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
  pickUp: ['door to door', 'door to port'],
  dropOff: ['door to door', 'port to door'],
}

handler.post(async (req, res) => {
  await db()
  try {
    const {
      isTemperatureControlled,
      isHasInvoice,
      importExport,
      movementType,
      dropOffTown,
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      pickUpSeaport,
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
      transportation, // shipment reference
      containers, // selected containers
    } = req.body

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
      pickUpSeaport,
    }

    const dropOff = {
      dropOffTown,
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      dropOffSeaport,
    }

    const other = {
      isTemperatureControlled,
      isHasInvoice,
      importExport,
      movementType,
      cargoDescription,
      commodity,
      noOfPackages,
      grossWeight,
      invoice,
      transportation, // shipment reference
      containers, // selected containers
    }

    const trackingNo = 'N/A'

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

    other.transportation = other.transportation._id

    if (other.containers.length === 0)
      return res
        .status(404)
        .json({ error: 'Please select at least one container' })

    const transObject = await Transportation.findOne({
      _id: other.transportation,
      departureSeaport: pickUp.pickUpSeaport,
      arrivalSeaport: dropOff.dropOffSeaport,
      status: 'active',
      vgmDate: { $gt: moment().format() },
    })
      .lean()
      .populate('departureSeaport')
      .populate('arrivalSeaport')

    if (transObject.length === 0)
      return res.status(404).json({ error: 'Transportation not found' })

    pickUp.pickUpCountry = transObject.departureSeaport.country
    dropOff.dropOffCountry = transObject.arrivalSeaport.country

    const object = await Order.create({
      buyer,
      pickUp,
      dropOff,
      other,
      createdBy: req.user._id,
      trackingNo,
    })

    return res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
