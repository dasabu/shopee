import InputNumber, { InputNumberProps } from '@/components/InputNumber'
import { useState } from 'react'

interface QuantityControllerProps extends InputNumberProps {
  max?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  classNameWrapper?: string
}

export default function QuantityController({
  max,
  onIncrease,
  onDecrease,
  onType,
  classNameWrapper = 'ml-10',
  value,
  ...rest
}: QuantityControllerProps) {
  const [localValue, setLocalValue] = useState<number>(Number(value || 0))

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _value = Number(event.target.value)
    // reset giá trị trong input về max khi nhập > max và < 1
    if (max && _value > max) {
      _value = max
    } else if (_value < 1) {
      _value = 1
    }
    if (onType) {
      onType(_value)
      setLocalValue(_value)
    }
  }

  const handleIncrease = () => {
    let _value = Number(value || localValue) + 1
    if (max && _value > max) {
      _value = max
    }
    if (onIncrease) {
      onIncrease(_value)
      setLocalValue(_value)
    }
  }

  const handleDecrease = () => {
    let _value = Number(value || localValue) - 1
    if (_value < 1) {
      _value = 1
    }
    if (onDecrease) {
      onDecrease(_value)
      setLocalValue(_value)
    }
  }

  return (
    <div>
      <div className={`flex items-center ${classNameWrapper}`}>
        {/* Decrease */}
        <button
          className='flex h-8 w-8 items-center justify-center rounded-l-sm border border-gray-300 text-gray-600'
          onClick={handleDecrease}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-4 w-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M19.5 12h-15'
            />
          </svg>
        </button>
        {/* Number input */}
        <InputNumber
          className=''
          classNameError='hidden'
          classNameInput='h-8 w-14 border-t border-b border-gray-300 p-1 text-center outline-none'
          value={value || localValue}
          onChange={handleChange}
          {...rest}
        />
        {/* Increase */}
        <button
          className='flex h-8 w-8 items-center justify-center rounded-r-sm border border-gray-300 text-gray-600'
          onClick={handleIncrease}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-4 w-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 4.5v15m7.5-7.5h-15'
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
