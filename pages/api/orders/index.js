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

  const trackingNo =
    req.query && req.query.search && req.query.search.toUpperCase()

  let query = Order.find(trackingNo ? { trackingNo } : {})
  const total = await Order.countDocuments(trackingNo ? { trackingNo } : {})

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
    .populate('destination.dropOffTown')
    .populate('pickup.pickUpTown')
    .populate('pickup.pickupCountry')
    .populate('pickup.pickupPort')
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
  } = req.body
  const {
    pickUpAddress,
    pickUpCity,
    pickUpPostalCode,
    pickUpTown,
    pickUpWarehouseName,
    pickupCountry,
    pickupPort,
  } = req.body
  const {
    grossWeight,
    importExport,
    isHasInvoice,
    isTemperatureControlled,
    movementType,
    noOfPackages,
    transportationType,
    commodity,
    selectedShipment,
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
    destPort,
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
    pickupPort,
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

  if (cargoType === 'LCL') {
    containerLCL = JSON.parse(req.body.inputFields)
  }

  if (invoiceFile) {
    const invoice = await upload({
      fileName: invoiceFile,
      fileType: 'image',
      pathName: 'invoice',
    })

    if (invoice) {
      if (cargoType === 'FCL' || cargoType === 'LCL') {
        const FCLData = {
          destination,
          pickup,
          buyer,
          grossWeight: undefinedChecker(grossWeight),
          importExport,
          isHasInvoice,
          isTemperatureControlled,
          movementType,
          noOfPackages: undefinedChecker(noOfPackages),
          transportationType,
          commodity: undefinedChecker(commodity),
          cargoDescription,
          cargoType,
          createdBy,
          trackingNo,
          selectedShipment,
          containerFCL,
          containerLCL,
          invoiceFile: {
            invoiceFileName: invoice.fullFileName,
            invoiceFilePath: invoice.filePath,
          },
        }
        const createObj = await Order.create(FCLData)
        if (createObj) {
          res.status(201).json({ status: 'success' })
        } else {
          return res.status(400).send('Invalid data')
        }
      }
    }
  }

  if (!invoiceFile) {
    if (cargoType === 'FCL' || cargoType === 'LCL') {
      const FCLData = {
        destination,
        pickup,
        buyer,
        grossWeight: undefinedChecker(grossWeight),
        importExport,
        isHasInvoice,
        isTemperatureControlled,
        movementType,
        noOfPackages: undefinedChecker(noOfPackages),
        transportationType,
        commodity: undefinedChecker(commodity),
        cargoDescription,
        cargoType,
        createdBy,
        trackingNo,
        selectedShipment,
        containerFCL,
        containerLCL,
      }
      const createObj = await Order.create(FCLData)
      if (createObj) {
        res.status(201).json({ status: 'success' })
      } else {
        return res.status(400).send('Invalid data')
      }
    }
  }
})

export default handler
