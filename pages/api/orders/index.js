import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import fileUpload from 'express-fileupload'
import { upload } from '../../../utils/fileManager'
export const config = { api: { bodyParser: false } }
import autoIncrement from '../../../utils/autoIncrement'

const handler = nc()
handler.use(fileUpload())

const undefinedChecker = (property) =>
  property !== 'undefined' ? property : null

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()

  const { group } = req.user

  const fullAccess = ['admin', 'logistic', 'agent'].includes(group)

  const trackingNo =
    req.query && req.query.search && req.query.search.toUpperCase()

  let query = Order.find(
    trackingNo ? { trackingNo } : !fullAccess ? { createdBy: req.user._id } : {}
  )
  const total = await Order.countDocuments(
    trackingNo ? { trackingNo } : !fullAccess ? { createdBy: req.user._id } : {}
  )

  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.limit) || 50
  const skip = (page - 1) * pageSize

  const pages = Math.ceil(total / pageSize)

  query = query
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate('destination.destCountry')
    .populate('destination.destPort')
    .populate('destination.destAirport')
    .populate('destination.dropOffTown')
    .populate('pickup.pickUpTown')
    .populate('pickup.pickupCountry')
    .populate('pickup.pickupPort')
    .populate('pickup.pickupAirport')
    .populate('containerFCL.container')
    .populate('containerLCL.commodity')
    .populate('commodity')
    .populate('shipment')

  const result = await query

  res.send({
    startIndex: skip + 1,
    endIndex: skip + result.length,
    count: result.length,
    page,
    pages,
    total,
    data: result,
  })
})

