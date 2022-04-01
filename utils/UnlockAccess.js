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
  agent: ['agent'],
  admin_user: ['admin', 'user'],
  admin_hr: ['admin', 'hr'],
  admin_employee: ['admin', 'employee'],
  admin_logistic: ['admin', 'logistic'],
  admin_logistic_hr: ['admin', 'hr', 'logistic'],
  admin_logistic_agent: ['admin', 'agent', 'logistic'],
}
