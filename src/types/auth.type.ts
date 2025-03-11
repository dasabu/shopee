import { User } from './user.type'
import { SuccessResponse } from './utils.type'

export type AuthCredentials = {
  email: string
  password: string
}

export type AuthResponse = SuccessResponse<{
  access_token: string
  expires: number // access token
  refresh_token: string
  expires_refresh_token: number
  user: User
}>

export type RefreshTokenResponse = SuccessResponse<{
  access_token: string
}>

export type _401Response = {
  message: string
  name: string
}
