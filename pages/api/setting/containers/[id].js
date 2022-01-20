import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Container from '../../../../models/Container'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'Container'
const constants = {
  model: Container,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)
handler.put(async (req, res) => {
  await dbConnect()

  const { isActive, name, height, width, length, payloadCapacity } = req.body
  const _id = req.query.id
  const updatedBy = req.user.id

  const obj = await constants.model.findById(_id)

  if (obj) {
    const exist = await constants.model.exists({
      _id: { $ne: _id },
      name,
      height,
      width,
      length,
    })
    if (!exist) {
      obj.name = name
      obj.payloadCapacity = payloadCapacity
      obj.height = height
      obj.width = width
      obj.length = length
      obj.isActive = isActive
      obj.updatedBy = updatedBy
      await obj.save()

      res.json({ status: constants.success })
    } else {
      return res.status(400).send(constants.failed)
    }
  } else {
    return res.status(404).send(constants.failed)
  }
})

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const obj = await constants.model.findById(_id)
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    await obj.remove()

    res.json({ status: constants.success })
  }
})

export default handler
