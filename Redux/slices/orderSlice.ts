// Redux/slices/orderSlice.ts - COMPLETE UPDATED VERSION WITH PRICE MANAGEMENT
import { ServiceTypeEnum } from '@/enums'
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
  price?: number // Made optional
}

interface OrderItem {
  quantity: number
  price?: number // Made optional
  item_name: string
  item_type: string
  tailoring_types?: TailoringType[]
  category?: string // Added for better item matching
}

interface PaymentBreakdown {
  orderAmount: number
  discount: number
  tax: number
  platformFee: number
  deliveryCharge: number
}

// NEW: Service-specific price storage
interface ServicePrices {
  itemPrices: Record<string, number>
  tailoringPrices?: Record<string, number>
}

interface OrderData {
  // Step 1: Service Selection (handled by startOrder)
  serviceType?: ServiceTypeEnum

  // Step 2: Pickup Details
  pickupDetails?: {
    location: string
    collectionDate: string
    collectionTime: string
    deliveryDate: string
    deliveryTime: string
    partnerNote: string
    repeatOption: string
  }

  // Step 3: Clothes Selection
  selectedClothes?: {
    items: OrderItem[]
    totalWeight: number
    totalItems: number
  }

  // Step 4: Store Selection
  selectedStore?: {
    store_id: number
    store_name: string
    store_address: string
  }

  // Step 5: Payment & Confirmation
  paymentBreakdown?: PaymentBreakdown

