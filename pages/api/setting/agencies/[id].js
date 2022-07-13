import nc from 'next-connect'
import db from '../../../../config/db'
import Agency from '../../../../models/Agency'
import { isAuth } from '../../../../utils/auth'
import { cities } from '../../../../utils/data'

const schemaName = Agency
const schemaNameString = 'Agency'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { name, contactPerson, mobile, email, address, city, status } =
      req.body

    const cityValidate = cities.map((city) => `${city.city} - ${city.country}`)

    if (!cityValidate.includes(city))
      return res.status(404).json({ error: 'Invalid city' })

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check existence of object
    const exist = await schemaName.findOne({
      mobile: req.body?.mobile?.trim(),
      _id: { $ne: id },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    object.name = name
    object.contactPerson = contactPerson
    object.mobile = mobile
    object.email = email
    object.address = address
    object.city = city
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
