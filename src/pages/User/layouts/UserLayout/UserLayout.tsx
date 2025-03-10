import { Outlet } from 'react-router-dom'
import UserSidebar from '../../components/UserSidebar'

export default function UserLayout() {
  return (
    <div>
      <UserSidebar />
      <Outlet />
    </div>
  )
}