handler.post(async (req, res) => {
  await dbConnect()
  const createdBy = req.user.id

  const invoiceFile = req.files && req.files.invoiceFile
  const { buyerAddress, buyerEmail, buyerMobileNumber, buyerName } = req.body
  const { cargoDescription, cargoType } = req.body
  const {
    destAddress,
    destCity,
    destCountry,
    destPort,
    destPostalCode,
    destWarehouseName,
    dropOffTown,
    destAirport,
  } = req.body
  const {
    pickUpAddress,
    pickUpCity,
    pickUpPostalCode,
    pickUpTown,
    pickUpWarehouseName,
    pickupCountry,
    pickupPort,
    pickupAirport,
  } = req.body
  const {
    importExport,
    isHasInvoice,
    isTemperatureControlled,
    movementType,
    noOfPackages,
    transportationType,
    commodity,
    selectedShipment,
    paymentMethod,
  } = req.body
  const buyer = {
    buyerAddress,
    buyerEmail,
    buyerMobileNumber,
    buyerName,
  }
  const destination = {
    destAddress: undefinedChecker(destAddress),
    destCity: undefinedChecker(destCity),
    destCountry,
    destPort: undefinedChecker(destPort),
    destAirport: undefinedChecker(destAirport),
    destPostalCode: undefinedChecker(destPostalCode),
    destWarehouseName: undefinedChecker(destWarehouseName),
    dropOffTown: undefinedChecker(dropOffTown),
  }

  const pickup = {
    pickUpAddress: undefinedChecker(pickUpAddress),
    pickUpCity: undefinedChecker(pickUpCity),
    pickUpPostalCode: undefinedChecker(pickUpPostalCode),
    pickUpTown: undefinedChecker(pickUpTown),
    pickUpWarehouseName: undefinedChecker(pickUpWarehouseName),
    pickupCountry,
    pickupPort: undefinedChecker(pickupPort),
    pickupAirport: undefinedChecker(pickupAirport),
  }

  const lastRecord = await Order.findOne(
    {},
    { trackingNo: 1 },
    { sort: { createdAt: -1 } }
  )

  const trackingNo = lastRecord
    ? autoIncrement(lastRecord.trackingNo)
    : autoIncrement('MB000000')

  let containerFCL = []
  if (cargoType === 'FCL') {
    const c = JSON.parse(req.body.selectContainer)
    if (c.length === 0) {
      return res.status(400).send('Please select at least one container')
    }

    for (let i = 0; i < c.length; i++) {
      containerFCL.push({
        container: c[i]._id,
        quantity: c[i].quantity,
      })
    }
  }

  let containerLCL

  if (cargoType === 'LCL' || cargoType === 'AIR') {
    containerLCL = JSON.parse(req.body.inputFields)
  }

  if (invoiceFile) {
    const invoice = await upload({
      fileName: invoiceFile,
      fileType: 'image',
      pathName: 'invoice',
    })

    if (invoice) {
      // FCL
      if (cargoType === 'FCL') {
        const FCLDATA = {
          destination,
          pickup,
          buyer,
          importExport,
          isHasInvoice,
          isTemperatureControlled,
          movementType,
          noOfPackages: undefinedChecker(noOfPackages),
          transportationType,
          commodity: undefinedChecker(commodity),
          cargoDescription,
          cargoType,
          paymentMethod,
          createdBy,
          trackingNo,
          shipment: selectedShipment,
          containerFCL,
          invoiceFile: {
            invoiceFileName: invoice.fullFileName,
            invoiceFilePath: invoice.filePath,
          },
        }
        const createObj = await Order.create(FCLDATA)
        if (createObj) {
          res.status(201).json(createObj)
        } else {
          return res.status(400).send('Invalid data')
        }
      }
      // LCL
      if (cargoType === 'LCL') {
        const LCLDATA = {
          destination,
          pickup,
          buyer,
          importExport,
          isHasInvoice,
          isTemperatureControlled,
          movementType,
          noOfPackages: undefinedChecker(noOfPackages),
          transportationType,
          commodity: undefinedChecker(commodity),
          cargoDescription,
          cargoType,
          paymentMethod,
          createdBy,
          trackingNo,
          shipment: selectedShipment,
          containerLCL,
          invoiceFile: {
            invoiceFileName: invoice.fullFileName,
            invoiceFilePath: invoice.filePath,
          },
        }
        const createObj = await Order.create(LCLDATA)
        if (createObj) {
          res.status(201).json(createObj)
        } else {
          return res.status(400).send('Invalid data')
        }
      }
      // AIR
      if (cargoType === 'AIR') {
        const AIRDATA = {
          destination,
          pickup,
          buyer,
          importExport,
          isHasInvoice,
          isTemperatureControlled,
          movementType,
          paymentMethod,
          noOfPackages: undefinedChecker(noOfPackages),
          transportationType,
          commodity: undefinedChecker(commodity),
          cargoDescription,
          cargoType,
          createdBy,
          trackingNo,
          shipment: selectedShipment,
          containerLCL,
          invoiceFile: {
            invoiceFileName: invoice.fullFileName,
            invoiceFilePath: invoice.filePath,
          },
        }
        const createObj = await Order.create(AIRDATA)
        if (createObj) {
          res.status(201).json(createObj)
        } else {
          return res.status(400).send('Invalid data')
        }
      }
    }
  }

  if (!invoiceFile) {
    // FCL
    if (cargoType === 'FCL') {
      const FCLDATA = {
        destination,
        pickup,
        buyer,
        importExport,
        isHasInvoice,
        paymentMethod,
        isTemperatureControlled,
        movementType,
        noOfPackages: undefinedChecker(noOfPackages),
        transportationType,
        commodity: undefinedChecker(commodity),
        cargoDescription,
        cargoType,
        createdBy,
        trackingNo,
        shipment: selectedShipment,
        containerFCL,
      }
      const createObj = await Order.create(FCLDATA)
      if (createObj) {
        res.status(201).json(createObj)
      } else {
        return res.status(400).send('Invalid data')
      }
    }
    // LCL
    if (cargoType === 'LCL') {
      const LCLDATA = {
        destination,
        pickup,
        buyer,
        importExport,
        isHasInvoice,
        paymentMethod,
        isTemperatureControlled,
        movementType,
        noOfPackages: undefinedChecker(noOfPackages),
        transportationType,
        commodity: undefinedChecker(commodity),
        cargoDescription,
        cargoType,
        createdBy,
        trackingNo,
        shipment: selectedShipment,
        containerLCL,
      }
      const createObj = await Order.create(LCLDATA)
      if (createObj) {
        res.status(201).json(createObj)
      } else {
        return res.status(400).send('Invalid data')
      }
    }
    // AIR
    if (cargoType === 'AIR') {
      const AIRDATA = {
        destination,
        pickup,
        buyer,
        importExport,
        isHasInvoice,
        isTemperatureControlled,
        movementType,
        paymentMethod,
        noOfPackages: undefinedChecker(noOfPackages),
        transportationType,
        commodity: undefinedChecker(commodity),
        cargoDescription,
        cargoType,
        createdBy,
        trackingNo,
        shipment: selectedShipment,
        containerLCL,
      }
      const createObj = await Order.create(AIRDATA)
      if (createObj) {
        res.status(201).json(createObj)
      } else {
        return res.status(400).send('Invalid data')
      }
    }
  }
})

export default handler
