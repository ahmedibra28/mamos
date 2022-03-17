import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Income from '../../../models/Income'
import { isAuth } from '../../../utils/auth'
import moment from 'moment'

const handler = nc()

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const { category, startDate, endDate } = req.body

  if (startDate > endDate) {
    return res.status(400).send('Start date cannot be after end date')
  }

  const start = moment(startDate).clone().startOf('day').format()
  const end = moment(endDate).clone().endOf('day').format()

  const incomes = await Income.find({
    type: category,
    createdAt: {
      $gte: start,
      $lte: end,
    },
  })

  const total = incomes.reduce((acc, curr) => {
    return acc + curr.amount
  }, 0)

  res.status(200).json({
    incomes,
    total: total.toLocaleString(undefined, { minimumFractionDigits: 2 }),
  })
})

export default handler
