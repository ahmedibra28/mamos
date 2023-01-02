import Account from '../models/Account'
import Transaction from '../models/Transaction'

export const TransactionQuery = async ({
  type,
  code,
  cType,
  vendor,
  customer,
  amount,
  discount,
  createdBy,
  updatedBy,
  transactionType,
}) => {
  const acc = await Account.findOne({ code }, { _id: 1 })

  const newTransaction = {
    date,
    account: acc?._id,
    vendor: cType === 'vendor' ? vendor : undefined,
    customer: cType === 'customer' ? customer : undefined,
    amount: Number(amount),
    discount: Number(discount),
    createdBy,
    updatedBy,
    transactionType,
  }

  if (type === 'update') {
    const vc = cType === 'vendor' ? vendor : customer
    
    const trans = await Transaction.findOne({ account: acc?._id }, { _id: 1 })
  }
  if (type === 'new') {
    const transaction = await Transaction.create(newTransaction)
    return transaction
  }
}
