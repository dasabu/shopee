import { Link } from 'react-router-dom'
import ShopeeLogo from '@/assets/shopee-logo.svg'
export default function AuthHeader() {
  return (
    <header className='py-5'>
      <div className='max-w-7xl mx-auto px-4'>
        <nav className='flex items-end'>
          <Link to='/'>
            <img className='h-10 lg:h-12' src={ShopeeLogo} alt='Shopee Logo' />
          </Link>
        </nav>
      </div>
    </header>
  )
}
