import nc from 'next-connect'
import db from '../../../config/db'
import Container from '../../../models/Container'
import Order from '../../../models/Order'
import Transportation from '../../../models/Transportation'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Order
const schemaNameString = 'Order'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    let order = await schemaName
      .findById(id)
      .lean()
      .populate('createdBy', ['name'])
      .populate('pickUp.pickUpTown')
      .populate('pickUp.pickUpCountry')
      .populate('pickUp.pickUpSeaport')
      .populate('pickUp.pickUpAirport')
      .populate('dropOff.dropOffTown')
      .populate('dropOff.dropOffCountry')
      .populate('dropOff.dropOffSeaport')
      .populate('dropOff.dropOffAirport')
      .populate('other.transportation')
      .populate('other.transportation.container.container')
      .populate('other.commodity')

    if (!order) return res.status(404).json({ error: 'Order not found' })

    order.other.transportation = await Transportation.findById(
      order.other.transportation._id
    ).populate('container.container')

    const invoicePrice = order.other.isHasInvoice ? 0.0 : 200.0

    const pickUpPrice = order.pickUp.pickUpTown
      ? order.pickUp.pickUpTown.price
      : 0.0
    const dropOffPrice = order.dropOff.dropOffTown
      ? order.dropOff.dropOffTown.price
      : 0.0

    if (order.other.cargoType !== 'FCL') {
      const customerCBM = Number(
        order.other.containerLCL
          ?.reduce(
            (acc, curr) =>
              acc + (curr.length * curr.width * curr.height) / 1000,
            0
          )
          ?.toFixed(2)
      )

      const container = await Container.findById(
        order?.other?.transportation?.container[0]?.container,
        { details: 1 }
      )
      const containerCBM = container?.details?.CBM

      const containerPrice = order?.other?.transportation?.container[0]?.price
      const customerPrice = (containerPrice / containerCBM) * customerCBM

      let oldOrders = []
      if (order.other.cargoType === 'AIR') {
        oldOrders = await Order.find(
          {
            transportation: order._id,
            'other.cargoType': 'AIR',
            status: 'confirmed',
          },
          { 'other.containerLCL': 1 }
        )
      }

      if (order.other.cargoType === 'LCL') {
        oldOrders = await Order.find(
          {
            transportation: order._id,
            'other.cargoType': 'LCL',
            status: 'confirmed',
          },
          { 'other.containerLCL': 1 }
        )
      }

      const USED_CBM = oldOrders
        ?.map((o) => o?.other?.containerLCL)
        ?.flat(Infinity)
        ?.reduce(
          (acc, curr) =>
            acc +
            (Number(curr.length) * Number(curr.width) * Number(curr.height)) /
              1000,
          0
        )

      const price = {
        invoicePrice: priceFormat(invoicePrice),
        pickUpPrice: priceFormat(pickUpPrice),
        dropOffPrice: priceFormat(dropOffPrice),
        customerPrice: priceFormat(customerPrice),
        containerPrice: priceFormat(containerPrice),
        customerCBM: `${customerCBM} cubic meter`,
        containerCBM: `${containerCBM} cubic meter`,
        USED_CBM: USED_CBM,
        totalPrice: priceFormat(
          Number(invoicePrice) +
            Number(pickUpPrice) +
            Number(dropOffPrice) +
            Number(customerPrice)
        ),
      }

      return res.status(200).send({
        ...order,
        price,
      })
    }

    if (order.other.cargoType === 'FCL') {
      const containerInfo = order?.other?.containerFCL?.map((c) => ({
        name: c?.container?.name,
        CBM: c?.container?.details?.CBM,
        quantity: c?.quantity,
        price: c?.price,
      }))

      const customerCBM = containerInfo?.reduce(
        (acc, curr) => acc + Number(curr?.CBM) * Number(curr?.quantity),
        0
      )

      const customerPrice = containerInfo?.reduce(
        (acc, curr) => acc + Number(curr?.price) * Number(curr?.quantity),
        0
      )
      const containerCBM = containerInfo?.reduce(
        (acc, curr) => acc + Number(curr?.CBM) * Number(curr?.quantity),
        0
      )

      const price = {
        invoicePrice: priceFormat(invoicePrice),
        pickUpPrice: priceFormat(pickUpPrice),
        dropOffPrice: priceFormat(dropOffPrice),
        customerPrice: priceFormat(customerPrice),
        customerCBM: `${customerCBM} cubic meter`,
        containerCBM: `${containerCBM} cubic meter`,
        containerInfo: containerInfo,
        totalPrice: priceFormat(
          Number(invoicePrice) +
            Number(pickUpPrice) +
            Number(dropOffPrice) +
            Number(customerPrice)
        ),
      }

      return res.status(200).send({
        ...order,
        price,
      })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { name, status } = req.body

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check existence of object
    const exist = await schemaName.findOne({
      name: { $regex: `^${req.body?.name?.trim()}$`, $options: 'i' },
      _id: { $ne: id },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    object.name = name
    object.status = status
    object.updatedBy = req.user._id
    await object.save()
    res.status(200).send(`${schemaNameString} updated`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    await object.remove()
    res.status(200).send(`${schemaNameString} removed`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
