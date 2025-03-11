import { range } from 'lodash'
import { useEffect, useState } from 'react'

interface DateSelectProps {
  onChange?: (value: Date) => void
  value?: Date // được truyền từ component cha (Profile), cụ thể là data trả về từ getProfile api ('/me')
  errorMessage?: string
}

export default function DateSelect({
  value,
  onChange,
  errorMessage
}: DateSelectProps) {
  // internal state: nếu component cha không truyền gì vào thì mặc định là ngày 1/1/1990
  const [date, setDate] = useState({
    date: value?.getDate() || 1,
    month: value?.getMonth() || 0,
    year: value?.getFullYear() || 1990
  })

  // khi component cha có dữ liệu (value) thì cập nhật lại state
  useEffect(() => {
    if (value) {
      setDate({
        date: value.getDate(),
        month: value.getMonth(),
        year: value.getFullYear()
      })
    }
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Lấy giá trị và trường (date || month || year) được chọn từ người dùng (thẻ select, option bên dưới)
    const { value: valueFromSelect, name } = event.target
    const newDate = {
      date: value?.getDate() || date.date,
      month: value?.getMonth() || date.month,
      year: value?.getFullYear() || date.year,
      [name]: Number(valueFromSelect)
    }
    setDate(newDate)
    if (onChange) {
      onChange(new Date(newDate.year, newDate.month, newDate.date))
    }
  }

  return (
    <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
      <div className='truncate pt-3 capitalize sm:w-[20%] sm:text-right'>
        Ngày sinh
      </div>
      <div className='sm:w-[80%] sm:pl-5'>
        <div className='flex justify-between'>
          <select
            name='date'
            value={value?.getDate() || date.date}
            onChange={handleChange}
            className='h-10 w-[32%] rounded-sm border border-black/10 px-3 hover:border-shopee_orange hover:cursor-pointer'
          >
            {range(1, 32).map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name='month'
            value={value?.getMonth() || date.month}
            onChange={handleChange}
            className='h-10 w-[32%] rounded-sm border border-black/10 px-3 hover:border-shopee_orange hover:cursor-pointer'
          >
            {range(0, 12).map((item) => (
              <option value={item} key={item}>
                {item + 1}
              </option>
            ))}
          </select>
          <select
            name='year'
            value={value?.getFullYear() || date.year}
            onChange={handleChange}
            className='h-10 w-[32%] rounded-sm border border-black/10 px-3 hover:border-shopee_orange hover:cursor-pointer'
          >
            {range(1990, 2026).map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className='my-2 text-red-600 min-h-[1.25rem] text-sm'>
          {errorMessage}
        </div>
      </div>
    </div>
  )
}
