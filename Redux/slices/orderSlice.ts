// Redux/slices/orderSlice.ts - UPDATED WITH ADDRESS OBJECTS
import { ServiceTypeEnum } from '@/enums'
import { formatDateToISO } from '@/services/DateService'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define interfaces for the order structure
interface Address {
  address_line: string
  city: string
  state: string
  pincode: string
  landmark: string
  lat: string
  long: string
}

interface TimeSlot {
  open: string
  close: string
  note?: string
}

interface TailoringType {
  name: string
  price?: number
}

interface OrderItem {
  quantity: number
  price?: number
  item_name: string
  item_type: string
  tailoring_types?: TailoringType[]
  category?: string
}

interface PaymentBreakdown {
  orderAmount: number
  discount: number
  tax: number
  platformFee: number
  deliveryCharge: number
}

interface ServicePrices {
  itemPrices: Record<string, number>
  tailoringPrices?: Record<string, number>
}

interface OrderData {
  serviceType?: ServiceTypeEnum

  // UPDATED: Pickup Details with Address Objects
  pickupDetails?: {
    pickupAddress: Address // Changed from location string to Address object
    collectionDate: string
    collectionTime: string
    deliveryDate: string
    deliveryTime: string
    partnerNote: string
    repeatOption: string
  }

  selectedClothes?: {
    items: OrderItem[]
    totalWeight: number
    totalItems: number
  }

  // UPDATED: Store with address object
  selectedStore?: {
    store_id: number
    store_name: string
    store_address: Address // Changed from string to Address object
  }

  paymentBreakdown?: PaymentBreakdown

  storePrices?: {
    [ServiceTypeEnum.WASH_N_FOLD]?: ServicePrices
    [ServiceTypeEnum.DRYCLEANING]?: ServicePrices
    [ServiceTypeEnum.TAILORING]?: ServicePrices
  }

  [key: string]: any
}

interface OrderState {
  serviceType: ServiceTypeEnum
  currentStep: number
  totalSteps: number
  orderData: OrderData
  isOrderActive: boolean
  isStoreFlow: boolean
  storeFlowData?: {
    selectedStore?: {
      store_id: number
      store_name: string
      store_address: Address // Changed from string to Address object
    }
  }
}

