import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import DeliveryMode from '../../../models/DeliveryMode'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()

  if (req.user.group !== 'agent') {
    return res.status(401).send('Your are not authorized this request')
  }

  const modes = await DeliveryMode.find({}).lean().sort({ createdAt: -1 })

  res.status(200).json(modes)
})

export default handler
