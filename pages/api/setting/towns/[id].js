import nc from 'next-connect'
import db from '../../../../config/db'
import Town from '../../../../models/Town'
import Country from '../../../../models/Country'
import { isAuth } from '../../../../utils/auth'
import Airport from '../../../../models/Airport'
import Seaport from '../../../../models/Seaport'

const schemaName = Town
const schemaNameString = 'Town'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    const { name, cost, price, country, seaport, airport, isPort, status } =
      req.body

    if (Number(cost) > Number(price))
      return res
        .status(404)
        .json({ error: 'Cost must be greater than price amount' })

    if (isPort) {
      if (!seaport)
        return res.status(404).json({ error: 'Seaport is required' })
    }
    if (!isPort) {
      if (!airport)
        return res.status(404).json({ error: 'Airport is required' })
    }

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check if status is active
    if (req.body.country) {
      const obj = await Country.findOne({
        country: req.body.country,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Country not found' })
    }
    if (req.body.airport) {
      const obj = await Airport.findOne({
        airport: req.body.airport,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Airport not found' })
    }
    if (req.body.seaport) {
      const obj = await Seaport.findOne({
        seaport: req.body.seaport,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Seaport not found' })
    }

    // check existence of object
    if (req.body.airport) {
      const exist = await schemaName.findOne({
        name: { $regex: `^${req.body?.name?.trim()}$`, $options: 'i' },
        country,
        airport,
        _id: { $ne: id },
      })

      if (exist)
        return res.status(400).json({ error: 'Duplicate value detected' })
    }

    if (req.body.seaport) {
      const exist = await schemaName.findOne({
        name: { $regex: `^${req.body?.name?.trim()}$`, $options: 'i' },
        country,
        seaport,
        _id: { $ne: id },
      })

      if (exist)
        return res.status(400).json({ error: 'Duplicate value detected' })
    }

    object.name = name
    object.cost = cost
    object.price = price
    object.country = country
    object.isPort = isPort
    object.airport = isPort ? undefined : airport
    object.seaport = isPort ? seaport : undefined
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
