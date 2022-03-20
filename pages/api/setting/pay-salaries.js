import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import { isAuth } from '../../../utils/auth'
import Expense from '../../../models/Expense'
import moment from 'moment'

const handler = nc()

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const updatedBy = req.user.id
  const obj = req.body

  if (obj) {
    // get expense and check it duplicate within this month
    const expense = await Expense.findOne({
      employee: obj._id,
      createdAt: {
        $gte: moment().startOf('month').toDate(),
        $lte: moment().endOf('month').toDate(),
      },
    })

    if (expense) {
      return res
        .status(400)
        .send('This employee already paid salary for this month')
    }

    await Expense.create({
      type: `Salary`,
      amount: obj.salary,
      description: `Salary on ${moment().format('lll')} - Employee ${obj.name}`,
      employee: obj._id,
      createdBy: updatedBy,
    })

    res.json({ status: 'success' })
  } else {
    return res.status(500).send('Internal Server Error')
  }
})

export default handler
