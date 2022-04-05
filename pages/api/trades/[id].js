import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Trade from '../../../models/Trade'
import { isAuth } from '../../../utils/auth'

const handler = nc()

const modelName = 'Trade'
const constants = {
  model: Trade,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const obj = await constants.model.findOne({
    _id,
    createdBy: req.user._id,
    status: 'pending',
  })
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    await obj.remove()

    res.json({ status: constants.success })
  }
})

export default handler