const initialState: OrderState = {
  serviceType: ServiceTypeEnum.WASH_N_FOLD,
  currentStep: 1,
  totalSteps: 4,
  orderData: {},
  isOrderActive: false,
  isStoreFlow: false,
  storeFlowData: {}
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Step 1: Start Order with Service Type
    startOrder: (state, action: PayloadAction<ServiceTypeEnum>) => {
      state.serviceType = action.payload
      state.currentStep = 1
      state.isOrderActive = true
      state.isStoreFlow = false
      state.orderData = {
        serviceType: action.payload
      }
    },

    startOrderFromStore: (
      state,
      action: PayloadAction<{
        serviceType: ServiceTypeEnum
        store: {
          store_id: number
          store_name: string
          store_address: Address // Updated to Address object
        }
      }>
    ) => {
      state.serviceType = action.payload.serviceType
      state.currentStep = 1
      state.isOrderActive = true
      state.isStoreFlow = true
      state.storeFlowData = {
        selectedStore: action.payload.store
      }
      state.orderData = {
        serviceType: action.payload.serviceType,
        selectedStore: action.payload.store
      }
    },

    // UPDATED: Step 2: Add Pickup Details with Address Objects
    updatePickupDetails: (
      state,
      action: PayloadAction<{
        pickupAddress: Address // Changed from location string
        deliveryAddress?: Address // NEW: Optional delivery address
        collectionDate: string
        collectionTime: string
        deliveryDate?: string
        deliveryTime?: string
        partnerNote?: string
        repeatOption?: string
      }>
    ) => {
      state.orderData.pickupDetails = {
        pickupAddress: action.payload.pickupAddress,

        collectionDate: action.payload.collectionDate,
        collectionTime: action.payload.collectionTime,
        deliveryDate:
          action.payload.deliveryDate || action.payload.collectionDate,
        deliveryTime:
          action.payload.deliveryTime || action.payload.collectionTime,
        partnerNote: action.payload.partnerNote || '',
        repeatOption: action.payload.repeatOption || 'no-repeat'
      }
    },

    // NEW: Update Pickup Address Separately
    updatePickupAddress: (state, action: PayloadAction<Address>) => {
      if (!state.orderData.pickupDetails) {
        state.orderData.pickupDetails = {} as any
      } else state.orderData.pickupDetails.pickupAddress = action.payload
    },

    // Universal price storage for all service types
    updateStorePrices: (
      state,
      action: PayloadAction<{
        serviceType: ServiceTypeEnum
        prices: Record<string, number>
        tailoringPrices?: Record<string, number>
      }>
    ) => {
      if (!state.orderData) {
        state.orderData = {}
      }
      if (!state.orderData.storePrices) {
        state.orderData.storePrices = {}
      }

      const { serviceType, prices, tailoringPrices } = action.payload

      state.orderData.storePrices[
        serviceType as keyof typeof state.orderData.storePrices
      ] = {
        itemPrices: prices,
        tailoringPrices: tailoringPrices || {}
      }

      console.log(`💰 Redux - Updated ${serviceType} prices:`, prices)
      if (tailoringPrices) {
        console.log(
          `🧵 Redux - Updated ${serviceType} tailoring prices:`,
          tailoringPrices
        )
      }

      // Auto-update existing items if they match this service type
      if (state.orderData.selectedClothes?.items) {
        state.orderData.selectedClothes.items =
          state.orderData.selectedClothes.items.map(item => {
            if (item.item_type !== serviceType) return item

            const price = prices[item.item_name]
            const updatedItem = { ...item }

            if (price !== undefined) {
              updatedItem.price = price
            }

            if (item.tailoring_types && tailoringPrices) {
              updatedItem.tailoring_types = item.tailoring_types.map(tt => {
                const tailoringPrice =
                  tailoringPrices[`${item.item_name}_${tt.name}`]
                return tailoringPrice !== undefined
                  ? { ...tt, price: tailoringPrice }
                  : tt
              })
            }

            return updatedItem
          })
      }
    },

    // Step 3: Add Selected Clothes (ENHANCED with price integration)
    updateSelectedClothes: (state, action: PayloadAction<any>) => {
      const clothesData = action.payload
      const items: OrderItem[] = []
      let totalItems = 0
      let totalWeight = 0

      console.log('🔄 Redux - updateSelectedClothes called with:', clothesData)
      console.log('🔄 Redux - Current serviceType:', state.serviceType)

      const servicePrices =
        state.orderData?.storePrices?.[
          state.serviceType as keyof typeof state.orderData.storePrices
        ]
      console.log('🔄 Redux - Available service prices:', servicePrices)

      // Process different service types
      if (state.serviceType === ServiceTypeEnum.WASH_N_FOLD) {
        Object.keys(clothesData).forEach(clothName => {
          const weight = clothesData[clothName]
          if (weight > 0) {
            const price = servicePrices?.itemPrices?.[clothName]

            items.push({
              quantity: weight,
              item_name: clothName,
              item_type: 'WASH_N_FOLD',
              price: price
            })
            totalWeight += weight
            totalItems += 1

            console.log(
              `📦 WASH_N_FOLD - Added ${clothName}: ${weight}kg @ $${
                price || 'TBD'
              }/kg`
            )
          }
        })
      } else if (state.serviceType === ServiceTypeEnum.DRYCLEANING) {
        Object.keys(clothesData).forEach(clothName => {
          const clothInfo = clothesData[clothName]
          if (clothInfo && clothInfo.quantity > 0) {
            const price = servicePrices?.itemPrices?.[clothName]

            items.push({
              quantity: clothInfo.quantity,
              item_name: clothName,
              item_type: 'DRYCLEANING',
              category: clothInfo.category,
              price: price
            })
            totalItems += clothInfo.quantity

            console.log(
              `👔 DRYCLEANING - Added ${clothName}: ${
                clothInfo.quantity
              } items @ $${price || 'TBD'}/item`
            )
          }
        })
      } else if (state.serviceType === ServiceTypeEnum.TAILORING) {
        if (clothesData && typeof clothesData === 'object') {
          Object.keys(clothesData).forEach(clothName => {
            const clothInfo = clothesData[clothName]
            console.log(
              '🔍 Redux - Processing tailoring item:',
              clothName,
              clothInfo
            )

            if (
              clothInfo &&
              clothInfo.tailoringType &&
              typeof clothInfo === 'object'
            ) {
              const itemPrice = servicePrices?.itemPrices?.[clothName]
              const tailoringPrice =
                servicePrices?.tailoringPrices?.[
                  `${clothName}_${clothInfo.tailoringType}`
                ]

              items.push({
                quantity: 1,
                item_name: clothName,
                item_type: 'TAILORING',
                category: clothInfo.category,
                price: itemPrice,
                tailoring_types: [
                  {
                    name: clothInfo.tailoringType,
                    price: tailoringPrice
                  }
                ]
              })
              totalItems += 1

              console.log(
                `🧵 TAILORING - Added ${clothName} (${
                  clothInfo.tailoringType
                }): $${itemPrice || 'TBD'} + $${
                  tailoringPrice || 'TBD'
                } tailoring`
              )
            } else {
              console.log(
                '❌ Redux - Skipped item (invalid structure):',
                clothName,
                clothInfo
              )
            }
          })
        } else {
          console.log('❌ Redux - Invalid clothesData structure:', clothesData)
        }
      }

      console.log('📊 Redux - Final items array:', items)
      console.log('📊 Redux - Total items:', totalItems)

      state.orderData.selectedClothes = {
        items,
        totalWeight,
        totalItems
      }

      const orderAmount = items.reduce((sum, item) => {
        let itemTotal = 0

        if (item.price && item.quantity) {
          itemTotal += item.price * item.quantity
        }

        if (item.tailoring_types) {
          item.tailoring_types.forEach(tailoringType => {
            if (tailoringType.price) {
              itemTotal += tailoringType.price
            }
          })
        }

        return sum + itemTotal
      }, 0)

      if (!state.orderData.paymentBreakdown) {
        state.orderData.paymentBreakdown = {
          orderAmount: 0,
          discount: 0,
          tax: 0,
          platformFee: 0,
          deliveryCharge: 0
        }
      }

      state.orderData.paymentBreakdown.orderAmount = orderAmount
      console.log('💰 Redux - Updated order amount:', orderAmount)
    },

    recalculateOrderAmount: state => {
      if (!state.orderData.selectedClothes?.items) return

      const orderAmount = state.orderData.selectedClothes.items.reduce(
        (sum, item) => {
          let itemTotal = 0

          if (item.price && item.quantity) {
            itemTotal += item.price * item.quantity
          }

          if (item.tailoring_types) {
            item.tailoring_types.forEach(tailoringType => {
              if (tailoringType.price) {
                itemTotal += tailoringType.price
              }
            })
          }

          return sum + itemTotal
        },
        0
      )

      if (!state.orderData.paymentBreakdown) {
        state.orderData.paymentBreakdown = {
          orderAmount: 0,
          discount: 0,
          tax: 0,
          platformFee: 0,
          deliveryCharge: 0
        }
      }

      state.orderData.paymentBreakdown.orderAmount = orderAmount
      console.log('💰 Redux - Recalculated order amount:', orderAmount)
    },

    updateItemPrices: (
      state,
      action: PayloadAction<{
        serviceType?: ServiceTypeEnum
        itemPrices: Array<{
          item_name: string
          price: number
          tailoring_type?: string
          tailoring_price?: number
        }>
      }>
    ) => {
      const { serviceType = state.serviceType, itemPrices } = action.payload

      console.log(
        `🔄 Redux - updateItemPrices called for ${serviceType}:`,
        itemPrices
      )

      if (!state.orderData?.selectedClothes?.items) return

      state.orderData.selectedClothes.items =
        state.orderData.selectedClothes.items.map(item => {
          if (item.item_type !== serviceType) return item

          const priceInfo = itemPrices.find(p => p.item_name === item.item_name)

          if (!priceInfo) {
            console.log(
              `⚠️ Redux - No price found for ${serviceType} item: ${item.item_name}`
            )
            return item
          }

          console.log(
            `💰 Redux - Updating ${serviceType} price for ${item.item_name}: $${priceInfo.price}`
          )

          const updatedItem = {
            ...item,
            price: priceInfo.price
          }

          if (item.tailoring_types && priceInfo.tailoring_price !== undefined) {
            updatedItem.tailoring_types = item.tailoring_types.map(tt => ({
              ...tt,
              price: priceInfo.tailoring_price
            }))
          }

          return updatedItem
        })

      console.log(`✅ Redux - ${serviceType} item prices updated`)
    },

    // UPDATED: Step 4: Add Selected Store with Address Object
    updateSelectedStore: (
      state,
      action: PayloadAction<{
        store_id: number
        store_name: string
        store_address: Address // Changed from string to Address object
      }>
    ) => {
      state.orderData.selectedStore = action.payload
    },

    updatePaymentBreakdown: (
      state,
      action: PayloadAction<{
        orderAmount: number
        discount?: number
        tax?: number
        platformFee?: number
        deliveryCharge?: number
      }>
    ) => {
      const {
        orderAmount,
        discount = 0,
        tax = 0,
        platformFee = 0,
        deliveryCharge = 0
      } = action.payload

      state.orderData.paymentBreakdown = {
        orderAmount,
        discount,
        tax,
        platformFee,
        deliveryCharge
      }

      console.log(
        '💳 Redux - Updated payment breakdown from API:',
        state.orderData.paymentBreakdown
      )
    },

    // UPDATED: Create Order API Payload Generator with Address Objects
    createOrderPayload: (
      state,
      action: PayloadAction<{
        userId: number
        finalPaymentBreakdown?: PaymentBreakdown
        campaignId?: number
        pricingTierId?: number
      }>
    ) => {
      const { userId, finalPaymentBreakdown, campaignId, pricingTierId } =
        action.payload
      const orderData = state.orderData

      const paymentData = finalPaymentBreakdown || orderData.paymentBreakdown

      const parseTimeSlot = (timeString: string) => {
        const parts = timeString.split('-')
        return {
          open: parts[0]?.trim() || '10:00 AM',
          close: parts[1]?.trim() || '08:00 PM',
          note: 'Available during business hours'
        }
      }

      // REMOVED: parseAddressFromLocation function - now using address objects directly
      const getDefaultAddress = (): Address => ({
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        lat: '0.0',
        long: '0.0'
      })

      const generateServiceItems = () => {
        const items = orderData.selectedClothes?.items || []

        return items.map(item => {
          if (state.serviceType === ServiceTypeEnum.WASH_N_FOLD) {
            return {
              item_type: ServiceTypeEnum.WASH_N_FOLD,
              quantity: item.quantity,
              price: item.price || 0,
              category: item.category || item.item_name
            }
          } else if (state.serviceType === ServiceTypeEnum.DRYCLEANING) {
            return {
              item_type: ServiceTypeEnum.DRYCLEANING,
              quantity: item.quantity,
              price: item.price || 0,
              item_name: item.item_name,
              category: item.category || ''
            }
          } else if (state.serviceType === ServiceTypeEnum.TAILORING) {
            return {
              item_type: ServiceTypeEnum.TAILORING,
              quantity: item.quantity,
              price: item.price || 0,
              item_name: item.item_name,
              tailoring_types:
                item.tailoring_types?.map(tt => ({
                  name: tt.name,
                  price: tt.price || 0
                })) || []
            }
          }

          return {
            quantity: item.quantity,
            price: item.price || 0,
            item_name: item.item_name,
            category: item.category || ''
          }
        })
      }

      const createOrderPayload = {
        user_id: userId,
        store_id: orderData.selectedStore?.store_id || 0,

        ...(campaignId && { campaign_id: campaignId }),
        ...(pricingTierId && { pricing_tier_id: pricingTierId }),

        repeat_frequency: orderData.pickupDetails?.repeatOption || 'no-repeat',
        total_amount: paymentData?.orderAmount || 0,
        status: 'Pending',

        pickup: {
          pickup_status: 'Pending',
          pickup_date: orderData.pickupDetails
            ? formatDateToISO(orderData.pickupDetails.collectionDate)
            : '',
          pickup_time_slot: parseTimeSlot(
            orderData.pickupDetails?.collectionTime || '10:00 AM-08:00 PM'
          ),
          // UPDATED: Use pickup address object directly
          pickup_address:
            orderData.pickupDetails?.pickupAddress || getDefaultAddress(),
          pickup_type: 'Home_Pickup',
          delivery_date: orderData.pickupDetails
            ? formatDateToISO(orderData.pickupDetails.deliveryDate)
            : '',
          delivery_time_slot: parseTimeSlot(
            orderData.pickupDetails?.deliveryTime ||
              orderData.pickupDetails?.collectionTime ||
              '10:00 AM-08:00 PM'
          ),
          // UPDATED: Use delivery address or store address object directly
          delivery_address: orderData.selectedStore?.store_address
        },

        description: orderData.pickupDetails?.partnerNote || '',

        services: [
          {
            service_type: state.serviceType,
            estimated_weight_or_qty:
              state.serviceType === ServiceTypeEnum.WASH_N_FOLD
                ? orderData.selectedClothes?.totalWeight || 0
                : orderData.selectedClothes?.totalItems || 0,
            notes: orderData.pickupDetails?.partnerNote || '',
            items: generateServiceItems()
          }
        ],

        additional_items: [],

        payment_breakdown: {
          orderAmount: paymentData?.orderAmount || 0,
          discount: paymentData?.discount || 0,
          tax: paymentData?.tax || 0,
          platformFee: paymentData?.platformFee || 0,
          deliveryCharge: paymentData?.deliveryCharge || 0
        }
      }

      state.orderData.createOrderPayload = createOrderPayload

      console.log(
        `📦 Redux - Created ${state.serviceType} order payload:`,
        JSON.stringify(createOrderPayload)
      )
    },

    // Navigation actions
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },

    nextStep: state => {
      if (state.isStoreFlow && state.currentStep === 2) {
        state.currentStep = 4
      } else if (state.currentStep < state.totalSteps) {
        state.currentStep += 1
      }
    },

    prevStep: state => {
      if (state.isStoreFlow && state.currentStep === 4) {
        state.currentStep = 2
      } else if (state.currentStep > 1) {
        state.currentStep -= 1
      }
    },

    updateOrderData: (
      state,
      action: PayloadAction<{ step: string; data: any }>
    ) => {
      const { step, data } = action.payload
      state.orderData[step] = data
    },

    resetOrder: state => {
      state.serviceType = ServiceTypeEnum.WASH_N_FOLD
      state.currentStep = 1
      state.orderData = {}
      state.isOrderActive = false
      state.isStoreFlow = false
      state.storeFlowData = {}
    },

    completeOrder: state => {
      state.isOrderActive = false
    }
  }
})

export const {
  startOrder,
  startOrderFromStore,
  updatePickupDetails,
  updatePickupAddress, // NEW: Separate address updates

  updateSelectedClothes,
  updateSelectedStore,
  updateItemPrices,
  updatePaymentBreakdown,
  updateStorePrices,
  recalculateOrderAmount,
  createOrderPayload,
  setCurrentStep,
  nextStep,
  prevStep,
  updateOrderData,
  resetOrder,
  completeOrder
} = orderSlice.actions

export default orderSlice.reducer
