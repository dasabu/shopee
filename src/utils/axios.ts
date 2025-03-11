import {
  _401Response,
  AuthResponse,
  RefreshTokenResponse
} from '@/types/auth.type'
import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import {
  clearLS,
  getAccessTokenFromLS,
  getProfileFromLS,
  getRefreshTokenFromLS,
  saveAccessTokenToLS,
  saveProfileToLS,
  saveRefreshTokenToLS
} from './auth'
import { User } from '@/types/user.type'
import { isAxios401Error, isAxiosExpiredTokenError } from './error'
import { ErrorResponse } from '@/types/utils.type'

const URL_REFRESH_TOKEN = 'refresh-access-token'
class AxiosClient {
  instance: AxiosInstance
  private accessToken: string
  private profile: User | null

  private refreshToken: string
  refreshTokenRequest: Promise<string> | null

  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.profile = getProfileFromLS()
    this.refreshToken = getRefreshTokenFromLS()
    this.refreshTokenRequest = null

    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000, // 10s
      headers: {
        'Content-Type': 'application/json',
        'expire-access-token': 10, // 10s
        'expire-refresh-token': 60 * 60 // 1h
      }
    })
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Đính kèm access_token vào headers.authorization trước khi gửi request
        if (this.accessToken && config.headers) {
          config.headers.Authorization = this.accessToken // Token đã có 'Bearer '
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        console.log('url: ', url)
        // Đăng nhập/đăng ký: lưu access_token và user profile trả về trong response vào local storage
        if (url === '/login' || url === '/register') {
          const authResponse: AuthResponse = response.data
          this.accessToken = authResponse.data.access_token
          this.profile = authResponse.data.user
          this.refreshToken = authResponse.data.refresh_token

          saveAccessTokenToLS(this.accessToken)
          saveProfileToLS(this.profile)
          saveRefreshTokenToLS(this.refreshToken)
        }
        // Đăng xuất: xoá access_token và user profile khỏi local storage
        else if (url === '/logout') {
          clearLS()
          this.accessToken = ''
          this.profile = null
          this.refreshToken = ''
        }
        return response
      },
      (error: AxiosError) => {
        // Chỉ toast lỗi không phải 401 và 422
        if (![422, 401].includes(error.response?.status as number)) {
          const errorResponseData: any = error.response?.data
          const errorMessage = errorResponseData?.message || error.message
          toast.error(errorMessage)
        }
        if (isAxios401Error<ErrorResponse<_401Response>>(error)) {
          /**
           * Case: Token expired + Không phải request refresh access token
           * -> Call API refresh token
           */
          const config = error.response?.config
          if (
            isAxiosExpiredTokenError(error) &&
            config?.url !== URL_REFRESH_TOKEN
          ) {
            // Hạn chế gọi 2 lần handleRefreshToken()
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  /**
                   * Giữ refreshTokenRequest trong 10s (bé hơn expired time của refresh token)
                   * cho những request tiếp theo nếu có 401 thì dùng
                   */
                  setTimeout(() => {
                    this.refreshTokenRequest = null
                  }, 10000)
                })
            return this.refreshTokenRequest.then((access_token) => {
              if (config?.headers) config.headers.Authorization = access_token
              // Tiếp tục lại request cũ bị lỗi
              return this.instance({
                ...config,
                headers: { ...config!.headers, Authorization: access_token }
              })
            })
          }
          /**
           * Case: Token không đúng || Không truyền token || Token hết hạn + Gọi refresh token bị failed
           * -> Xoá Local Storage + toast message lỗi
           */
          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
          this.profile = null
          toast.error(
            error.response?.data.data?.message || error.response?.data.message
          )
          // can use this command to reload page: window.location.reload() but not recommended
        }
        return Promise.reject(error)
      }
    )
  }

  private handleRefreshToken() {
    return this.instance
      .post<RefreshTokenResponse>(URL_REFRESH_TOKEN, {
        refresh_token: this.refreshToken
      })
      .then((res) => {
        const { access_token } = res.data.data
        this.accessToken = access_token
        saveAccessTokenToLS(access_token)
        return access_token
      })
      .catch((error) => {
        clearLS()
        this.accessToken = ''
        this.refreshToken = ''
        this.profile = null
        throw error
      })
  }
}

const axiosInstance = new AxiosClient().instance

export default axiosInstance
