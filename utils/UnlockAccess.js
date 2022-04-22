import { customLocalStorage } from './customLocalStorage'

export const UnlockAccess = (roles) => {
  return roles.includes(
    customLocalStorage() &&
      customLocalStorage().userInfo &&
      customLocalStorage().userInfo.group
  )
}

export const Access = {
  admin: ['admin'],
  branch: ['branch'],
  logistic: ['logistic'],
  user: ['user'],
  trade: ['trade'],
  admin_user: ['admin', 'user'],
  admin_hr: ['admin', 'hr'],
  admin_employee: ['admin', 'employee'],
  admin_logistic: ['admin', 'logistic'],
  admin_logistic_hr: ['admin', 'hr', 'logistic'],
  admin_logistic_branch: ['admin', 'branch', 'logistic'],
}