  // NEW: Service-specific price storage
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
  isStoreFlow: boolean // Track order flow type
  storeFlowData?: {
    // Store flow specific data
    selectedStore?: {
      store_id: number
      store_name: string
      store_address: string
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
      state.isStoreFlow = false // Service flow
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
          store_address: string
        }
      }>
    ) => {
      state.serviceType = action.payload.serviceType
      state.currentStep = 1
      state.isOrderActive = true
      state.isStoreFlow = true // Store flow
      state.storeFlowData = {
        selectedStore: action.payload.store
      }
      state.orderData = {
        serviceType: action.payload.serviceType,
        selectedStore: action.payload.store // Pre-populate store
      }
    },

    // Step 2: Add Pickup Details
    updatePickupDetails: (
      state,
      action: PayloadAction<{
        location: string
        collectionDate: string
        collectionTime: string
        deliveryDate?: string
        deliveryTime?: string
        partnerNote?: string
        repeatOption?: string
      }>
    ) => {
      state.orderData.pickupDetails = {
        location: action.payload.location,
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

    // NEW: Universal price storage for all service types
    updateStorePrices: (
      state,
      action: PayloadAction<{
        serviceType: ServiceTypeEnum
        prices: Record<string, number>
        tailoringPrices?: Record<string, number>
      }>
    ) => {
      // Initialize prices object if not exists
      if (!state.orderData) {
        state.orderData = {}
      }
      if (!state.orderData.storePrices) {
        state.orderData.storePrices = {}
      }

      const { serviceType, prices, tailoringPrices } = action.payload

      // Store prices by service type
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

            // Update tailoring prices if applicable
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

      // Get service-specific prices
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
        // ENHANCED: Tailoring with price support
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

      // NEW: Auto-calculate and update order amount based on item prices
      const orderAmount = items.reduce((sum, item) => {
        let itemTotal = 0

        // Calculate base item cost
        if (item.price && item.quantity) {
          itemTotal += item.price * item.quantity
        }

        // Add tailoring costs if applicable
        if (item.tailoring_types) {
          item.tailoring_types.forEach(tailoringType => {
            if (tailoringType.price) {
              itemTotal += tailoringType.price
            }
          })
        }

        return sum + itemTotal
      }, 0)

      // Initialize payment breakdown if it doesn't exist
      if (!state.orderData.paymentBreakdown) {
        state.orderData.paymentBreakdown = {
          orderAmount: 0,
          discount: 0,
          tax: 0,
          platformFee: 0,
          deliveryCharge: 0
        }
      }

      // Update the order amount
      state.orderData.paymentBreakdown.orderAmount = orderAmount

      console.log('💰 Redux - Updated order amount:', orderAmount)
    },

    // ADD: Standalone reducer to recalculate order amount (useful when prices update)
    recalculateOrderAmount: state => {
      if (!state.orderData.selectedClothes?.items) return

      const orderAmount = state.orderData.selectedClothes.items.reduce(
        (sum, item) => {
          let itemTotal = 0

          // Calculate base item cost
          if (item.price && item.quantity) {
            itemTotal += item.price * item.quantity
          }

          // Add tailoring costs if applicable
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

      // Initialize payment breakdown if it doesn't exist
      if (!state.orderData.paymentBreakdown) {
        state.orderData.paymentBreakdown = {
          orderAmount: 0,
          discount: 0,
          tax: 0,
          platformFee: 0,
          deliveryCharge: 0
        }
      }

      // Update the order amount
      state.orderData.paymentBreakdown.orderAmount = orderAmount

      console.log('💰 Redux - Recalculated order amount:', orderAmount)
    },

    // ENHANCED: Service-specific price updates
    updateItemPrices: (
      state,
      action: PayloadAction<{
        serviceType?: ServiceTypeEnum // Make optional, default to current service
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
          // Only update items of the matching service type
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

          // Update tailoring price if it's a tailoring item
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

    // Step 4: Add Selected Store
    updateSelectedStore: (
      state,
      action: PayloadAction<{
        store_id: number
        store_name: string
        store_address: string
      }>
    ) => {
      state.orderData.selectedStore = action.payload
    },

    // Accept total amount directly from API
    updatePaymentBreakdown: (
      state,
      action: PayloadAction<{
        orderAmount: number // Required - comes from API
        discount?: number
        tax?: number
        platformFee?: number
        deliveryCharge?: number
      }>
    ) => {
      const {
        orderAmount, // This comes from the API (e.g., totalPrice from store response)
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

    // Navigation actions
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },

    nextStep: state => {
      // For store flow, skip store selection step (step 3)
      if (state.isStoreFlow && state.currentStep === 2) {
        // Skip from step 2 (clothes) directly to step 4 (confirm)
        state.currentStep = 4
      } else if (state.currentStep < state.totalSteps) {
        state.currentStep += 1
      }
    },

    prevStep: state => {
      // For store flow, skip store selection step (step 3) when going back
      if (state.isStoreFlow && state.currentStep === 4) {
        // Skip from step 4 (confirm) directly to step 2 (clothes)
        state.currentStep = 2
      } else if (state.currentStep > 1) {
        state.currentStep -= 1
      }
    },

    // Generic update for any additional data
    updateOrderData: (
      state,
      action: PayloadAction<{ step: string; data: any }>
    ) => {
      const { step, data } = action.payload
      state.orderData[step] = data
    },

    // Generate final API payload
    generateAPIPayload: (state, action: PayloadAction<{ userId: number }>) => {
      const { userId } = action.payload
      const orderData = state.orderData

      // Use nullish coalescing operator (??) to provide fallback values
      const pickupDate = orderData.pickupDetails?.collectionDate ?? ''
      const pickupTime =
        orderData.pickupDetails?.collectionTime ?? '10:00 AM-08:00 PM'
      const deliveryDate = orderData.pickupDetails?.deliveryDate ?? pickupDate
      const deliveryTime = orderData.pickupDetails?.deliveryTime ?? pickupTime
      const partnerNote = orderData.pickupDetails?.partnerNote ?? ''
      const repeatOption = orderData.pickupDetails?.repeatOption ?? 'no-repeat'
      const location = orderData.pickupDetails?.location ?? ''

      const apiPayload = {
        user_id: userId,
        store_id: orderData.selectedStore?.store_id ?? 0,
        repeat_frequency: repeatOption,
        total_amount: getTotalAmountFromAPI(orderData),
        status: 'Pending',
        pickup: {
          pickup_date: pickupDate,
          pickup_time_slot: {
            open: pickupTime.split('-')[0] || '10:00 AM',
            close: pickupTime.split('-')[1] || '08:00 PM',
            note: 'Available during business hours'
          },
          pickup_address: parseAddress(location),
          pickup_type: 'Home_Pickup',
          delivery_date: deliveryDate,
          delivery_time_slot: {
            open: deliveryTime.split('-')[0] || '10:00 AM',
            close: deliveryTime.split('-')[1] || '08:00 PM',
            note: 'Available during business hours'
          },
          delivery_address: parseAddress(location),
          pickup_status: 'Scheduled'
        },
        description: partnerNote,
        services: [
          {
            service_type: state.serviceType,
            estimated_weight_or_qty:
              orderData.selectedClothes?.totalWeight ??
              orderData.selectedClothes?.totalItems ??
              1,
            notes: partnerNote,
            items: orderData.selectedClothes?.items ?? []
          }
        ],
        payment_breakdown: orderData.paymentBreakdown ?? {
          orderAmount: 0,
          discount: 0,
          tax: 0,
          platformFee: 0,
          deliveryCharge: 0
        }
      }

      state.orderData.apiPayload = apiPayload
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

// Use API total instead of calculating
function getTotalAmountFromAPI (orderData: OrderData): number {
  // Return the total from payment breakdown (which comes from API)
  const payment = orderData.paymentBreakdown
  if (payment) {
    const total =
      payment.orderAmount +
      payment.tax +
      payment.platformFee +
      payment.deliveryCharge -
      payment.discount
    console.log('💵 Using API total amount:', total)
    return total
  }

  console.log('⚠️ No payment breakdown available')
  return 0
}

function parseAddress (location: string): Address {
  // Simple address parsing - in real app, you'd get this from user's saved addresses
  return {
    address_line: location || '',
    city: 'City',
    state: 'State',
    pincode: '123456',
    landmark: '',
    lat: '0.0',
    long: '0.0'
  }
}

export const {
  startOrder,
  startOrderFromStore,
  updatePickupDetails,
  updateSelectedClothes,
  updateSelectedStore,
  updateItemPrices,
  updatePaymentBreakdown,
  updateStorePrices, // NEW: Universal price storage
  setCurrentStep,
  nextStep,
  prevStep,
  updateOrderData,
  generateAPIPayload,
  resetOrder,
  completeOrder
} = orderSlice.actions

export default orderSlice.reducer
