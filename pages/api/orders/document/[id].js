import nc from 'next-connect'
import db from '../../../../config/db'
import Container from '../../../../models/Container'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    let { isHasInvoice, invoice } = req.body

    const { role, _id } = req.user

    const admin = role === 'SUPER_ADMIN' && true

    const order = await schemaName.findOne(
      admin
        ? { _id: id, status: 'pending' }
        : { _id: id, status: 'pending', createdBy: _id }
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
