import nc from 'next-connect'
import dbConnect from '../../../../../utils/db'
import Order from '../../../../../models/Order'
import { isAuth } from '../../../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  const { inputFields } = req.body

  console.log(inputFields)

  const updatedBy = req.user.id
  const _id = req.query.id

  const obj = await Order.findById(_id)

  if (obj) {
    obj.containerLCL = inputFields

    obj.updatedBy = updatedBy
    await obj.save()

    res.json({ status: 'success' })
  } else {
    return res.status(404).send('Order not found')
  }
})

export default handler