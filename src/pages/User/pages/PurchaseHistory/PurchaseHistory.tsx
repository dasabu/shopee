import { getPurchaseListApi } from '@/apis/purchase.api'
import { useQueryParams } from '@/hooks/useQueryParams'
import { PURCHASES_STATUS } from '@/utils/constants'
import { formatCurrency } from '@/utils/product'
import { generateSlug } from '@/utils/slug'
import { useQuery } from '@tanstack/react-query'
import { createSearchParams, Link } from 'react-router-dom'
import { PurchaseListStatus } from 'src/types/purchase.type'

const purchaseTabs = [
  { status: PURCHASES_STATUS.ALL, name: 'Tất cả' },
  { status: PURCHASES_STATUS.WAIT_FOR_CONFIRMATION, name: 'Chờ xác nhận' },
  { status: PURCHASES_STATUS.WAIT_FOR_GETTING, name: 'Chờ lấy hàng' },
  { status: PURCHASES_STATUS.IN_PROGRESS, name: 'Đang giao' },
  { status: PURCHASES_STATUS.DELIVERED, name: 'Đã giao' },
  { status: PURCHASES_STATUS.CANCELLED, name: 'Đã hủy' }
]

export default function HistoryPurchase() {
  const queryParams: { status?: string } = useQueryParams()
  const status = Number(queryParams.status || PURCHASES_STATUS.ALL)

  const { data: purchasesInCartData } = useQuery({
    queryKey: ['purchases', { status }],
    queryFn: () => getPurchaseListApi({ status: status as PurchaseListStatus })
  })

  const purchasesInCart = purchasesInCartData?.data.data

  const purchaseTabsLink = purchaseTabs.map((tab) => (
    <Link
      key={tab.status}
      to={{
        pathname: '/user/history',
        search: createSearchParams({
          status: String(tab.status)
        }).toString()
      }}
      className={`flex flex-1 items-center justify-center border-b-2 bg-white py-4 text-center ${status === tab.status ? 'border-b-orange text-orange' : 'border-b-black/10 text-gray-900'}`}
    >
      {tab.name}
    </Link>
  ))

  return (
    <div>
      <div className='overflow-x-auto'>
        <div className='min-w-[700px]'>
          <div className='sticky top-0 flex rounded-t-sm shadow-sm'>
            {purchaseTabsLink}
          </div>
          <div>
            {purchasesInCart?.map((purchase) => (
              <div
                key={purchase._id}
                className='mt-4 rounded-sm border-black/10 bg-white p-6 text-gray-800 shadow-sm'
              >
                <Link
                  to={`/products/${generateSlug(purchase.product.name, purchase.product._id)}`}
                  className='flex'
                >
                  <div className='flex-shrink-0'>
                    <img
                      className='h-20 w-20 object-cover'
                      src={purchase.product.image}
                      alt={purchase.product.name}
                    />
                  </div>
                  <div className='ml-3 flex-grow overflow-hidden'>
                    <div className='truncate'>{purchase.product.name}</div>
                    <div className='mt-3'>x{purchase.buy_count}</div>
                  </div>
                  <div className='ml-3 flex-shrink-0'>
                    <span className='truncate text-gray-500 line-through'>
                      ₫{formatCurrency(purchase.product.price_before_discount)}
                    </span>
                    <span className='ml-2 truncate text-orange'>
                      ₫{formatCurrency(purchase.product.price)}
                    </span>
                  </div>
                </Link>
                <div className='flex justify-end'>
                  <div>
                    <span>Tổng giá tiền</span>
                    <span className='ml-4 text-xl text-orange'>
                      ₫
                      {formatCurrency(
                        purchase.product.price * purchase.buy_count
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
