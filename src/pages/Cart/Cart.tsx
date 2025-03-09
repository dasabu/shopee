import {
  buyProductsApi,
  deletePurchaseApi,
  getPurchaseListApi,
  updatePurchaseApi
} from '@/apis/purchase.api'
import { PURCHASES_STATUS } from '@/utils/constants'
import { formatCurrency } from '@/utils/product'
import { generateSlug } from '@/utils/slug'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import QuantityController from '../ProductDetail/components/QuantityController'
import Button from '@/components/Button'
import { Purchase } from '@/types/purchase.type'
import { useEffect, useState } from 'react'
import { produce } from 'immer'
import { keyBy } from 'lodash'
import { toast } from 'react-toastify'

interface ExtendedPurchases extends Purchase {
  checked: boolean
  disabled: boolean
}

export default function Cart() {
  const { data: purchasesInCartData, refetch } = useQuery({
    queryKey: ['purchases', { status: PURCHASES_STATUS.IN_CART }],
    queryFn: () => getPurchaseListApi({ status: PURCHASES_STATUS.IN_CART })
  })

  /**
   * Cần thêm 2 properties checked và disabled vào mỗi item trong purchasesInCartData được fetch về
   * nên tạo nên 1 state mới purchasesExtend để quản lý các item đó và cùng với các properties mới
   */
  const [purchasesExtended, setPurchasesExtended] = useState<
    ExtendedPurchases[]
  >([])
  useEffect(() => {
    setPurchasesExtended((prev) => {
      const extendedPurchaseObj = keyBy(prev, '_id')
      return (
        purchasesInCartData?.data.data.map((purchase) => ({
          ...purchase,
          checked: Boolean(extendedPurchaseObj[purchase._id]?.checked), // giữ nguyên trạng thái checked khi refetch
          disabled: false
        })) || []
      )
    })
  }, [purchasesInCartData?.data.data])

  /**
   * Handle check
   */
  const handleChecked =
    (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPurchasesExtended(
        produce((draft) => {
          draft[purchaseIndex].checked = event.target.checked
        })
      )
    }

  const isCheckedAll = purchasesExtended.every((purchase) => purchase.checked)
  const handleCheckedAll = () => {
    setPurchasesExtended((prev) =>
      prev.map((purchase) => ({
        ...purchase,
        checked: !isCheckedAll
      }))
    )
  }

  /**
   * Update quantity
   */
  const updatePurchaseMutation = useMutation({
    mutationFn: updatePurchaseApi,
    onSuccess: () => {
      refetch()
    }
  })

  const buyProductsMutation = useMutation({
    mutationFn: buyProductsApi,
    onSuccess: (response) => {
      refetch()
      toast.success(response.data.message, {
        position: 'top-center',
        autoClose: 1000
      })
    }
  })

  const deletePurchaseMutation = useMutation({
    mutationFn: deletePurchaseApi,
    onSuccess: () => {
      refetch()
    }
  })

  const handleChangeQuantity = (
    purchaseIndex: number,
    value: number,
    enable: boolean
  ) => {
    if (enable) {
      const purchase = purchasesExtended[purchaseIndex]
      setPurchasesExtended(
        produce((draft) => {
          draft[purchaseIndex].disabled = true
        })
      )
      updatePurchaseMutation.mutate({
        product_id: purchase.product._id,
        buy_count: value
      })
    }
  }

  const handleTypeQuantity = (purchaseIndex: number) => {
    return function (value: number) {
      setPurchasesExtended(
        produce((draft) => {
          draft[purchaseIndex].buy_count = value
        })
      )
    }
  }

  /**
   * Delete
   */
  const checkedPurchases = purchasesExtended.filter(
    (purchase) => purchase.checked
  )
  const handleDelete = (purchaseIndex: number) => () => {
    const purchaseId = purchasesExtended[purchaseIndex]._id
    deletePurchaseMutation.mutate([purchaseId])
  }

  const handleDeleteMany = () => {
    const purchasesIds = checkedPurchases.map((purchase) => purchase._id)
    deletePurchaseMutation.mutate(purchasesIds)
  }

  /**
   * Buy
   */
  const handleBuyProducts = () => {
    if (checkedPurchases.length > 0) {
      const body = checkedPurchases.map(({ product, buy_count }) => ({
        product_id: product._id,
        buy_count: buy_count
      }))
      buyProductsMutation.mutate(body)
    }
  }

  /**
   * Calculate Price
   */
  const paymentPrice = checkedPurchases.reduce((result, current) => {
    return result + current.product.price * current.buy_count
  }, 0)
  const savingPrice = checkedPurchases.reduce((result, current) => {
    return (
      result +
      (current.product.price_before_discount - current.product.price) *
        current.buy_count
    )
  }, 0)

  return (
    <div className='bg-neutral-100 py-16'>
      <div className='container'>
        <div className='overflow-auto'>
          <div className='min-w-[1000px]'>
            <div className='grid grid-cols-12 rounded-sm bg-white py-5 px-9 text-sm capitalize text-gray-500 shadow'>
              <div className='col-span-6'>
                <div className='flex items-center'>
                  <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                    <input
                      type='checkbox'
                      className='h-5 w-5 accent-shopee_orange'
                      checked={isCheckedAll}
                      onChange={handleCheckedAll}
                    />
                  </div>
                  <div className='flex-grow text-black'>Sản phẩm</div>
                </div>
              </div>
              <div className='col-span-6'>
                <div className='grid grid-cols-5 text-center'>
                  <div className='col-span-2'>Đơn giá</div>
                  <div className='col-span-1'>Số lượng</div>
                  <div className='col-span-1'>Số tiền</div>
                  <div className='col-span-1'>Thao tác</div>
                </div>
              </div>
            </div>
            {purchasesExtended && purchasesExtended.length > 0 ? (
              <div className='my-3 rounded-sm bg-white p-5 shadow'>
                {purchasesExtended.map((purchase, index) => (
                  <div
                    key={purchase._id}
                    className='mb-5 items-center grid grid-cols-12 rounded-sm border border-gray-200 bg-white py-5 px-4 text-center text-sm text-gray-500 first:mt-0'
                  >
                    <div className='col-span-6'>
                      <div className='flex'>
                        <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                          <input
                            type='checkbox'
                            className='h-5 w-5 accent-shopee_orange'
                            checked={purchase.checked}
                            onChange={handleChecked(index)}
                          />
                        </div>
                        <div className='flex-grow'>
                          <div className='flex'>
                            <Link
                              className='h-20 w-20 flex-shrink-0'
                              to={`/${generateSlug(
                                purchase.product.name,
                                purchase.product._id
                              )}`}
                            >
                              <img
                                alt={purchase.product.name}
                                src={purchase.product.image}
                              />
                            </Link>
                            <div className='flex-grow px-2 pt-1 pb-2'>
                              <Link
                                to={`/${generateSlug(
                                  purchase.product.name,
                                  purchase.product._id
                                )}`}
                                className='text-left line-clamp-2'
                              >
                                {purchase.product.name}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-span-6'>
                      <div className='grid grid-cols-5 items-center'>
                        <div className='col-span-2'>
                          <div className='flex items-center justify-center'>
                            <span className='text-gray-300 line-through'>
                              ₫
                              {formatCurrency(
                                purchase.product.price_before_discount
                              )}
                            </span>
                            <span className='ml-3'>
                              ₫{formatCurrency(purchase.product.price)}
                            </span>
                          </div>
                        </div>
                        <div className='col-span-1'>
                          <QuantityController
                            max={purchase.product.quantity}
                            value={purchase.buy_count}
                            classNameWrapper='flex items-center'
                            onIncrease={(value) =>
                              handleChangeQuantity(
                                index,
                                value,
                                value <= purchase.product.quantity
                              )
                            }
                            onDecrease={(value) =>
                              handleChangeQuantity(index, value, value >= 1)
                            }
                            onType={handleTypeQuantity(index)}
                            onFocusOut={(value) =>
                              handleChangeQuantity(
                                index,
                                value,
                                value >= 1 &&
                                  value < purchase.product.quantity &&
                                  value !==
                                    purchasesInCartData!.data.data[index]
                                      .buy_count
                              )
                            }
                            disabled={purchase.disabled}
                          />
                        </div>
                        <div className='col-span-1'>
                          <span className='text-orange'>
                            ₫
                            {formatCurrency(
                              purchase.product.price * purchase.buy_count
                            )}
                          </span>
                        </div>
                        <div className='col-span-1'>
                          <button
                            onClick={handleDelete(index)}
                            className='bg-none text-black transition-colors hover:text-shopee_orange'
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex justify-center items-center p-10 bg-white my-3 border shadow'>
                <img
                  src='/src/assets/no-product-found.png'
                  alt='No products found'
                  className='w-60 h-30'
                />
              </div>
            )}
          </div>
        </div>
        <div className='sticky bottom-0 z-10 mt-8 flex flex-col rounded-sm border border-gray-100 bg-white p-5 shadow sm:flex-row sm:items-center'>
          <div className='flex items-center'>
            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
              <input
                type='checkbox'
                className='h-5 w-5 accent-shopee_orange'
                checked={isCheckedAll}
                onChange={handleCheckedAll}
              />
            </div>
            <button className='mx-3 border-none bg-none'>
              Chọn tất cả ({checkedPurchases.length})
            </button>
            <button
              onClick={handleDeleteMany}
              className='mx-3 border-none bg-none'
            >
              Xóa
            </button>
          </div>

          <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center'>
            <div>
              <div className='flex items-center sm:justify-end'>
                <div>Tổng thanh toán ({checkedPurchases.length} sản phẩm):</div>
                <div className='ml-2 text-2xl text-shopee_orange'>
                  {formatCurrency(paymentPrice)}
                </div>
              </div>
              <div className='flex items-center text-sm sm:justify-end'>
                <div className='text-gray-500'>Tiết kiệm</div>
                <div className='ml-6 text-shopee_orange'>
                  {formatCurrency(savingPrice)}
                </div>
              </div>
            </div>
            <Button
              // disabled={buyProductsMutation.isPending}
              onClick={handleBuyProducts}
              className='mt-5 flex h-10 w-52 items-center justify-center bg-red-500 text-sm uppercase text-white hover:bg-red-600 sm:ml-4 sm:mt-0'
            >
              Mua hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
