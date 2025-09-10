// components/order/forms/WashFoldForm.tsx
import { ServiceTypeEnum } from '@/enums'
import {
  updateSelectedClothes,
  updateStorePrices
} from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import ApiService from '@/services/ApiService'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

interface WashFoldFormProps {
  formData: any
  errors: Record<string, string>
  onFormDataChange: (data: any) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

// Clothing Type Counter Component (UNCHANGED)
const ClothingCounter = ({
  label,
  value,
  onChange,
  selected
}: {
  label: string
  value: number
  onChange: (value: number) => void
  selected: boolean
}) => {
  const decrease = () => {
    if (value > 0) onChange(value - 0.5)
  }

  const increase = () => {
    onChange(value + 0.5)
  }

  return (
    <View
      style={[
        styles.clothingCounter,
        selected && styles.clothingCounterSelected
      ]}
    >
      <Text
        style={[styles.clothingLabel, selected && styles.clothingLabelSelected]}
      >
        {label}
      </Text>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[styles.counterButton, styles.decreaseButton]}
          onPress={decrease}
        >
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>

        <Text
          style={[styles.counterValue, selected && styles.counterValueSelected]}
        >
          {value}
        </Text>

        <TouchableOpacity
          style={[styles.counterButton, styles.increaseButton]}
          onPress={increase}
        >
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function WashFoldForm ({
  formData,
  errors,
  onFormDataChange,
  onErrorsChange
}: WashFoldFormProps) {
  const dispatch = useDispatch()

  // NEW: Get store flow data from Redux
  const { isStoreFlow, orderData } = useSelector(
    (state: RootState) => state.order
  )

  const [clothNames, setClothNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get auth token
  const getAuthToken = async () => {
    // Implement your auth token retrieval logic here
    // This could be from AsyncStorage, MMKV, or another storage solution
    return 'your-auth-token-here'
  }

  // UPDATED: Conditional fetch based on store flow
  useEffect(() => {
    const fetchClothNames = async () => {
      try {
        setLoading(true)
        setError(null)

        let clothTypes = []

        // CONDITIONAL FETCHING: Store flow vs Normal flow
        if (isStoreFlow && orderData?.selectedStore?.store_id) {
          // Fetch from store-specific API
          console.log(
            '🏪 Fetching store-specific services for store:',
            orderData.selectedStore.store_id
          )

          const response = await ApiService.get({
            url: `/customer/services-offered?storeId=${orderData.selectedStore.store_id}&serviceType=WASH_N_FOLD`
          })

          console.log('📊 Store services API response:', response)

          // Parse store-specific data and extract cloth names
          const allDetails: any[] = []

          if (Array.isArray(response)) {
            response.forEach((service: any) => {
              // Extract poundDetails (weight-based items)
              if (Array.isArray(service.poundDetails)) {
                const validPoundDetails = service.poundDetails.filter(
                  (item: any) => item.deleted_at === null
                )
                allDetails.push(...validPoundDetails)
              }

              // Extract unitDetails (unit-based items)
              if (Array.isArray(service.unitDetails)) {
                const validUnitDetails = service.unitDetails.filter(
                  (item: any) => item.deleted_at === null
                )
                allDetails.push(...validUnitDetails)
              }
            })
          }

          // Extract cloth names and update prices in Redux
          clothTypes = allDetails.map(item => item.category)

          // Update Redux with pricing data from store
          const pricesMap = allDetails.reduce((acc, item) => {
            acc[item.category] = item.price
            return acc
          }, {} as Record<string, number>)

          console.log('ALL DETAILS :::: ', allDetails)

          console.log('PRICEMAP :::: ', pricesMap)

          console.log('💰 Updating Redux with store prices:', pricesMap)
          dispatch(
            updateStorePrices({
              serviceType: ServiceTypeEnum.WASH_N_FOLD,
              prices: pricesMap
            })
          )
        } else {
          // Normal flow - fetch from dropdown API
          console.log('🔄 Fetching normal flow cloth names...')

          const response = await ApiService.get({
            url: '/customer/core/dropdown/wash_fold'
          })

          console.log('📊 Normal wash & fold API response:', response)

          // Extract cloth names from API response structure
          if (response.data && Array.isArray(response.data.value)) {
            clothTypes = response.data.value
          } else if (Array.isArray(response.data)) {
            clothTypes = response.data
          } else if (response.value && Array.isArray(response.value)) {
            clothTypes = response.value
          }
        }

        // Fallback cloth types if API fails or returns empty
        if (clothTypes.length === 0) {
          console.log('⚠️ Using fallback cloth types')
          clothTypes = ['Mix Cloth', 'Household Cloth', 'Door Mats', 'Curtains']
        }

        setClothNames(clothTypes)
        console.log('✅ Loaded cloth names:', clothTypes)
      } catch (apiError) {
        console.error('❌ Failed to fetch cloth names:', apiError)
        setError('Failed to load cloth types')

        // Use fallback cloth types
        setClothNames(['Mix Cloth', 'Household Cloth', 'Door Mats', 'Curtains'])
      } finally {
        setLoading(false)
      }
    }

    fetchClothNames()
  }, [isStoreFlow, orderData?.selectedStore?.store_id, dispatch])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Calculate total weight from all cloth types
    const totalWeight = clothNames.reduce((acc, clothName) => {
      return acc + (formData[clothName] || 0)
    }, 0)

    if (totalWeight === 0) {
      newErrors.clothingItems = 'Please select at least one clothing type'
    }

    onErrorsChange(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    validateForm()
  }, [formData, clothNames])

  const handleClothingChange = (clothType: string, value: number) => {
    const updatedData = { [clothType]: value }
    onFormDataChange(updatedData)

    // Save to Redux whenever data changes
    const updatedFormData = { ...formData, ...updatedData }
    dispatch(updateSelectedClothes(updatedFormData))
  }

  // Show loading state (UNCHANGED)
  if (loading) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.loadingText}>Loading cloth types...</Text>
      </View>
    )
  }

  // Show error state (UNCHANGED)
  if (error) {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    )
  }

  // UI COMPLETELY UNCHANGED
  return (
    <View style={styles.inputContainer}>
      {/* Clothing Type Counters */}
      <View style={styles.clothingSection}>
        {clothNames.map(clothName => (
          <ClothingCounter
            key={clothName}
            label={clothName}
            value={formData[clothName] || 0}
            onChange={value => handleClothingChange(clothName, value)}
            selected={(formData[clothName] || 0) > 0}
          />
        ))}
      </View>

      {errors.clothingItems && (
        <Text style={styles.errorText}>{errors.clothingItems}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 20
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10
  },

  // Clothing Counter Styles
  clothingSection: {
    gap: 15
  },
  clothingCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    backgroundColor: '#f8f9fa'
  },
  clothingCounterSelected: {
    borderColor: '#008ECC',
    backgroundColor: 'white'
  },
  clothingLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
    flex: 1
  },
  clothingLabelSelected: {
    color: '#008ECC',
    fontWeight: '500'
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f3ff'
  },
  decreaseButton: {
    backgroundColor: '#f0f0f0'
  },
  increaseButton: {
    backgroundColor: '#e6f3ff'
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008ECC'
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    minWidth: 25,
    textAlign: 'center'
  },
  counterValueSelected: {
    color: '#008ECC'
  },

  // Loading and Error Styles
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic'
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 10
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    marginLeft: 4
  }
})
