import nc from 'next-connect'
import db from '../../../../config/db'
import Seaport from '../../../../models/Seaport'
import Country from '../../../../models/Country'
import { isAuth } from '../../../../utils/auth'

const schemaName = Seaport
const schemaNameString = 'Seaport'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { name, country, status } = req.body

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check if status is active
    if (country) {
      const obj = await Country.findOne({
        country,
        status: 'active',
      })
      if (!obj) return res.status(404).json({ error: 'Country not found' })
    }

    // check existence of object
    const exist = await schemaName.findOne({
      name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' },
      country,
      _id: { $ne: id },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    object.name = name
    object.country = country
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
