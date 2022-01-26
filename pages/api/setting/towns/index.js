import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Town from '../../../../models/Town'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

const modelName = 'town'
const constants = {
  model: Town,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.get(async (req, res) => {
  await dbConnect()
  const obj = await constants.model
    .find({})
    .lean()
    .sort({ createdAt: -1 })
    .populate('country')
    .populate('seaport')
    .populate('airport')
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const { isActive, name, seaport, airport, cost, isPort, country } = req.body
  const createdBy = req.user.id

  const exist = await constants.model.exists(
    isPort ? { name, seaport } : { name, airport }
  )

  if (exist) {
    return res.status(400).send(constants.existed)
  }
  const createObj = await constants.model.create({
    name,
    seaport: isPort ? seaport : null,
    airport: !isPort ? airport : null,
    country,
    isPort,
    cost,
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
