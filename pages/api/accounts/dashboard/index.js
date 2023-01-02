import nc from 'next-connect'
import db from '../../../../config/db'
import AccountType from '../../../../models/AccountType'
import { isAuth } from '../../../../utils/auth'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const obj = await AccountType.aggregate([
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: 'accountType',
          as: 'accounts',
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'accounts._id',
          foreignField: 'account',
          as: 'transactions',
        },
      },
      {
        $unset: [
          'accountType',
          'description',
          'status',
          'createdBy',
          'createdAt',
          'updatedAt',
          'updatedBy',
          '__v',
          // 'accounts.accountType',
          'accounts.description',
          'accounts.status',
          'accounts.createdBy',
          'accounts.createdAt',
          'accounts.updatedBy',
          'accounts.updatedAt',
          'accounts.__v',
          'transactions.createdBy',
          'transactions.createdAt',
          'transactions.updatedBy',
          'transactions.updatedAt',
          'transactions.__v',
        ],
      },
    ])

    const transactions = obj.map((t) => t.transactions).flat()
    const accounts = obj.map((t) => t.accounts).flat()

    const accountResults = []
    accounts.forEach((account) => {
      const tId = transactions.map((t) => t.account.toString())
      if (tId.includes(account._id.toString())) {
        accountResults.push({
          accountType: account.accountType.toString(),
          code: account.code,
          name: account.name,
          transactions: transactions.filter(
            (t) => t.account.toString() === account._id.toString()
          ),
          totalAmountTransactions: transactions
            .filter((t) => t.account.toString() === account._id.toString())
            ?.reduce((acc, cur) => acc + cur.amount, 0),
        })
      }
    })

    const finalResults = []
    obj.map((accT) => {
      const accId = accountResults.map((t) => t.accountType.toString())
      if (accId.includes(accT._id.toString())) {
        finalResults.push({
          accountType: accT.name,
          totalAmountAccounts: accountResults
            .filter((acc) => acc.accountType.toString() === accT._id.toString())
            .reduce((acc, cur) => acc + cur.totalAmountTransactions, 0),
          accounts: accountResults.filter(
            (acc) => acc.accountType.toString() === accT._id.toString()
          ),
        })
      }
    })

    res.json(finalResults)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
