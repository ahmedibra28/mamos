export const currency = (amount) =>
  amount?.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
