import Button from '@/components/Button'
import InputNumber from '@/components/InputNumber'
import { Category } from '@/types/category.type'
import { ProductListQueryParams } from '@/types/product.type'
import { NoUndefinedField } from '@/types/utils.type'
import { handleSearchParams } from '@/utils/product'
import { formSchema, FormSchema } from '@/utils/validation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import RatingFilter from '../RatingFilter'
import { omit } from 'lodash'

type PriceRangeFormData = NoUndefinedField<
  Pick<FormSchema, 'price_min' | 'price_max'>
>
const priceRangeSchema = formSchema.pick(['price_min', 'price_max'])

interface FilterSidebarProps {
  queryParams: ProductListQueryParams
  categories: Category[]
}
export default function FilterSidebar({
  queryParams,
  categories
}: FilterSidebarProps) {
  const navigate = useNavigate()
  const { category: categoryOption } = queryParams // category lấy từ URL

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger
  } = useForm<PriceRangeFormData>({
    defaultValues: {
      price_min: '',
      price_max: ''
    },
    resolver: yupResolver(priceRangeSchema) as Resolver<PriceRangeFormData>
  })

  const handleFilterByRange = handleSubmit((data) => {
    navigate({
      pathname: '/',
      search: handleSearchParams({
        ...queryParams,
        price_min: data.price_min.toString(),
        price_max: data.price_max.toString()
      })
    })
  })

  const handleDeleteAll = () => {
    const filter = omit(queryParams, [
      'category',
      'price_max',
      'price_min',
      'rating_filter'
    ])
    navigate({
      pathname: '/',
      search: handleSearchParams({
        ...filter
      })
    })
  }

  return (
    <div className='py-4'>
      <Link
        to='/'
        className={`flex items-center font-bold ${!categoryOption && 'text-shopee_orange'}`}
      >
        <svg viewBox='0 0 12 10' className='w-3 h-4 mr-3 fill-current'>
          <g fillRule='evenodd' stroke='none' strokeWidth={1}>
            <g transform='translate(-373 -208)'>
              <g transform='translate(155 191)'>
                <g transform='translate(218 17)'>
                  <path d='m0 2h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                  <path d='m0 6h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                  <path d='m0 10h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                </g>
              </g>
            </g>
          </g>
        </svg>
        Tất cả danh mục
      </Link>
      <div className='bg-gray-300 h-[1px] my-4' />
      <ul>
        {categories.map((category) => {
          const isActive = categoryOption === category._id
          return (
            <li key={category._id} className='py-2 pl-2'>
              <Link
                to={{
                  pathname: '/',
                  search: handleSearchParams({
                    ...queryParams,
                    category: category._id
                  })
                }}
                className={`relative px-2 ${isActive && 'text-shopee_orange font-semibold'}`}
              >
                <svg
                  viewBox='0 0 4 7'
                  className={`h-2 w-2 absolute top-1 left-[-10px] ${isActive && 'fill-shopee_orange'}`}
                >
                  <polygon points='4 3.5 0 0 0 7' />
                </svg>
                {category.name}
              </Link>
            </li>
          )
        })}
      </ul>
      <Link to='/' className='flex items-center font-bold mt-4 uppercase'>
        <svg
          enableBackground='new 0 0 15 15'
          viewBox='0 0 15 15'
          x={0}
          y={0}
          className='w-3 h-4 fill-current stroke-current mr-3'
        >
          <g>
            <polyline
              fill='none'
              points='5.5 13.2 5.5 5.8 1.5 1.2 13.5 1.2 9.5 5.8 9.5 10.2'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeMiterlimit={10}
            />
          </g>
        </svg>
        Bộ lọc tìm kiếm
      </Link>
      <div className='bg-gray-300 h-[1px] my-4' />
      <div className='my-5'>
        <div>Khoảng giá</div>
        <form className='mt-2' onSubmit={handleFilterByRange}>
          <div className='flex items-start'>
            <Controller
              control={control}
              name='price_min'
              render={({ field }) => (
                <InputNumber
                  onChange={(event) => {
                    field.onChange(event)
                    /* 
                    Khi cả price_min và price_max đều bị error (để trống cả 2 rồi submit)
                    Sau đó nhập lại 1 trong 2 thì chỉ có thằng được nhập re-validate
                    Thông báo lỗi vẫn tồn tại, mặc dù lúc đó price range đã hợp lệ (chỉ cần 1 trong 2 có giá trị)
                    => Cần validate lại cả 2: sử dụng trigger(<tên field>) để ép field đó validate lại 
                    */
                    trigger('price_max')
                  }}
                  value={field.value}
                  type='text'
                  className='grow'
                  name='from'
                  placeholder='₫ TỪ'
                  classNameInput='p-1 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm'
                  classNameError='hidden'
                  ref={field.ref}
                />
              )}
            />

            <div className='mx-2 mt-2 shrink-0'>-</div>
            <Controller
              control={control}
              name='price_max'
              render={({ field }) => {
                return (
                  <InputNumber
                    onChange={(event) => {
                      field.onChange(event)
                      trigger('price_min')
                    }}
                    value={field.value}
                    type='text'
                    className='grow'
                    name='from'
                    placeholder='₫ ĐẾN'
                    classNameInput='p-1 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm'
                    classNameError='hidden'
                    ref={field.ref}
                  />
                )
              }}
            />
          </div>
          <div className='my-2 min-h-[1.25rem] text-red-600 text-center'>
            {errors.price_min?.message}
          </div>
          <Button className='w-full p-2 uppercase bg-shopee_orange text-white text-sm hover:bg-shopee_orange/80 flex justify-center items-center'>
            Áp dụng
          </Button>
        </form>
      </div>
      <div className='bg-gray-300 h-[1px] my-4' />
      <div className='text-base'>Đánh giá</div>
      <RatingFilter queryParams={queryParams} />
      <div className='bg-gray-300 h-[1px] my-4' />
      <Button
        onClick={handleDeleteAll}
        className='w-full p-2 uppercase bg-shopee_orange text-white text-sm hover:bg-shopee_orange/80 flex justify-center items-center'
      >
        Xóa tất cả
      </Button>
    </div>
  )
}
