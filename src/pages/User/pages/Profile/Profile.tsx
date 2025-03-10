import {
  getProfileApi,
  updateProfileApi,
  uploadAvatarApi
} from '@/apis/user.api'
import Button from '@/components/Button'
import Input from '@/components/Input'
import InputNumber from '@/components/InputNumber'
import { userSchema, UserSchema } from '@/utils/validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import DateSelect from '../../components/DateSelect'
import { toast } from 'react-toastify'
import { AppContext } from '@/contexts/app.context'
import { saveProfileToLS } from '@/utils/auth'
import { getAvatarUrl } from '@/utils/avatar'
import { handleAxios422Error } from '@/utils/error'
import { MAX_FILE_SIZE } from '@/utils/constants'

type ProfileFormData = Pick<
  UserSchema,
  'name' | 'address' | 'phone' | 'date_of_birth' | 'avatar'
>

type ProfileFormDataError = Omit<ProfileFormData, 'date_of_birth'> & {
  date_of_birth?: string
}

const profileSchema = userSchema.pick([
  'name',
  'address',
  'phone',
  'date_of_birth',
  'avatar'
])

export default function Profile() {
  const { setProfile } = useContext(AppContext)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File>()
  const previewImage = useMemo(
    () => (file ? URL.createObjectURL(file) : ''),
    [file]
  )
  /**
   * Form declaration
   */
  const {
    register,
    control,
    formState: { errors },
    setError,
    setValue,
    handleSubmit,
    watch
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      date_of_birth: new Date(1990, 0, 1), // 01/01/1990
      avatar: ''
    },
    resolver: yupResolver(profileSchema)
  })
  const avatarForm = watch('avatar')

  /**
   * Get Profile
   */
  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi
  })
  const profile = profileData?.data.data

  /**
   * Update form to display data
   */
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name)
      setValue('address', profile.address)
      setValue('phone', profile.phone)
      setValue(
        'date_of_birth',
        profile.date_of_birth
          ? new Date(profile.date_of_birth)
          : new Date(1990, 0, 1)
      )
      setValue('avatar', profile.avatar)
    }
  }, [profile, setValue])

  /**
   * Update profile API
   */
  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi
  })
  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatarApi
  })

  const handleSubmitUpdate = handleSubmit(async (data) => {
    try {
      let avatarName = avatarForm
      if (file) {
        const form = new FormData()
        form.append('image', file)
        const uploadResponse = await uploadAvatarMutation.mutateAsync(form)
        avatarName = uploadResponse.data.data
        setValue('avatar', avatarName)
      }
      const response = await updateProfileMutation.mutateAsync({
        ...data,
        date_of_birth: data.date_of_birth?.toISOString(),
        avatar: avatarName
      })
      refetch()
      toast.success(response.data.message)
      setProfile(response.data.data)
      saveProfileToLS(response.data.data)
    } catch (error) {
      handleAxios422Error<ProfileFormDataError>(error, setError)
    }
  })

  /**
   * Upload avatar
   */
  const handleUploadAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      if (uploadedFile.size >= MAX_FILE_SIZE) {
        toast.error(
          'Dung lượng file tải lên vượt quá kích thước cho phép (1 MB)'
        )
      } else if (!uploadedFile.type.includes('image')) {
        toast.error('File không đúng định dạng (.JPG, .JPEG, .PNG)')
      } else {
        setFile(uploadedFile)
      }
    }
  }

  return (
    <div className='rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      <div className='border-b border-b-gray-200 py-6'>
        <h1 className='text-lg font-medium capitalize text-gray-900'>
          Hồ Sơ Của Tôi
        </h1>
        <div className='mt-1 text-sm text-gray-700'>
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </div>
      </div>
      <form
        onSubmit={handleSubmitUpdate}
        className='mt-8 flex flex-col-reverse md:flex-row md:items-start'
      >
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          {/* Email */}
          <div className='flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>
              Email
            </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <div className='pt-3 text-gray-700'>{profile?.email}</div>
            </div>
          </div>
          {/* Tên */}
          <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>
              Tên
            </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                register={register}
                name='name'
                placeholder='Tên'
                errorMessage={errors.name?.message}
              />
            </div>
          </div>
          {/* SĐT */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>
              Số điện thoại
            </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Controller
                control={control}
                name='phone'
                render={({ field }) => {
                  return (
                    <InputNumber
                      classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                      placeholder='Số điện thoại'
                      errorMessage={errors.phone?.message}
                      {...field}
                      onChange={field.onChange}
                    />
                  )
                }}
              />
            </div>
          </div>
          {/* Địa chỉ */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>
              Địa chỉ
            </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm'
                register={register}
                name='address'
                placeholder='Địa chỉ'
                errorMessage={errors.address?.message}
              />
            </div>
          </div>
          {/* Ngày sinh */}
          <Controller
            control={control}
            name='date_of_birth'
            render={({ field }) => {
              return (
                <DateSelect
                  errorMessage={errors.date_of_birth?.message}
                  value={field.value}
                  onChange={field.onChange}
                />
              )
            }}
          />

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
        {/* Avatar */}
        <div className='flex justify-center md:w-72 md:border-l md:border-l-gray-200'>
          <div className='flex flex-col items-center'>
            {/* Image */}
            <div className='my-5 h-24 w-24'>
              <img
                src={previewImage || getAvatarUrl(avatarForm)}
                alt='avatar'
                className='h-full w-full rounded-full object-cover'
              />
            </div>
            {/* [HIDDEN] Select image button */}
            <input
              className='hidden'
              type='file'
              accept='.jpg,.jpeg,.png'
              ref={fileInputRef}
              onChange={handleFileChange}
              onClick={(event) => {
                ;(event.target as any).value = null
              }}
            />
            <button
              onClick={handleUploadAvatar}
              type='button'
              className='flex h-10 items-center justify-end rounded-sm border bg-white px-6 text-sm text-gray-600 shadow-sm hover:border-shopee_orange'
            >
              Chọn ảnh
            </button>
            <div className='mt-3 text-gray-400'>
              <div>Dụng lượng file tối đa 1 MB</div>
              <div>Định dạng: .JPG, .JPEG, .PNG</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
