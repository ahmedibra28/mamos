import nc from 'next-connect'
import db from '../../../../config/db'
import Account from '../../../../models/Account'
import { isAuth } from '../../../../utils/auth'

const schemaName = Account
const schemaNameString = 'Account'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { code, name, type, openingBalance, description, status } = req.body

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    const exist = await schemaName.findOne({
      name: { $regex: `^${name?.trim()}$`, $options: 'i' },
      accountType,
      _id: { $ne: id },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate account type detected' })

    object.status = status
    object.name = name
    object.code = code
    object.type = type
    object.openingBalance = openingBalance
    object.description = description
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
