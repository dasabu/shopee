import { Link } from 'react-router-dom'

export default function AuthHeader() {
  return (
    <header className='py-5'>
      <div className='max-w-7xl mx-auto px-4'>
        <nav className='flex items-end'>
          <Link to='/'>
            <img
              className='h-10 lg:h-12'
              src='/src/assets/shopee-logo.svg'
              alt='Shopee Logo'
            />
          </Link>
        </nav>
      </div>
    </header>
  )
}
