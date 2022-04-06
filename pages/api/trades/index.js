import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Trade from '../../../models/Trade'
import { isAuth } from '../../../utils/auth'
import fileUpload from 'express-fileupload'
import { upload } from '../../../utils/fileManager'
export const config = { api: { bodyParser: false } }

const handler = nc()
handler.use(fileUpload())

const modelName = 'trade'
const constants = {
  model: Trade,
  success: `New ${modelName} was created successfully`,
  failed: `New ${modelName} was not created successfully`,
  existed: `New ${modelName} was already existed`,
}

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const { group } = req.user
  const obj = await constants.model
    .find(group === 'logistic' ? {} : { createdBy: req.user._id })
    .lean()
    .sort({ createdAt: -1 })
    .populate('createdBy')
  res.send(obj)
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const files = req.files && req.files.file
  const createdBy = req.user.id

  // save files to server
  const filesPath = []
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = await upload({
        fileName: file,
        pathName: 'trade',
        fileType: 'image',
      })
      filesPath.push(filePath)
    }
  }

  const createObj = await constants.model.create({
    files: filesPath,
    description: req.body.description,
    status: 'pending',
    createdBy,
  })

  if (createObj) {
    res.status(201).json({ status: constants.success })
  } else {
    return res.status(400).send(constants.failed)
  }
})

export default handler
