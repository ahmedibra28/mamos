import nc from 'next-connect'
import db from '../../../../config/db'
import Vendor from '../../../../models/Vendor'
import { isAuth } from '../../../../utils/auth'

const schemaName = Vendor
const schemaNameString = 'Vendor'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { name, mobile, email, address, status, type } = req.body

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    const exist = await Vendor.findOne({
      email: { $regex: `^${email?.trim()}$`, $options: 'i' },
      _id: { $ne: id },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate account type detected' })

    object.status = status
    object.name = name
    object.mobile = mobile
    object.type = type
    object.email = email
    object.address = address
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
