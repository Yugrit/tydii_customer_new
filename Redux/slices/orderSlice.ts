// Redux/slices/orderSlice.ts
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
  price: number
}

interface OrderItem {
  quantity: number
  price: number
  item_name: string
  item_type: string
  tailoring_types?: TailoringType[]
}

interface PaymentBreakdown {
  orderAmount: number
  discount: number
  tax: number
  platformFee: number
  deliveryCharge: number
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

  [key: string]: any
}

interface OrderState {
  serviceType: ServiceTypeEnum
  currentStep: number
  totalSteps: number
  orderData: OrderData
  isOrderActive: boolean
}

const initialState: OrderState = {
  serviceType: ServiceTypeEnum.WASH_N_FOLD,
  currentStep: 1,
  totalSteps: 4,
  orderData: {},
  isOrderActive: false
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
      state.orderData = {
        serviceType: action.payload
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

    // Step 3: Add Selected Clothes (different for each service type)
    updateSelectedClothes: (state, action: PayloadAction<any>) => {
      const clothesData = action.payload
      const items: OrderItem[] = []
      let totalItems = 0
      let totalWeight = 0

      // Process different service types
      if (state.serviceType === ServiceTypeEnum.WASH_N_FOLD) {
        // For Wash & Fold: clothesData is { "Mix Cloth": 2.5, "Household Cloth": 1.0 }
        Object.keys(clothesData).forEach(clothName => {
          const weight = clothesData[clothName]
          if (weight > 0) {
            items.push({
              quantity: weight,
              price: weight * 10, // Example pricing
              item_name: clothName,
              item_type: 'WASH_N_FOLD'
            })
            totalWeight += weight
            totalItems += 1
          }
        })
      } else if (state.serviceType === ServiceTypeEnum.DRYCLEANING) {
        // For Dry Cleaning: clothesData is { "Men's Dress Shirt": { category: "Mens", quantity: 2 } }
        Object.keys(clothesData).forEach(clothName => {
          const clothInfo = clothesData[clothName]
          if (clothInfo.quantity > 0) {
            items.push({
              quantity: clothInfo.quantity,
              price: clothInfo.quantity * 15, // Example pricing
              item_name: clothName,
              item_type: 'DRYCLEANING'
            })
            totalItems += clothInfo.quantity
          }
        })
      } else if (state.serviceType === ServiceTypeEnum.TAILORING) {
        // For Tailoring: clothesData is { "Men's Dress Shirt": { category: "Mens", tailoringType: "Button Fix" } }
        Object.keys(clothesData).forEach(clothName => {
          const clothInfo = clothesData[clothName]
          if (clothInfo.tailoringType) {
            const tailoringPrice = getTailoringPrice(clothInfo.tailoringType)
            items.push({
              quantity: 1,
              price: tailoringPrice,
              item_name: clothName,
              item_type: 'TAILORING',
              tailoring_types: [
                {
                  name: clothInfo.tailoringType,
                  price: tailoringPrice
                }
              ]
            })
            totalItems += 1
          }
        })
      }

      state.orderData.selectedClothes = {
        items,
        totalWeight,
        totalItems
      }
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

    // Step 5: Add Payment Breakdown
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
        tax,
        platformFee = 20,
        deliveryCharge = 30
      } = action.payload

      state.orderData.paymentBreakdown = {
        orderAmount,
        discount,
        tax: tax || Math.round(orderAmount * 0.1), // 10% tax if not provided
        platformFee,
        deliveryCharge
      }
    },

    // Navigation actions
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },

    nextStep: state => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1
      }
    },

    prevStep: state => {
      if (state.currentStep > 1) {
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
    // Redux/slices/orderSlice.ts - Fix for generateAPIPayload reducer
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
        total_amount: calculateTotalAmount(orderData),
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
          platformFee: 20,
          deliveryCharge: 30
        }
      }

      state.orderData.apiPayload = apiPayload
    },

    resetOrder: state => {
      state.serviceType = ServiceTypeEnum.WASH_N_FOLD
      state.currentStep = 1
      state.orderData = {}
      state.isOrderActive = false
    },

    completeOrder: state => {
      state.isOrderActive = false
    }
  }
})

// Helper functions
function getTailoringPrice (tailoringType: string): number {
  const priceMap: { [key: string]: number } = {
    'Button Fix': 50,
    'Bottom Length Crop': 100,
    'Waist Fix': 150,
    'Hem Pants': 80,
    'Take In Waist': 120,
    'Shorten Sleeves': 90,
    'Replace Zipper': 200,
    'Patch or Repair Tears': 100,
    'Custom Request (Please describe)': 250,
    'Adjust Jacket Shoulders': 300
  }
  return priceMap[tailoringType] || 100
}

function calculateTotalAmount (orderData: OrderData): number {
  const itemsTotal =
    orderData.selectedClothes?.items.reduce(
      (sum, item) => sum + item.price,
      0
    ) || 0
  const payment = orderData.paymentBreakdown
  if (payment) {
    return (
      itemsTotal +
      payment.tax +
      payment.platformFee +
      payment.deliveryCharge -
      payment.discount
    )
  }
  return itemsTotal
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
  updatePickupDetails,
  updateSelectedClothes,
  updateSelectedStore,
  updatePaymentBreakdown,
  setCurrentStep,
  nextStep,
  prevStep,
  updateOrderData,
  generateAPIPayload,
  resetOrder,
  completeOrder
} = orderSlice.actions

export default orderSlice.reducer
