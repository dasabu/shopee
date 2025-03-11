import { lazy, Suspense, useContext } from 'react'
import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'
import CartLayout from '@/layouts/CartLayout'
import UserLayout from '@/pages/User/layouts/UserLayout/UserLayout'

import { AppContext } from '@/contexts/app.context'
// import Register from '@/pages/Register'
// import Login from '@/pages/Login'
// import ProductList from '@/pages/ProductList'
// import ProductDetail from '@/pages/ProductDetail'
// import Cart from '@/pages/Cart'
// import Profile from '@/pages/User/pages/Profile'
// import ChangePassword from '@/pages/User/pages/ChangePassword'
// import PurchaseHistory from '@/pages/User/pages/PurchaseHistory/PurchaseHistory'
// import NotFound from '@/pages/NotFound'

const Register = lazy(() => import('@/pages/Register'))
const Login = lazy(() => import('@/pages/Login'))
const ProductList = lazy(() => import('@/pages/ProductList'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Cart = lazy(() => import('@/pages/Cart'))
const Profile = lazy(() => import('@/pages/User/pages/Profile'))
const ChangePassword = lazy(() => import('@/pages/User/pages/ChangePassword'))
const PurchaseHistory = lazy(() => import('@/pages/User/pages/PurchaseHistory'))
const NotFound = lazy(() => import('@/pages/NotFound'))

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
              <Suspense>
                <Cart />
              </Suspense>
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
              element: (
                <Suspense>
                  <Profile />
                </Suspense>
              )
            },
            {
              path: '/user/password',
              element: (
                <Suspense>
                  <ChangePassword />
                </Suspense>
              )
            },
            {
              path: '/user/history',
              element: (
                <Suspense>
                  <PurchaseHistory />
                </Suspense>
              )
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
              <Suspense>
                <Login />
              </Suspense>
            </AuthLayout>
          )
        },
        {
          path: '/register',
          element: (
            <AuthLayout>
              <Suspense>
                <Register />
              </Suspense>
            </AuthLayout>
          )
        }
      ]
    },
    {
      path: '/products/:slug',
      element: (
        <MainLayout>
          <Suspense>
            <ProductDetail />
          </Suspense>
        </MainLayout>
      )
    },
    {
      path: '/',
      index: true,
      element: (
        <MainLayout>
          <Suspense>
            <ProductList />
          </Suspense>
        </MainLayout>
      )
    },
    {
      path: '*',
      element: (
        <MainLayout>
          <Suspense>
            <NotFound />
          </Suspense>
        </MainLayout>
      )
    }
  ])
  return routesElements
}
