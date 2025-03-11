import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import { useContext } from 'react'

import Input from '@/components/Input'
import { ErrorResponse } from '@/types/utils.type'
import { AuthCredentials } from '@/types/auth.type'
import { handleAxios422Error, isAxios422Error } from '@/utils/error'
import { loginApi } from '@/apis/auth.api'
import { AppContext } from '@/contexts/app.context'
import Button from '@/components/Button'
import { formSchema, FormSchema } from '@/utils/validation'

type LoginFormData = Pick<FormSchema, 'email' | 'password'>
const loginSchema = formSchema.pick(['email', 'password'])

export default function Login() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  })

  const loginMutation = useMutation({
    mutationFn: (body: AuthCredentials) => loginApi(body)
  })

  const handleLoginSubmit = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
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
              onSubmit={handleLoginSubmit}
            >
              <div className='mb-8 text-2xl'>Đăng nhập</div>
              <Input<LoginFormData>
                type='email'
                placeholder='Email'
                name='email'
                register={register}
                errorMessage={errors?.email?.message}
              />
              <Input<LoginFormData>
                type='password'
                placeholder='Mật khẩu'
                name='password'
                register={register}
                errorMessage={errors?.password?.message}
                autoComplete='on'
                classNameVisible='absolute top-[14px] right-[10px] size-4 cursor-pointer'
              />
              <div>
                <Button
                  type='submit'
                  className='w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600'
                  isLoading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                >
                  Đăng nhập
                </Button>
              </div>
              <div className='flex items-center justify-center mt-8'>
                <span className='text-gray-400'>Bạn chưa có tài khoản?</span>
                <Link className='text-red-400 ml-1' to='/register'>
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
