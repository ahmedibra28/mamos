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
    let {
      importExport,
      isTemperatureControlled,
      containerLCL,
      USED_CBM,
      transportation,
      containerFCL,
      commodity,
      noOfPackages,
      cargoDescription,
      grossWeight,
    } = req.body

    const { role, _id } = req.user

    const admin = role === 'SUPER_ADMIN' && true

    const order = await schemaName
      .findOne(
        admin
          ? { _id: id, status: 'pending' }
          : { _id: id, status: 'pending', createdBy: _id }
      )
      .populate('other.transportation')

    if (!order || !order.other.importExport)
      return res.status(404).json({ error: 'Order not found' })

    if (order.other.cargoType !== 'FCL') {
      const containers = Promise.all(
        order?.other?.transportation.container.map(
          async (o) =>
            await Container.findOne({ status: 'active', _id: o.container })
        )
      )
      const containersArray = await containers

      const DEFAULT_CAPACITY_CONTAINERS = containersArray?.reduce(
        (acc, curr) =>
          acc +
          (Number(curr.length) * Number(curr.width) * Number(curr.height)) /
            1000,
        0
      )

      const REQUEST_CBM = containerLCL?.reduce(
        (acc, curr) =>
          acc +
          (Number(curr.length) * Number(curr.width) * Number(curr.height)) /
            1000,
        0
      )

      if (DEFAULT_CAPACITY_CONTAINERS < REQUEST_CBM + USED_CBM)
        return res
          .status(400)
          .json({ error: 'You have exceeded the maximum available CBM' })

      order.other.importExport = importExport
      order.other.isTemperatureControlled = isTemperatureControlled

      order.other.containerLCL = containerLCL

      await order.save()
      return res.status(200).send(order)
    }

    if (order.other.cargoType === 'FCL') {
      transportation = transportation._id
      if (containerFCL?.length === 0)
        return res
          .status(404)
          .json({ error: 'Please select at least one container' })

      order.other.importExport = importExport
      order.other.isTemperatureControlled = isTemperatureControlled
      order.other.containerFCL = containerFCL
      order.other.transportation = transportation
      order.other.commodity = commodity
      order.other.noOfPackages = noOfPackages
      order.other.cargoDescription = cargoDescription
      order.other.grossWeight = grossWeight

      await order.save()
      return res.status(200).send(order)
    }
    return res.status(404).json({ error: 'Invalid cargo type' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
