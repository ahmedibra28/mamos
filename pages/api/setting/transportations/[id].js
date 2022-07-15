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
      container,
      departureSeaport,
      arrivalSeaport,
      departureAirport,
      arrivalAirport,
      departureDate,
      arrivalDate,
      status,
    } = req.body

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    if (Number(cost) > Number(price))
      return res
        .status(404)
        .json({ error: 'Cost must be greater than price amount' })

    if (arrivalDate < departureDate)
      return res
        .status(400)
        .json({ error: 'Arrival date must be after departure date' })

    const containerObj = await Container.findOne({
      _id: container,
      status: 'active',
    })
    if (!containerObj)
      return res.status(404).json({ error: 'Container not found' })

    // check if status is active
    if (departureSeaport || arrivalSeaport) {
      const departure = await Seaport.findOne({
        _id: departureSeaport,
        status: 'active',
      })
      const arrival = await Seaport.findOne({
        _id: airportSeaport,
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
        _id: airportAirport,
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
    object.cost = cost
    object.price = price
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
