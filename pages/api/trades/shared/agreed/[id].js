import nc from 'next-connect'
import dbConnect from '../../../../../utils/db'
import Trade from '../../../../../models/Trade'
import { isAuth } from '../../../../../utils/auth'

const handler = nc()

const modelName = 'Trade'
const constants = {
  model: Trade,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)
// update trade status to accept and duration
handler.put(async (req, res) => {
  await dbConnect()

  const { status, _id } = req.body

  const obj = await constants.model.findOne({
    _id,
    // status: 'accepted',
  })
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    obj.status = status
    await obj.save()

    res.status(200).json({ status: 'Trade has been agreed' })
  }
})

export default handler
