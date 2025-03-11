import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import { omit } from 'lodash'
import { toast } from 'react-toastify'
import { useContext } from 'react'

import { FormSchema, formSchema } from '@/utils/validation'
import Input from '@/components/Input'
import { handleAxios422Error, isAxios422Error } from '@/utils/error'
import { ErrorResponse } from '@/types/utils.type'
import { AuthCredentials } from '@/types/auth.type'
import { registerApi } from '@/apis/auth.api'
import { AppContext } from '@/contexts/app.context'
import Button from '@/components/Button'

type RegisterFormData = Pick<
  FormSchema,
  'email' | 'password' | 'confirm_password'
>
const registerSchema = formSchema.pick([
  'email',
  'password',
  'confirm_password'
])

export default function Register() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema)
  })

  const registerMutation = useMutation({
    mutationFn: (body: AuthCredentials) => registerApi(body)
  })

  const handleRegisterSubmit = handleSubmit((data) => {
    const body = omit(data, ['confirm_password'])
    registerMutation.mutate(body, {
      onSuccess: (data) => {
        setProfile(data.data.data.user)
        setIsAuthenticated(true)
        toast.success(data.data.message)
        navigate('/')
      },
      onError: (error) => {
        if (isAxios422Error<ErrorResponse<AuthCredentials>>(error)) {
          handleAxios422Error<AuthCredentials>(error, setError)
        }
      }
    })
  })

  return (
    <div className='bg-shopee_orange'>
      <div className='container'>
        <div className='grid grid-cols-1 md:px-52 sm:px-24 lg:grid-cols-5 py-12 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form
              className='p-10 rounded bg-white shadow-sm'
              noValidate
              onSubmit={handleRegisterSubmit}
            >
              <div className='mb-8 text-2xl'>Đăng ký</div>
              <Input<RegisterFormData>
                type='email'
                placeholder='Email'
                name='email'
                register={register}
                errorMessage={errors?.email?.message as string}
              />
              <Input<RegisterFormData>
                type='password'
                placeholder='Mật khẩu'
                name='password'
                register={register}
                errorMessage={errors?.password?.message as string}
                autoComplete='on'
                classNameVisible='absolute top-[14px] right-[10px] size-4 cursor-pointer'
              />
              <Input<RegisterFormData>
                type='password'
                placeholder='Nhập lại mật khẩu'
                name='confirm_password'
                register={register}
                errorMessage={errors?.confirm_password?.message as string}
                autoComplete='on'
                classNameVisible='absolute top-[14px] right-[10px] size-4 cursor-pointer'
              />
              <div className='mt-5'>
                <Button
                  type='submit'
                  className='w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600'
                  isLoading={registerMutation.isPending}
                  disabled={registerMutation.isPending}
                >
                  Đăng ký
                </Button>
              </div>
              <div className='flex items-center justify-center mt-8'>
                <span className='text-gray-400'>Bạn đã có tài khoản?</span>
                <Link className='text-red-400 ml-1' to='/login'>
                  Đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
