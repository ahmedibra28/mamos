import nc from 'next-connect'
import db from '../../../../config/db'
import Town from '../../../../models/Town'
import Country from '../../../../models/Country'
import { isAuth } from '../../../../utils/auth'
import Seaport from '../../../../models/Seaport'

const schemaName = Town
const schemaNameString = 'Town'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    const { name, cost, price, country, seaport, isPort, status } = req.body

    if (Number(cost) > Number(price))
      return res
        .status(404)
        .json({ error: 'Cost must be greater than price amount' })

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check if status is Active
    if (req.body.country) {
      const obj = await Country.findOne({
        _id: req.body.country,
        status: 'Active',
      })
      if (!obj) return res.status(404).json({ error: 'Country not found' })
    }

    if (req.body.seaport) {
      const obj = await Seaport.findOne({
        _id: req.body.seaport,
        status: 'Active',
      })
      if (!obj) return res.status(404).json({ error: 'Seaport not found' })
    }

    if (req.body.seaport) {
      const exist = await schemaName.findOne({
        name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' },
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
    object.seaport = seaport
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
