import nc from 'next-connect'
import dbConnect from '../../../../../utils/db'
import Order from '../../../../../models/Order'
import { isAuth } from '../../../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  const { data, selectContainer } = req.body

  const updatedBy = req.user.id
  const _id = req.query.id

  const obj = await Order.findById(_id)

  if (obj) {
    let containerFCL = []
    for (let i = 0; i < selectContainer.length; i++) {
      containerFCL.push({
        container: selectContainer[i]._id,
        quantity: selectContainer[i].quantity,
      })
    }
    obj.cargoDescription = data.cargoDescription
    obj.containerFCL = containerFCL
    obj.commodity = data.commodity
    obj.noOfPackages = data.noOfPackages
    obj.isTemperature = data.isTemperature
    obj.grossWeight = data.grossWeight

    obj.updatedBy = updatedBy
    await obj.save()

    res.json({ status: 'success' })
  } else {
    return res.status(404).send('Order not found')
  }
})

export default handler
