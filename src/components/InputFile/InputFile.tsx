import { MAX_FILE_SIZE } from '@/utils/constants'
import { useRef } from 'react'
import { toast } from 'react-toastify'

interface InputFileProps {
  onChange?: (file?: File) => void
}

export default function InputFile({ onChange }: InputFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        if (onChange) {
          onChange(uploadedFile)
        }
      }
    }
  }
  return (
    <div>
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
    </div>
  )
}
