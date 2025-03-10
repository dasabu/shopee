import { AuthResponse } from '@/types/auth.type'
import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import {
  clearLS,
  getAccessTokenFromLS,
  getProfileFromLS,
  saveAccessTokenToLS,
  saveProfileToLS
} from './auth'
import { User } from '@/types/user.type'

class AxiosClient {
  instance: AxiosInstance
  private accessToken: string
  private profile: User | null

  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.profile = getProfileFromLS()
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000, // 10s
      headers: {
        'Content-Type': 'application/json'
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
        // Đăng nhập/đăng ký: lưu access_token và user profile trả về trong response vào local storage
        if (url === '/login' || url === '/register') {
          const authResponse: AuthResponse = response.data
          this.accessToken = authResponse.data.access_token
          this.profile = authResponse.data.user
          saveAccessTokenToLS(this.accessToken)
          saveProfileToLS(this.profile)
        }
        // Đăng xuất: xoá access_token và user profile khỏi local storage
        else if (url === '/logout') {
          this.accessToken = ''
          this.profile = null
          clearLS()
        }
        return response
      },
      function (error: AxiosError) {
        if (error.response?.status !== 422) {
          const errorResponseData: any = error.response?.data
          const errorMessage = errorResponseData?.message || error.message
          toast.error(errorMessage)
        }
        if (error.response?.status === 401) {
          // clear local storage
          clearLS()
          // can use this command to reload page: window.location.reload()
          // but not recommended
        }
        return Promise.reject(error)
      }
    )
  }
}

const axiosInstance = new AxiosClient().instance

export default axiosInstance
