import { updateProfileApi } from '@/apis/user.api'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { ErrorResponse } from '@/types/utils.type'
import { handleAxios422Error, isAxios422Error } from '@/utils/error'
import { userSchema, UserSchema } from '@/utils/validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { omit } from 'lodash'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

type ChangePasswordFormData = Pick<
  UserSchema,
  'password' | 'new_password' | 'confirm_password'
>

const changePasswordSchema = userSchema.pick([
  'password',
  'new_password',
  'confirm_password'
])

export default function ChangePassword() {
  const {
    register,
    formState: { errors },
    setError,
    handleSubmit,
    reset
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      password: '',
      new_password: '',
      confirm_password: ''
    },
    resolver: yupResolver(changePasswordSchema)
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await updateProfileMutation.mutateAsync(
        omit(data, ['confirm_password'])
      )
      toast.success(response.data.message)
      reset()
    } catch (error) {
      if (isAxios422Error<ErrorResponse<ChangePasswordFormData>>(error)) {
        handleAxios422Error<ChangePasswordFormData>(error, setError)
      }
    }
  })

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>
          Đổi mật khẩu
        </h1>
        <div className='mt-1 text-sm text-gray-700'>
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </div>
      </div>
      <form onSubmit={onSubmit} className='mt-8 mr-auto max-w-2xl'>
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          {/* Mật khẩu cũ */}
          <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[25%] sm:text-right'>
              Mật khẩu cũ
            </div>
            <div className='sm:w-[75%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative'
                register={register}
                name='password'
                placeholder='Nhập mật khẩu cũ'
                errorMessage={errors.password?.message}
                type='password'
              />
            </div>
          </div>
          {/* Mật khẩu mới */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[25%] sm:text-right'>
              Mật khẩu mới
            </div>
            <div className='sm:w-[75%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative'
                register={register}
                name='new_password'
                placeholder='Nhập mật khẩu mới'
                errorMessage={errors.new_password?.message}
                type='password'
              />
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[25%] sm:text-right'>
              Xác nhận mật khẩu mới
            </div>
            <div className='sm:w-[75%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                className='relative'
                register={register}
                name='confirm_password'
                placeholder='Nhập lại mật khẩu mới'
                errorMessage={errors.confirm_password?.message}
                type='password'
              />
            </div>
          </div>

          {/* Button */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right' />
            <div className='sm:w-[80%] sm:pl-5'>
              <Button
                className='flex h-9 items-center bg-shopee_orange px-5 text-center text-sm text-white hover:bg-shopee_orange/80 rounded-sm'
                type='submit'
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
