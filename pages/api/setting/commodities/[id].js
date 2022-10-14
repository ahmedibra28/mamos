import nc from 'next-connect'
import db from '../../../../config/db'
import Commodity from '../../../../models/Commodity'
import { isAuth } from '../../../../utils/auth'

const schemaName = Commodity
const schemaNameString = 'Commodity'

const handler = nc()
handler.use(isAuth)
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
      name: { $regex: `^${req.body.name.trim()}$`, $options: 'i' },
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
