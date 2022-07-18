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

    const order = await schemaName
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
      .populate('other.transportation.container')

    if (!order) return res.status(404).json({ error: 'Order not found' })

    const invoicePrice = order.isHasInvoice ? 0.0 : 200.0
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
        order?.other?.transportation?.container,
        { details: 1 }
      )
      const containerCBM = container?.details?.CBM

      const containerPrice = order.other.transportation.price
      const transportationPrice = (containerPrice / containerCBM) * customerCBM

      const price = {
        invoicePrice: priceFormat(invoicePrice),
        pickUpPrice: priceFormat(pickUpPrice),
        dropOffPrice: priceFormat(dropOffPrice),
        transportationPrice: priceFormat(transportationPrice),
        containerPrice: priceFormat(containerPrice),
        customerCBM: `${customerCBM} cubic meter`,
        containerCBM: `${containerCBM} cubic meter`,
      }
      return res.status(200).send({
        ...order,
        price,
      })
    }

    if (order.other.cargoType === 'FCL') {
      const customerCBM = Number(
        order.other.containerFCL
          ?.reduce(
            (acc, curr) =>
              acc + (curr.length * curr.width * curr.height) / 1000,
            0
          )
          ?.toFixed(2)
      )

      const data = Promise.all(
        order?.other?.containerFCL?.map(
          async (tr) =>
            await Transportation.findById(tr.transportation, {
              price: 1,
              cost: 1,
            })
        )
      )

      console.log(await data)

      // const container = await Container.findById(
      //   order?.other?.transportation?.container,
      //   { details: 1 }
      // )
      // const containerCBM = container?.details?.CBM

      // const containerPrice = order.other.transportation.price
      const transportationPrice = (containerPrice / containerCBM) * customerCBM

      const price = {
        invoicePrice: priceFormat(invoicePrice),
        pickUpPrice: priceFormat(pickUpPrice),
        dropOffPrice: priceFormat(dropOffPrice),

        transportationPrice: priceFormat(transportationPrice),
        containerPrice: priceFormat(containerPrice),
        customerCBM: `${customerCBM} cubic meter`,
        // containerCBM: `${containerCBM} cubic meter`,
      }
      return res.status(200).send({
        ...order,
        price,
      })
    }

    res.status(200).send(order)
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
    object.updatedBy = req.user.id
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
