import nc from 'next-connect'
import db from '../../../../config/db'
import Container from '../../../../models/Container'
import Order from '../../../../models/Order'
import Seaport from '../../../../models/Seaport'
import Tradelane from '../../../../models/Tradelane'
import Transportation from '../../../../models/Transportation'
import { isAuth } from '../../../../utils/auth'
import { undefinedChecker } from '../../../../utils/helper'

const schemaName = Transportation
const schemaNameString = 'Transportation'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const {
      vendor,
      transportationType,
      reference,
      cargoType,
      cost,
      price,
      departureSeaport,
      arrivalSeaport,
      departureDate,
      arrivalDate,
      vgmDate,
      storageFreeGateInDate,
      shippingInstructionDate,
      delayDate,
      status,
    } = req.body
    let container = req.body.container

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check existence of object
    const exist = await schemaName.findOne({
      reference: { $regex: `^${req.body.reference.trim()}$`, $options: 'i' },
      _id: { $ne: id },
    })
    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    const tempCost = Array.isArray(cost) ? cost[0] : cost
    const tempPrice = Array.isArray(price) ? price[0] : price

    if (cargoType !== 'FCL') {
      if (Number(tempCost) > Number(tempPrice))
        return res
          .status(404)
          .json({ error: 'Cost must be less than price amount' })
    }

    if (
      arrivalDate < departureDate ||
      arrivalDate > delayDate ||
      departureDate < vgmDate ||
      departureDate < storageFreeGateInDate ||
      departureDate < shippingInstructionDate
    )
      return res.status(400).json({
        error:
          'Arrival date must be after (storage free gate in date, shipping instructions date and VGM date)',
      })
    container = Array.isArray(container) ? container : [container]

    container.map(async (c) => {
      const containerObj = await Container.findOne({
        _id: c,
        status: 'active',
      })
      if (!containerObj)
        return res.status(404).json({ error: 'Container not found' })
    })

    // FCL Container structuring
    if (cargoType === 'FCL') {
      const containerLength = container.length

      const costAmount = Array.isArray(cost)
        ? cost
        : cost.split(',').map((c) => c.trim())

      const priceAmount = Array.isArray(price)
        ? price
        : price.split(',').map((c) => c.trim())

      if (
        containerLength !== costAmount.length ||
        containerLength !== priceAmount.length
      ) {
        return res.status(400).json({ error: 'Container or price mismatched' })
      }

      const result = container.map((c, i) => {
        if (Number(costAmount[i]) > Number(priceAmount[i]))
          return res
            .status(404)
            .json({ error: 'Cost must be greater than price amount' })

        return {
          container: c,
          cost: costAmount[i],
          price: priceAmount[i],
        }
      })
      container = result
    }

    if (cargoType !== 'FCL') {
      container = container.map((c) => ({
        container: c,
        cost: tempCost,
        price: tempPrice,
      }))
    }

    // check if status is active
    if (departureSeaport || arrivalSeaport) {
      const departure = await Seaport.findOne({
        _id: departureSeaport,
        status: 'active',
      })
      const arrival = await Seaport.findOne({
        _id: arrivalSeaport,
        status: 'active',
      })
      if (!departure || !arrival)
        return res
          .status(404)
          .json({ error: 'Departure or arrival seaport not found' })
    }

    object.vendor = vendor
    object.transportationType = transportationType
    object.cargoType = cargoType
    object.container = container
    object.reference = reference
    object.departureSeaport = undefinedChecker(departureSeaport)
    object.arrivalSeaport = undefinedChecker(arrivalSeaport)
    object.departureDate = departureDate
    object.arrivalDate = arrivalDate
    object.vgmDate = vgmDate
    object.storageFreeGateInDate = storageFreeGateInDate
    object.shippingInstructionDate = shippingInstructionDate
    object.delayDate = delayDate
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

    const tradelane = await Tradelane.findOne({ transportation: id })

    const orders = await Order.find({ 'other.transportation': id }, { _id: 1 })

    if (orders.length > 0) {
      orders.forEach(async (order) => {
        await Order.remove({ _id: order._id })
      })
    }
    if (tradelane) {
      await tradelane.remove()
    }
    await object.remove()

    res.status(200).send(`${schemaNameString} removed`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
