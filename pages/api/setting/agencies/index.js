import nc from 'next-connect'
import db from '../../../../config/db'
import Agency from '../../../../models/Agency'
import Profile from '../../../../models/Profile'
import Role from '../../../../models/Role'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'
import { isAuth } from '../../../../utils/auth'

const schemaName = Agency

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = schemaName.find(
      q
        ? {
            $or: [
              { mobile: { $regex: q, $options: 'i' } },
              { name: { $regex: q, $options: 'i' } },
            ],
          }
        : {}
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q
        ? {
            $or: [
              { mobile: { $regex: q, $options: 'i' } },
              { name: { $regex: q, $options: 'i' } },
            ],
          }
        : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query.skip(skip).limit(pageSize).sort({ createdAt: -1 }).lean()

    const result = await query

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  await db()
  try {
    const { name, mobile, authEmail, authPassword } = req.body
    // check existence of object
    const exist = await schemaName.findOne({
      mobile: mobile?.trim(),
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate agency detected' })

    // create user authentication
    if (!authEmail || !authPassword)
      return res.status(404).json({ error: 'Authentication is required' })

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!regex.test(authPassword))
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character',
      })

    const existUser = await User.findOne({
      email: authEmail?.trim().toLowerCase(),
    })

    if (existUser)
      return res.status(400).json({ error: 'Duplicate user detected' })

    const object = await schemaName.create({
      ...req.body,
      createdBy: req.user._id,
    })
    if (!object)
      return res.status(400).json({ error: 'Invalid registration agency' })

    // create user agency
    const agencyUser = await User.create({
      name,
      email: authEmail,
      password: authPassword,
      confirmed: true,
      blocked: false,
    })
    if (!agencyUser)
      return res.status(400).json({
        error:
          'Failed to create user agency but agency is created successfully',
      })

    await Profile.create({
      user: agencyUser._id,
      name: agencyUser.name,
      address: req.body.address,
      phone: mobile,
      image: `https://ui-avatars.com/api/?uppercase=true&name=${agencyUser.name}&background=random&color=random&size=128`,
    })

    const role = await Role.findOne({ type: 'AGENCY' })
    await UserRole.create({
      user: agencyUser._id,
      role: role._id,
    })
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
