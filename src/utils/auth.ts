import { User } from '@/types/user.type'
import { CLEAR_LS_EVENT } from './constants'

export const LocalStorageEventTarget = new EventTarget()

/**
 * Local Storage
 */
export const saveAccessTokenToLS = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const clearAccessTokenFromLS = () => {
  localStorage.removeItem('access_token')
}

export const getAccessTokenFromLS = () => {
  return localStorage.getItem('access_token') || ''
}

/**
 * Profile
 */

export const saveProfileToLS = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}

export const getProfileFromLS = () => {
  const profile = localStorage.getItem('profile')
  return profile ? JSON.parse(profile) : null
}

export const clearProfileFromLS = () => {
  localStorage.removeItem('profile')
}

export const clearLS = () => {
  clearAccessTokenFromLS()
  clearProfileFromLS()
  LocalStorageEventTarget.dispatchEvent(new Event(CLEAR_LS_EVENT))
}
