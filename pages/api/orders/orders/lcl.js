import moment from 'moment'
import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Transaction from '../../../../models/Transaction'

const handler = nc()
handler.use(isAuth)

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

    const requestTotalCBM =
      other?.containers?.reduce(
        (acc, curr) => acc + curr.length * curr.width * curr.height * curr.qty,
        0
      ) / 1000000

    const bookedShipments = []
    const checkCBM = await Transaction.find({
      'other.transportation': other.transportation,
      type: 'LCL Booking',
      status: 'Pending',
    })

    const totalBookedCBM =
      checkCBM
        ?.map((o) => o?.other?.containers)
        ?.flat()
        ?.reduce(
          (acc, curr) =>
            acc +
            Number(curr?.length) *
              Number(curr?.width) *
              Number(curr?.height) *
              Number(curr?.qty),
          0
        ) || 0

    bookedShipments.push(totalBookedCBM / 1000000 + requestTotalCBM)
    const totalCBM = bookedShipments
      ?.flat()
      ?.reduce((acc, curr) => acc + curr, 0)

    const getDefaultCBM = await Transaction.findOne(
      { status: 'Active', _id: other.transportation },
      { container: 1 }
    )
      .lean()
      .populate('container.container')

    const defaultCBM = getDefaultCBM?.container?.[0]?.container?.details?.CBM

    if (defaultCBM < totalCBM)
      return res.status(400).json({
        error: `You have exceeded the maximum CBM for this shipment. Maximum CBM is ${defaultCBM}`,
      })

    const object = await Transaction.create({
      date: new Date(),
      buyer,
      pickUp,
      dropOff,
      other,
      createdBy: req.user._id,
      TrackingNo,
      type: 'LCL Booking',
      status: 'Pending',
      description: `LCL Booking created by ${req.user.name}`,
    })

    return res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
