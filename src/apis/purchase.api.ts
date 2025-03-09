import {
  Purchase,
  PurchaseListStatus,
  PurchaseRequest
} from '@/types/purchase.type'
import { SuccessResponse } from '@/types/utils.type'
import axiosInstance from '@/utils/axios'

export const addToCartApi = (body: PurchaseRequest) => {
  return axiosInstance.post<SuccessResponse<Purchase>>(
    '/purchases/add-to-cart',
    body
  )
}

export const getPurchaseListApi = (params: { status: PurchaseListStatus }) => {
  return axiosInstance.get<SuccessResponse<Purchase[]>>('/purchases', {
    params
  })
}

export const buyProductsApi = (body: PurchaseRequest[]) => {
  return axiosInstance.post<SuccessResponse<Purchase[]>>(
    '/purchases/buy-products',
    body
  )
}

// Update purchases in cart
export const updatePurchaseApi = (body: PurchaseRequest) => {
  return axiosInstance.put<SuccessResponse<Purchase>>(
    '/purchases/update-purchase',
    body
  )
}

// Delete purchases in cart
export const deletePurchaseApi = (purchaseIds: string[]) => {
  return axiosInstance.delete<SuccessResponse<{ deleted_count: number }>>(
    '/purchases',
    {
      data: purchaseIds
    }
  )
}
