import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Users from '../../../../models/User'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const obj = await Users.find({}).lean().sort({ createdAt: -1 })
  res.send(obj)
})

export default handler
