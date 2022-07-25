import moment from 'moment'

export const undefinedChecker = (property) =>
  property !== '' ? property : null

export const getDays = (start, end) =>
  Number(
    moment(new Date(start))
      .diff(moment(new Date(end)), 'days')
      .toLocaleString()
  )
