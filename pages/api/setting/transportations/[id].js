import nc from 'next-connect'
import db from '../../../../config/db'
import Airport from '../../../../models/Airport'
import Container from '../../../../models/Container'
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
      name,
      transportationType,
      cargoType,
      cost,
      price,
      departureSeaport,
      arrivalSeaport,
      departureAirport,
      arrivalAirport,
      departureDate,
      arrivalDate,
      status,
    } = req.body
    let container = req.body.container

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    if (cargoType !== 'FCL') {
      if (Number(cost) > Number(price))
        return res
          .status(404)
          .json({ error: 'Cost must be less than price amount' })
    }

    if (arrivalDate < departureDate)
      return res
        .status(400)
        .json({ error: 'Arrival date must be after departure date' })

    container = Array.isArray(container) ? container : [container]

    container?.map(async (c) => {
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

      const cost = Array.isArray(cost)
        ? cost
        : cost.split(',')?.map((c) => c.trim())

      const price = Array.isArray(price)
        ? price
        : price.split(',')?.map((c) => c.trim())

      if (containerLength !== cost.length || containerLength !== price.length) {
        return res.status(400).json({ error: 'Container or price mismatched' })
      }

      const result = container.map((c, i) => {
        if (Number(cost[i]) > Number(price[i]))
          return res
            .status(404)
            .json({ error: 'Cost must be greater than price amount' })

        return {
          container: c,
          cost: cost[i],
          price: price[i],
        }
      })
      container = result
    }

    if (cargoType !== 'FCL') {
      container = container.map((c) => ({ container: c, cost, price }))
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

    if (departureAirport || arrivalAirport) {
      const departure = await Airport.findOne({
        _id: departureAirport,
        status: 'active',
      })
      const arrival = await Airport.findOne({
        _id: arrivalAirport,
        status: 'active',
      })
      if (!departure || !arrival)
        return res
          .status(404)
          .json({ error: 'Departure or arrival airport not found' })
    }

    object.name = name
    object.transportationType = transportationType
    object.cargoType = cargoType
    object.container = container
    object.departureSeaport = undefinedChecker(departureSeaport)
    object.arrivalSeaport = undefinedChecker(arrivalSeaport)
    object.departureAirport = undefinedChecker(departureAirport)
    object.arrivalAirport = undefinedChecker(arrivalAirport)
    object.departureDate = departureDate
    object.arrivalDate = arrivalDate
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

    const tradelane = await Tradelane.findOne({ transportation: id })

    await object.remove()
    await tradelane.remove()

    res.status(200).send(`${schemaNameString} removed`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
