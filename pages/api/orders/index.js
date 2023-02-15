import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import { isAuth } from '../../../utils/auth'
import Transaction from '../../../models/Transaction'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    const allowedRoles = ['SUPER_ADMIN', 'LOGISTIC', 'ADMIN']
    const role = req.user.role

    const canAccess = allowedRoles.includes(role)

    let query = Transaction.find(
      q
        ? canAccess
          ? { TrackingNo: { $regex: q, $options: 'i' }, type: 'FCL Booking' }
          : {
              TrackingNo: { $regex: q, $options: 'i' },
              type: 'FCL Booking',
              createdBy: req.user._id,
            }
        : canAccess
        ? { type: 'FCL Booking' }
        : { type: 'FCL Booking', createdBy: req.user._id }
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize

    let total = await Transaction.countDocuments(
      q
        ? canAccess
          ? { TrackingNo: { $regex: q, $options: 'i' }, type: 'FCL Booking' }
          : {
              TrackingNo: { $regex: q, $options: 'i' },
              type: 'FCL Booking',
              createdBy: req.user._id,
            }
        : canAccess
        ? { type: 'FCL Booking' }
        : { type: 'FCL Booking', createdBy: req.user._id }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('other.transportation')
      .populate('pickUp.pickUpCountry')
      .populate('pickUp.pickUpSeaport')
      .populate('dropOff.dropOffCountry')
      .populate('dropOff.dropOffSeaport')
      .populate('createdBy', ['name'])
      .populate({
        path: 'other.transportation',
        populate: {
          path: 'vendor',
        },
      })

    let result = await query

    // filter result and find the other.transportation from Transaction
    const newResultPromise = await Promise.all(
      result.map(async (item) => {
        const tran = await Transaction.findOne(
          { _id: item.other.transportation },
          { vendor: 1, reference: 1 }
        ).populate('vendor')

        return {
          ...item,
          other: {
            ...item.other,
            transportation: tran,
          },
        }
      })
    )

    const newResult = await Promise.all(newResultPromise)

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + newResult.length,
      count: newResult.length,
      page,
      pages,
      total,
      data: newResult,
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
      // isHasInvoice,
      importExport,
      movementType,
      // dropOffTown,
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
      // pickUpTown,
      pickUpWarehouse,
      pickUpCity,
      pickUpAddress,
      // invoice,
      transportation, // shipment reference
      containers, // selected containers
    } = req.body

    if (!buyerName || !buyerMobileNumber || !buyerEmail || !buyerAddress)
      return res.status(400).json({ error: 'Buyer details are required' })

    // const vendor = await Vendor.findOne({
    //   _id: buyerName,
    //   type: 'Customer',
    //   status: 'Active',
    // })
    // if (!vendor) return res.status(400).json({ error: 'Invalid buyer' })

    const buyer = {
      buyerName,
      buyerMobileNumber,
      buyerEmail,
      buyerAddress,
    }

    const pickUp = {
      // pickUpTown,
      pickUpWarehouse,
      pickUpCity,
      pickUpAddress,
      pickUpSeaport,
      pickUpCost: 0,
      pickUpPrice: 0,
    }

    const dropOff = {
      // dropOffTown,
      dropOffWarehouse,
      dropOffCity,
      dropOffAddress,
      dropOffSeaport,
      dropOffCost: 0,
      dropOffPrice: 0,
    }

    const other = {
      isTemperatureControlled,
      // isHasInvoice,
      importExport,
      movementType,
      cargoDescription,
      commodity,
      noOfPackages,
      grossWeight,
      // invoice,
      transportation, // shipment reference
      containers, // selected containers
    }

    const TrackingNo = 'N/A'

    if (!movementTypes.pickUp.includes(other.movementType)) {
      // delete pickUp.pickUpTown
      delete pickUp.pickUpWarehouse
      delete pickUp.pickUpCity
      delete pickUp.pickUpAddress
    }

    if (!movementTypes.dropOff.includes(other.movementType)) {
      // delete dropOff.dropOffTown
      delete dropOff.dropOffWarehouse
      delete dropOff.dropOffCity
      delete dropOff.dropOffAddress
    }

    // if (!other.isHasInvoice) {
    //   delete other.invoice
    // }

    other.transportation = other.transportation._id

    if (other.containers.length === 0)
      return res
        .status(404)
        .json({ error: 'Please select at least one container' })

    const transObject = await Transaction.findOne({
      _id: other.transportation,
      departureSeaport: pickUp.pickUpSeaport,
      arrivalSeaport: dropOff.dropOffSeaport,
      status: 'Active',
      vgmDate: { $gt: moment().format() },
    })
      .lean()
      .populate('departureSeaport')
      .populate('arrivalSeaport')

    if (transObject.length === 0)
      return res.status(404).json({ error: 'Transportation not found' })

    pickUp.pickUpCountry = transObject.departureSeaport.country
    dropOff.dropOffCountry = transObject.arrivalSeaport.country

    const object = await Transaction.create({
      date: new Date(),
      buyer,
      pickUp,
      dropOff,
      other,
      createdBy: req.user._id,
      TrackingNo,
      type: 'FCL Booking',
      status: 'Pending',
      description: `FCL Booking created by ${req.user.name}`,
    })

    return res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
