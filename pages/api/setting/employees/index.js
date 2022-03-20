import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Employee from '../../../../models/Employee'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'Employee'
const constants = {
  model: Employee,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model.find({}).lean().sort({ createdAt: -1 })
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const { isActive, name, mobile, email, address, salary } = req.body
  const createdBy = req.user.id

  const exist = await constants.model.exists({ email: email.toLowerCase() })

  if (exist) {
    return res.status(400).send(constants.existed)
  }
  const createObj = await constants.model.create({
    name,
    mobile,
    email,
    address,
    salary,
    isActive,
    createdBy,
  })

  if (createObj) {
    res.status(201).json({ status: constants.success })
  } else {
    return res.status(400).send(constants.failed)
  }
})

export default handler
