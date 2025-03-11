import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'
import Login from '@/pages/Login'
import ProductList from '@/pages/ProductList'
import Register from '@/pages/Register'
import { AppContext } from '@/contexts/app.context'
import { useContext } from 'react'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import CartLayout from '@/layouts/CartLayout'
import UserLayout from '@/pages/User/layouts/UserLayout/UserLayout'
import Profile from '@/pages/User/pages/Profile'
import ChangePassword from '@/pages/User/pages/ChangePassword'
import PurchaseHistory from '@/pages/User/pages/PurchaseHistory/PurchaseHistory'
import NotFound from '@/pages/NotFound'

/* đã login/register */
function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

/* chưa login/register */
function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export default function useRoutesElements() {
  const routesElements = useRoutes([
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/cart',
          element: (
            <CartLayout>
              <Cart />
            </CartLayout>
          )
        },
        {
          path: '/user',
          element: (
            <MainLayout>
              <UserLayout />
            </MainLayout>
          ),
          children: [
            {
              path: '/user/profile',
              element: <Profile />
            },
            {
              path: '/user/password',
              element: <ChangePassword />
            },
            {
              path: '/user/history',
              element: <PurchaseHistory />
            }
          ]
        }
      ]
    },
    {
      path: '/',
      element: <RejectedRoute />,
      children: [
        {
          path: '/login',
          element: (
            <AuthLayout>
              <Login />
            </AuthLayout>
          )
        },
        {
          path: '/register',
          element: (
            <AuthLayout>
              <Register />
            </AuthLayout>
          )
        }
      ]
    },
    {
      path: '/products/:slug',
      element: (
        <MainLayout>
          <ProductDetail />
        </MainLayout>
      )
    },
    {
      path: '/',
      index: true,
      element: (
        <MainLayout>
          <ProductList />
        </MainLayout>
      )
    },
    {
      path: '*',
      element: (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )
    }
  ])
  return routesElements
}
