import * as yup from 'yup'

function isValidPriceRange(this: yup.TestContext<yup.AnyObject>) {
  const { price_min, price_max } = this.parent
  if (price_max !== '' && price_min !== '') {
    return Number(price_max) >= Number(price_min)
  }
  return price_min !== '' || price_max !== ''
}

const passwordSchema = yup
  .string()
  .required('Bạn chưa nhập mật khẩu')
  .min(6, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')
  .max(160, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')

function isConfirmPasswordMatched(field: string) {
  return yup
    .string()
    .required('Bạn chưa nhập lại mật khẩu')
    .oneOf([yup.ref(field)], 'Mật khẩu nhập lại không khớp')
}

export const formSchema = yup.object({
  email: yup
    .string()
    .required('Bạn chưa nhập email')
    .email('Email không đúng định dạng')
    .min(5, 'Email phải có độ dài từ 5 - 160 ký tự')
    .max(160, 'Email phải có độ dài từ 5 - 160 ký tự'),
  password: passwordSchema,
  confirm_password: isConfirmPasswordMatched('password'),
  price_min: yup.string().test({
    name: 'invalid-price',
    message: 'Giá không hợp lệ',
    // Viết chung
    test: isValidPriceRange
    // Viết riêng cho từng field
    /*
    test: function (value?: string) {
      const price_min = value ?? ''
      const price_max = this.parent.price_max ?? ''

      if (price_min !== '' && price_max !== '') {
        return Number(price_max) >= Number(price_min)
      }
      return price_min !== '' || price_max !== ''
    }
    */
  }),
  price_max: yup.string().test({
    name: 'invalid-price',
    message: 'Giá không hợp lệ',
    test: isValidPriceRange
  }),
  name: yup.string().trim().required() // product name
})

export const userSchema = yup.object({
  name: yup.string().max(160, 'Tên tối đa 160 ký tự'),
  phone: yup.string().max(20, 'Số điện thoại tối đa 20 ký tự'),
  address: yup.string().max(160, 'Địa chỉ tối đa 160 ký tự'),
  date_of_birth: yup.date().max(new Date(), 'Ngày không hợp lệ'),
  avatar: yup.string().max(1000, 'Ảnh tối đa 1000 ký tự'),
  password: passwordSchema,
  new_password: passwordSchema,
  confirm_password: isConfirmPasswordMatched('new_password')
})

export type FormSchema = yup.InferType<typeof formSchema>

export type UserSchema = yup.InferType<typeof userSchema>
