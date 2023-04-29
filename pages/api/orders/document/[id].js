import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    let { isHasInvoice, invoice } = req.body

    const { role, _id } = req.user

    const allowed = ['AUTHENTICATED']

    const order = await schemaName.findOne(
      !allowed.includes(role)
        ? {
            _id: id,
            status: 'Pending',
            type: { $in: ['FCL Booking', 'LCL Booking'] },
          }
        : {
            _id: id,
            status: 'Pending',
            type: { $in: ['FCL Booking', 'LCL Booking'] },
            createdBy: _id,
          }
    )

    // if (!order || !order.other.importExport)
    //   return res.status(404).json({ error: 'Order not found' })

    if (isHasInvoice && invoice) {
      order.other.invoice = invoice
      order.other.isHasInvoice = isHasInvoice
    }
    if (!isHasInvoice) {
      order.other.invoice = null
      order.other.isHasInvoice = isHasInvoice
    }

    await order.save()
    return res.status(200).send(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
