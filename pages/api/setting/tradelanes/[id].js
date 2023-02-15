import nc from 'next-connect'
import db from '../../../../config/db'
import Tradelane from '../../../../models/Tradelane'
import Transaction from '../../../../models/Transaction'
import { isAuth } from '../../../../utils/auth'

const schemaName = Tradelane
const schemaNameString = 'Tradelane'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { id } = req.query
    const { transportation, tradelane, status } = req.body

    if (!tradelane || !transportation)
      return res.status(404).json({ error: 'All fields are required' })

    if (tradelane.length === 0)
      return res.status(404).json({ error: `Tradelane can't be empty` })

    const object = await schemaName.findById(id)
    if (!object)
      return res.status(400).json({ error: `${schemaNameString} not found` })

    const transportationObj = await Transaction.findOne({
      _id: transportation,
      status: 'Pending',
    })
    if (!transportationObj)
      return res.status(404).json({ error: 'Transaction not found' })

    object.transportation = transportation
    object.tradelane = tradelane
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

    object.status = 'Cancelled'
    await object.save()
    res.status(200).send(`${schemaNameString} removed`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
