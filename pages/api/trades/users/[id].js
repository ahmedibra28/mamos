import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Trade from '../../../../models/Trade'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'Trade'
const constants = {
  model: Trade,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)
handler.put(async (req, res) => {
  await dbConnect()

  const { employee } = req.body
  const _id = req.query.id
  const obj = await constants.model.findOne({
    _id,
    status: 'accepted',
  })
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    obj.employee = employee
    await obj.save()

    res.json({ status: 'Trade has been accepted' })
  }
})

export default handler
