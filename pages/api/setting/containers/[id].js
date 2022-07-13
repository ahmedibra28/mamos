import nc from 'next-connect'
import db from '../../../../config/db'
import Container from '../../../../models/Container'
import { isAuth } from '../../../../utils/auth'

const schemaName = Container
const schemaNameString = 'Container'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { name, length, width, height, status } = req.body

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    // check existence of object
    const exist = await schemaName.findOne({
      name: { $regex: `^${name?.trim()}$`, $options: 'i' },
      _id: { $ne: id },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate value detected' })

    const totalCBM = (Number(length) * Number(width) * Number(height)) / 1000

    const additionalData = {
      CBM: totalCBM,
      airFreight: totalCBM * 167,
      seaFreight: totalCBM * 1000,
      roadFreightNational: totalCBM * 300,
      roadFreightInternational: totalCBM * 333,
    }

    object.name = name
    object.length = length
    object.width = width
    object.height = height
    object.details = additionalData
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
