import { useForm } from 'react-hook-form'
import { useQueryParamsProductList } from './useQueryParams'
import { yupResolver } from '@hookform/resolvers/yup'
import { formSchema, FormSchema } from '@/utils/validation'
import { omit } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { handleSearchParams } from '@/utils/product'

type NameFormData = Pick<FormSchema, 'name'>

const nameSchema = formSchema.pick(['name'])

export default function useSearchProducts() {
  const navigate = useNavigate()
  const queryParamsProductList = useQueryParamsProductList()

  const { register, handleSubmit } = useForm<NameFormData>({
    defaultValues: {
      name: ''
    },
    resolver: yupResolver(nameSchema)
  })
  const handleSearch = handleSubmit((data) => {
    const queryParams = queryParamsProductList.order
      ? omit({ ...queryParamsProductList, name: data.name }, [
          'order',
          'sort_by'
        ])
      : { ...queryParamsProductList, name: data.name }
    navigate({
      pathname: '/',
      search: handleSearchParams(queryParams)
    })
  })

  return { register, handleSearch }
}
