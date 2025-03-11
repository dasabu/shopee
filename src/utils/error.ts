import { _401Response } from '@/types/auth.type'
import { ErrorResponse } from '@/types/utils.type'
import axios, { AxiosError } from 'axios'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'

// if these 'isAxios...error' functions return true -> typeof error = AxiosError
// else -> typeof error = never
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

export function isAxios401Error<T>(error: unknown): error is AxiosError<T> {
  return isAxiosError(error) && error.response?.status === 401
}

export function isAxiosExpiredTokenError<T>(
  error: unknown
): error is AxiosError<T> {
  return (
    isAxios401Error<ErrorResponse<_401Response>>(error) &&
    error.response?.data.data?.name === 'EXPIRED_TOKEN'
  )
}

export function isAxios422Error<T>(error: unknown): error is AxiosError<T> {
  return isAxiosError(error) && error.response?.status === 422
}

export function handleAxios422Error<T extends FieldValues>(
  error: AxiosError<ErrorResponse<T>>,
  setError: UseFormSetError<T>
) {
  // Trong trường hợp lỗi 422 thì error là object như sau (AuthCredentials)
  // error: AxiosError<ErrorResponse<AuthCredentials>>:
  //        message:  string
  //        code:     string
  //        response: ErrorResponse<AuthCredentials>
  //                  status: number
  //                  statusText: string
  //                  data: AuthCredentials
  //                        email: string
  //                        password: string

  // error.message: 'Request failed with status code 422'
  // error.code:    'ERR_BAD_REQUEST'
  // error.response
  //               .status:     422
  //               .statusText: ''
  //               .data
  //                    .message:    'Lỗi'
  //                    .data
  //                         .email?:    // If an error exists in the email input
  //                         .password?: // If an error exists in the password input
  const formError = error.response?.data?.data
  // Trong trường hợp object không có nhiều field (chỉ có email và password) thì có thể làm như sau:
  // if (authInputError?.email) {
  //   setError('email', {
  //     message: authInputError.email
  //   })
  // }
  // if (authInputError?.password) {
  //   setError('password', {
  //     message: authInputError.password
  //   })
  // }

  // Nhưng đối với object có rất nhiều field: lặp qua từng field và check

  if (formError) {
    Object.keys(formError).forEach((key) => {
      const errorMessage = formError[key as keyof T]
      if (typeof errorMessage === 'string') {
        setError(key as Path<T>, { message: errorMessage })
      }
    })
  }
}
