export const priceFormat = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const reversePriceFormat = (amount) => {
  let result = amount?.toString()?.replace('$', '')
  if (result.includes(',')) {
    result = result?.replace(',', '')
    return result
  }

  return result
}
