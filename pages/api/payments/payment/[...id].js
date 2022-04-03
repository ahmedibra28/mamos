import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Payment from '../../../../models/Payment'
import { isAuth } from '../../../../utils/auth'
import moment from 'moment'

const handler = nc()

const modelName = 'Payment'
const constants = {
  model: Payment,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)

handler.delete(async (req, res) => {
  await dbConnect()

  console.log(req.body)
  console.log(req.query)

  const _id = req.query.id
  const obj = await constants.model.findById(_id)
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    // await obj.remove()

    res.json({ status: constants.success })
  }
})

export default handler
