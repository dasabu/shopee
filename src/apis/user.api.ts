import { UpdateUserRequest, User } from '@/types/user.type'
import { SuccessResponse } from '@/types/utils.type'
import axiosInstance from '@/utils/axios'

export const getProfileApi = () => {
  return axiosInstance.get<SuccessResponse<User>>('/me')
}

export const updateProfileApi = (body: UpdateUserRequest) => {
  return axiosInstance.put<SuccessResponse<User>>('/user', body)
}

export const uploadAvatarApi = (body: FormData) => {
  return axiosInstance.post<SuccessResponse<string>>(
    '/user/upload-avatar',
    body,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}
