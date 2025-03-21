import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DOMPurify from 'dompurify'

import { getProductDetailApi, getProductsApi } from '@/apis/product.api'
import ProductRating from '../ProductList/components/ProductRating'
import { formatCurrency, formatToSocialStyle, rateSale } from '@/utils/product'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getIdFromSlug } from '@/utils/slug'
import ProductCard from '../ProductList/components/ProductCard'
import QuantityController from './components/QuantityController'
import { addToCartApi } from '@/apis/purchase.api'
import { PURCHASES_STATUS } from '@/utils/constants'
import { toast } from 'react-toastify'
import NotFound from '../NotFound'
import { useTranslation } from 'react-i18next'

export default function ProductDetail() {
  const { slug } = useParams()
  const id = getIdFromSlug(slug as string)

  const navigate = useNavigate()
  const { t } = useTranslation(['product'])

  /**
   * Product Detail
   */
  const { data: productDetailData, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductDetailApi(id as string)
  })
  const product = productDetailData?.data.data

  /**
   * Similar products
   */
  const queryParams = {
    limit: '6',
    page: '1',
    category: product?.category._id
  }
  const { data: productsData } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => getProductsApi(queryParams),
    /**
     * khi product có data mới gọi API này
     * do lúc đầu product bị undefined, sau đó mới có data => API bị gọi 2 lần)
     */
    enabled: Boolean(product),
    /**
     * tại / thì API có key 'products' được gọi 1 lần
     * sau đó click vào sản phẩm -> API này được gọi 1 lần nữa
     * giải quyết: thêm staleTime BẰNG NHAU vào những nơi gọi API này (key: 'products')
     * do staleTime khác nhau giữa 2 lần gọi (cụ thể là lần thứ 1 > lần thứ 2) thì API sẽ bị gọi lại ở lần thứ 2
     */
    staleTime: 3 * 60 * 1000 // 3 mins
  })

  /**
   * Slider
   */
  const [sliderIndices, setSliderIndices] = useState<number[]>([0, 5])
  // avoid changing data when component is re-rendered
  const sliderImages = useMemo(
    () => (product ? product.images.slice(...sliderIndices) : []),
    [product, sliderIndices]
  )
  const nextRange = () => {
    if (sliderIndices[1] < product!.images.length) {
      setSliderIndices((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }
  const prevRange = () => {
    if (sliderIndices[0] > 0) {
      setSliderIndices((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  /**
   * Active image
   */
  const [activeImage, setActiveImage] = useState<string>('')
  useEffect(() => {
    if (product && product.images.length > 0) {
      setActiveImage(product.images[0])
    }
  }, [product])
  const handleHoverImage = (image: string) => {
    setActiveImage(image)
  }
  // Zoom functionality
  const activeImageRef = useRef<HTMLImageElement>(null)
  const handleZoom = (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    const image = activeImageRef.current as HTMLImageElement
    const { naturalHeight, naturalWidth } = image
    image.style.width = naturalHeight + 'px' // convert to string
    image.style.width = naturalWidth + 'px'
    image.style.maxWidth = 'unset' // reset 'maxWidth' property because of default it will '100%' of the container

    /**
     * Another way to calculate offsetX, offsetY:
     * const { offsetX, offsetY } = event.nativeEvent
     * But we have to avoid bubble event: adding pointer-events-none into div className
     */

    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.pageX - (rect.x + window.scrollX)
    const offsetY = event.pageY - (rect.y + window.scrollY)
    const top = offsetY * (1 - naturalHeight / rect.height)
    const left = offsetX * (1 - naturalWidth / rect.width)
    image.style.top = top + 'px'
    image.style.left = left + 'px'
  }
  const handleRemoveZoom = () => {
    activeImageRef.current?.removeAttribute('style')
  }

  /**
   * Quantity Controller
   */
  const [quantity, setQuantity] = useState<number>(1)
  const handleChangeQuantity = (value: number) => {
    setQuantity(value)
  }

  /**
   * Add to cart
   */
  const queryClient = useQueryClient()
  const addToCartMutation = useMutation({
    mutationFn: addToCartApi, // (body) => addToCart(body)
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['purchases', { status: PURCHASES_STATUS.IN_CART }]
      })
      toast.success(data.data.message || 'Thêm vào giỏ hàng thành công', {
        autoClose: 1000
      })
    }
  })

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      product_id: product!._id,
      buy_count: quantity
    })
  }

  const buyNow = async () => {
    const response = await addToCartMutation.mutateAsync({
      product_id: product!._id,
      buy_count: quantity
    })
    const purchase = response.data.data
    navigate('/cart', { state: { purchaseId: purchase._id } })
  }

  if (isError) return <NotFound />
  if (!product) return null
  return (
    <div className='bg-gray-200 py-6'>
      <div className='container'>
        <div className='bg-white p-4 shadow'>
          <div className='grid grid-cols-12 gap-9'>
            <div className='col-span-5'>
              {/* Product Images: Active Image + Slider */}
              <div
                className='relative w-full pt-[100%] shadow overflow-hidden cursor-zoom-in'
                // Zoom: add pointer-events-none here
                onMouseMove={handleZoom}
                onMouseLeave={handleRemoveZoom}
              >
                {/* Active Image */}
                <img
                  src={activeImage}
                  alt={product.name}
                  className='absolute top-0 left-0 h-full w-full bg-white object-cover'
                  ref={activeImageRef}
                />
              </div>
              {/* Slider */}
              <div className='relative mt-4 grid grid-cols-5 gap-1'>
                {/* Prev Button */}
                <button
                  className={`absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 hover:bg-black/40
                             text-white ${sliderIndices[0] === 0 && 'cursor-not-allowed'}`}
                  onClick={prevRange}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15.75 19.5L8.25 12l7.5-7.5'
                    />
                  </svg>
                </button>
                {/* Slider Images */}
                {sliderImages.map((img, index) => {
                  const isActive = img === activeImage
                  return (
                    <div className='relative w-full pt-[100%]' key={img}>
                      <img
                        src={img}
                        alt={`${index}-${product.name}`}
                        className='absolute top-0 left-0 h-full w-full cursor-pointer bg-white object-cover'
                        // Hover: move to next image
                        onMouseEnter={() => {
                          handleHoverImage(img)
                        }}
                      />
                      {isActive && (
                        <div className='absolute inset-0 border-2 border-shopee_orange/90' />
                      )}
                    </div>
                  )
                })}
                {/* Next Button */}
                <button
                  className={`absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 hover:bg-black/40
                            text-white ${sliderIndices[1] === product.images.length && 'cursor-not-allowed'}`}
                  onClick={nextRange}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M8.25 4.5l7.5 7.5-7.5 7.5'
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className='col-span-7'>
              <h1 className='text-xl font-medium uppercase'>{product.name}</h1>
              <div className='mt-8 flex items-center'>
                <div className='flex items-center'>
                  <span className='mr-1 border-b border-b-shopee_orange text-shopee_orange'>
                    {product.rating}
                  </span>
                  <ProductRating
                    rating={product.rating}
                    activeClassname='fill-shopee_orange text-shopee_orange h-4 w-4'
                    nonActiveClassname='fill-gray-300 text-gray-300 h-4 w-4'
                  />
                </div>
                <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                <div>
                  <span>{formatToSocialStyle(product.sold)}</span>
                  <span className='ml-1 text-gray-500'>Đã bán</span>
                </div>
              </div>
              <div className='mt-8 flex items-center bg-gray-50 px-5 py-4'>
                <div className='text-gray-500 line-through'>
                  ₫{formatCurrency(product.price_before_discount)}
                </div>
                <div className='ml-3 text-3xl font-medium text-shopee_orange'>
                  ₫{formatCurrency(product.price)}
                </div>
                <div className='ml-4 rounded-sm bg-shopee_orange px-1 py-[2px] text-xs font-semibold uppercase text-white'>
                  {rateSale(product.price_before_discount, product.price)} giảm
                </div>
              </div>
              <div className='mt-8 flex items-center'>
                <div className='capitalize text-gray-500'>Số lượng</div>
                <QuantityController
                  onIncrease={handleChangeQuantity}
                  onDecrease={handleChangeQuantity}
                  onType={handleChangeQuantity}
                  value={quantity}
                  max={product.quantity}
                />
                <div className='ml-6 text-sm text-gray-500'>
                  {product.quantity} {t('available_products')}
                </div>
              </div>
              <div className='mt-8 flex items-center'>
                <button
                  onClick={handleAddToCart}
                  className='flex h-12 items-center justify-center rounded-sm border border-shopee_orange bg-shopee_orange/10 px-5 capitalize text-shopee_orange shadow-sm hover:bg-shopee_orange/5'
                >
                  <svg
                    enableBackground='new 0 0 15 15'
                    viewBox='0 0 15 15'
                    x={0}
                    y={0}
                    className='mr-[10px] h-5 w-5 fill-current stroke-shopee_orange text-shopee_orange'
                  >
                    <g>
                      <g>
                        <polyline
                          fill='none'
                          points='.5 .5 2.7 .5 5.2 11 12.4 11 14.5 3.5 3.7 3.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeMiterlimit={10}
                        />
                        <circle cx={6} cy='13.5' r={1} stroke='none' />
                        <circle cx='11.5' cy='13.5' r={1} stroke='none' />
                      </g>
                      <line
                        fill='none'
                        strokeLinecap='round'
                        strokeMiterlimit={10}
                        x1='7.5'
                        x2='10.5'
                        y1={7}
                        y2={7}
                      />
                      <line
                        fill='none'
                        strokeLinecap='round'
                        strokeMiterlimit={10}
                        x1={9}
                        x2={9}
                        y1='8.5'
                        y2='5.5'
                      />
                    </g>
                  </svg>
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={buyNow}
                  className='fkex ml-4 h-12 min-w-[5rem] items-center justify-center rounded-sm bg-shopee_orange px-5 capitalize text-white shadow-sm outline-none hover:bg-shopee_orange/90'
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Product Description */}
      <div className='container'>
        <div className='mt-8 bg-white p-4 shadow'>
          <div className='rounded bg-gray-50 p-4 text-lg capitalize text-slate-700'>
            Mô tả sản phẩm
          </div>
          <div className='mx-4 mt-12 mb-4 text-sm leading-loose'>
            <div
              // DOMPurify to eliminate embedded JS code in DOM
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.description)
              }}
            />
          </div>
        </div>
      </div>
      {/* Similar Product (same category) */}
      <div className='mt-8'>
        <div className='container'>
          <div className='uppercase text-gray-400'>Có thể bạn cũng thích</div>
          {productsData && (
            <div className='mt-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
              {productsData.data.data.products.map((product) => (
                <div className='col-span-1'>
                  <ProductCard key={product._id} product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
