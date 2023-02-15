import Account from '../models/Account'
import Transaction from '../models/Transaction'

export const TransactionQuery = async ({
  type,
  code,
  cType,
  vendor,
  Customer,
  amount,
  discount,
  createdBy,
  updatedBy,
  type,
}) => {
  const acc = await Account.findOne({ code }, { _id: 1 })

  const newTransaction = {
    date,
    account: acc?._id,
    vendor: cType === 'vendor' ? vendor : undefined,
    Customer: cType === 'Customer' ? Customer : undefined,
    amount: Number(amount),
    discount: Number(discount),
    createdBy,
    updatedBy,
    type,
  }

  if (type === 'update') {
    const vc = cType === 'vendor' ? vendor : Customer

    const trans = await Transaction.findOne({ account: acc?._id }, { _id: 1 })
  }
  if (type === 'new') {
    const transaction = await Transaction.create(newTransaction)
    return transaction
  }
}
