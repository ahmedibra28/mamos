import nc from 'next-connect'
import dbConnect from '../../../../../utils/db'
import Order from '../../../../../models/Order'
import { isAuth } from '../../../../../utils/auth'
import fileUpload from 'express-fileupload'
import { upload } from '../../../../../utils/fileManager'
export const config = { api: { bodyParser: false } }

const handler = nc()
handler.use(fileUpload())

handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  console.log(req.url)

  const invoiceFile = req.files && req.files.invoiceFile
  const { isHasInvoice } = req.body
  const updatedBy = req.user.id
  const _id = req.query.id

  // console.log({
  //   isHasInvoice,
  //   invoiceFile,
  //   updatedBy,
  //   _id,
  // })
  const obj = await Order.findById(_id)

  if (obj) {
    if (invoiceFile && isHasInvoice) {
      const invoice = await upload({
        fileName: invoiceFile,
        fileType: 'image',
        pathName: 'invoice',
      })

      if (invoice) {
        obj.invoiceFile = {
          invoiceFileName: invoice.fullFileName,
          invoiceFilePath: invoice.filePath,
        }
        obj.updatedBy = updatedBy
        obj.isHasInvoice = isHasInvoice
        await obj.save()
      }
    }
    if (!isHasInvoice && invoiceFile) {
      obj.isHasInvoice = null
      obj.isHasInvoice = false
      obj.updatedBy = updatedBy
      await obj.save()
    }

    if (isHasInvoice && !invoiceFile) {
      obj.updatedBy = updatedBy
      await obj.save()
    }
    res.json({ status: 'success' })
  } else {
    return res.status(404).send('Order not found')
  }
})

export default handler
