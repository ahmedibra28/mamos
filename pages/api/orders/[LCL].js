import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const { LCL } = req.query

  console.log(req.query)

  const shipment = await Order.find({ shipment: LCL }).populate('shipment')
  return res.status(200).json(shipment)
})

export default handler
