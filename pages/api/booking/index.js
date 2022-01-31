import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Group from '../../../models/Group'
import { isAuth } from '../../../utils/auth'
import fileUpload from 'express-fileupload'
import { upload } from '../../../utils/fileManager'
export const config = { api: { bodyParser: false } }

const handler = nc()
handler.use(fileUpload())

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()
  const createdBy = req.user.id
  console.log(req.body)

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
  } = req.body

  const buyer = {
    buyerAddress,
    buyerEmail,
    buyerMobileNumber,
    buyerName,
  }
  const destination = {
    destAddress,
    destCity,
    destCountry,
    destPort,
    destPostalCode,
    destWarehouseName,
    dropOffTown,
  }
  const pickup = {
    pickUpAddress,
    pickUpCity,
    pickUpPostalCode,
    pickUpTown,
    pickUpWarehouseName,
    pickupCountry,
    pickupPort,
  }

  if (cargoType === 'FCL') {
  }

  //   const name = req.body.name.toLowerCase()

  //   const exist = await Group.findOne({ name })
  //   if (exist) {
  //     return res.status(400).send('Group already exist')
  //   }
  //   const createObj = await Group.create({
  //     name,
  //     isActive,
  //     createdBy,
  //     route,
  //   })
  const createObj = 'Hello'

  if (createObj) {
    res.status(201).json({ status: 'success' })
  } else {
    return res.status(400).send('Invalid data')
  }
})

export default handler
