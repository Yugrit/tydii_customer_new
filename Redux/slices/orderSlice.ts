// Redux/slices/orderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface OrderData {
  pickupDetails?: any
  selectedClothes?: any
  selectedStore?: any
  confirmation?: any
  [key: string]: any // Add this index signature to allow dynamic keys
}

interface OrderState {
  serviceType: string
  currentStep: number
  totalSteps: number
  orderData: OrderData
  isOrderActive: boolean
}

const initialState: OrderState = {
  serviceType: 'Wash & Fold',
  currentStep: 1,
  totalSteps: 4,
  orderData: {},
  isOrderActive: false
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    startOrder: (state, action: PayloadAction<string>) => {
      state.serviceType = action.payload
      state.currentStep = 1
      state.isOrderActive = true
      state.orderData = {}
    },
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
    updateOrderData: (
      state,
      action: PayloadAction<{ step: string; data: any }>
    ) => {
      const { step, data } = action.payload
      // Now this works without TypeScript error
      state.orderData[step] = data
    },
    resetOrder: state => {
      state.serviceType = 'Wash & Fold'
      state.currentStep = 1
      state.orderData = {}
      state.isOrderActive = false
    },
    completeOrder: state => {
      state.isOrderActive = false
    }
  }
})

export const {
  startOrder,
  setCurrentStep,
  nextStep,
  prevStep,
  updateOrderData,
  resetOrder,
  completeOrder
} = orderSlice.actions

export default orderSlice.reducer
