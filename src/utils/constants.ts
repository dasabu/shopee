export const SORT_BY = {
  CREATED_AT: 'createdAt',
  VIEW: 'view',
  SOLD: 'sold',
  PRICE: 'price'
} as const

export const ORDER = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export const PURCHASES_STATUS = {
  IN_CART: -1,
  ALL: 0,
  WAIT_FOR_CONFIRMATION: 1,
  WAIT_FOR_GETTING: 2,
  IN_PROGRESS: 3,
  DELIVERED: 4,
  CANCELLED: 5
} as const

export const CLEAR_LS_EVENT = 'clearLS'
