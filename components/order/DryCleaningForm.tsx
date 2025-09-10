// components/order/forms/DrycleaningForm.tsx
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

interface DrycleaningFormProps {
  formData: any
  errors: Record<string, string>
  onFormDataChange: (data: any) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

// Category Selector Component
const CategorySelector = ({
  selected,
  onSelect,
  categories,
  loading
}: {
  selected: string
  onSelect: (category: string) => void
  categories: string[]
  loading: boolean
}) => {
  if (loading) {
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.categoryContainer}>
      {categories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selected === category && styles.categoryButtonSelected
          ]}
          onPress={() => onSelect(category)}
        >
          <Text
            style={[
              styles.categoryText,
              selected === category && styles.categoryTextSelected
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

// Clothing Item Row Component
const ClothingItemRow = ({
  label,
  item,
  onCategoryChange,
  onQuantityChange,
  categories,
  categoriesLoading
}: {
  label: string
  item: { category: string; quantity: number }
  onCategoryChange: (category: string) => void
  onQuantityChange: (quantity: number) => void
  categories: string[]
  categoriesLoading: boolean
}) => {
  const decrease = () => {
    if (item.quantity > 0) {
      onQuantityChange(item.quantity - 1)
    }
  }

  const increase = () => {
    onQuantityChange(item.quantity + 1)
  }

  return (
    <View style={styles.clothingItemContainer}>
      <View style={styles.clothingLabelContainer}>
        <Text style={styles.clothingLabel}>{label}</Text>
      </View>

      <View style={styles.clothingControls}>
        <View>
          <CategorySelector
            selected={item.category}
            onSelect={onCategoryChange}
            categories={categories}
            loading={categoriesLoading}
          />
        </View>

        <View style={styles.counterControls}>
          <TouchableOpacity style={styles.counterButton} onPress={decrease}>
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.counterValue}>{item.quantity}</Text>

          <TouchableOpacity style={styles.counterButton} onPress={increase}>
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default function DrycleaningForm ({
  formData,
  errors,
  onFormDataChange,
  onErrorsChange
}: DrycleaningFormProps) {
  const dispatch = useDispatch()

  // NEW: Get store flow data from Redux
  const { isStoreFlow, orderData } = useSelector(
    (state: RootState) => state.order
  )

  const [clothNames, setClothNames] = useState<string[]>([])
  const [clothCategories, setClothCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug selector for verification
  const storePrices = useSelector(
    (state: RootState) => state.order.orderData?.storePrices
  )

  useEffect(() => {
    console.log(
      '🔍 Current DRYCLEANING store prices:',
      storePrices?.[ServiceTypeEnum.DRYCLEANING]
    )
  }, [storePrices])

  // UPDATED: Conditional fetch based on store flow
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true)
        setError(null)

        let names = []
        let categories = []

        // CONDITIONAL FETCHING: Store flow vs Normal flow
        if (isStoreFlow && orderData?.selectedStore?.store_id) {
          // Fetch from store-specific API
          console.log(
            '🏪 Fetching store-specific DRYCLEANING services for store:',
            orderData.selectedStore.store_id
          )

          const response = await ApiService.get({
            url: `/customer/services-offered?storeId=${orderData.selectedStore.store_id}&serviceType=DRYCLEANING`
          })

          console.log('📊 Store DRYCLEANING API response:', response)

          // Parse store-specific data
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

          // Extract cloth names and categories from store data
          names = allDetails.map(item => item.cloth_name).filter(Boolean)
          categories = [
            ...new Set(allDetails.map(item => item.category).filter(Boolean))
          ]

          // Create prices map from store data
          const pricesMap = allDetails.reduce((acc, item) => {
            if (item.cloth_name && item.price !== undefined) {
              acc[item.cloth_name] = item.price
            }
            return acc
          }, {} as Record<string, number>)

          console.log(
            '💰 Updating Redux with DRYCLEANING store prices:',
            pricesMap
          )

          // Dispatch store prices to Redux
          dispatch(
            updateStorePrices({
              serviceType: ServiceTypeEnum.DRYCLEANING,
              prices: pricesMap
            })
          )
        } else {
          // Normal flow - fetch from dropdown APIs
          console.log('🔄 Fetching normal flow cloth names and categories...')

          // Fetch both APIs in parallel
          const [clothNameResponse, clothCategoryResponse] = await Promise.all([
            ApiService.get({ url: '/customer/core/dropdown/cloth_name' }),
            ApiService.get({ url: '/customer/core/dropdown/cloth_category' })
          ])

          console.log('📊 Normal API responses received:', {
            clothName: clothNameResponse,
            clothCategory: clothCategoryResponse
          })

          // Extract cloth names for headers
          if (clothNameResponse && Array.isArray(clothNameResponse.value)) {
            names = clothNameResponse.value
          }

          // Extract cloth categories for buttons
          if (
            clothCategoryResponse &&
            Array.isArray(clothCategoryResponse.value)
          ) {
            categories = clothCategoryResponse.value
          }
        }

        setClothNames(names)
        setClothCategories(categories)

        console.log('✅ DRYCLEANING dropdown data loaded:', {
          clothNames: names,
          clothCategories: categories,
          isFromStore: isStoreFlow
        })
      } catch (apiError) {
        console.error('❌ Failed to fetch DRYCLEANING data:', apiError)
        setError('Failed to load form options')

        // Do not set fallback data - leave arrays empty
        setClothNames([])
        setClothCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchDropdownData()
  }, [isStoreFlow, orderData?.selectedStore?.store_id, dispatch])

  // Save to Redux whenever formData changes
  useEffect(() => {
    console.log('📊 DrycleaningForm - Current formData:', formData)

    if (Object.keys(formData).length > 0) {
      // Filter out items that don't have quantity > 0
      const validDrycleaningData: any = {}

      Object.keys(formData).forEach(clothName => {
        const clothInfo = formData[clothName]
        if (clothInfo && clothInfo.quantity > 0) {
          validDrycleaningData[clothName] = {
            category: clothInfo.category,
            quantity: clothInfo.quantity
          }
        }
      })

      // Only dispatch if we have valid drycleaning items
      if (Object.keys(validDrycleaningData).length > 0) {
        console.log(
          '✅ DrycleaningForm - Dispatching valid data to Redux:',
          validDrycleaningData
        )

        // Dispatch the clothes data directly to Redux
        dispatch(updateSelectedClothes(validDrycleaningData))
      } else {
        console.log(
          '⚠️ DrycleaningForm - No valid drycleaning items to dispatch'
        )
      }
    }
  }, [formData, dispatch])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one cloth name has quantity > 0
    const hasItems = clothNames.some(
      clothName => formData[clothName] && formData[clothName].quantity > 0
    )

    if (!hasItems && clothNames.length > 0) {
      newErrors.clothingItems = 'Please select at least one clothing item'
    }

    onErrorsChange(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    validateForm()
  }, [formData, clothNames])

  const handleClothingChange = (
    clothName: string,
    field: 'category' | 'quantity',
    value: string | number
  ) => {
    const defaultCategory =
      clothCategories.length > 0 ? clothCategories[0] : 'Mens'
    const currentItem = formData[clothName] || {
      category: defaultCategory,
      quantity: 0
    }

    const updatedFormData = {
      [clothName]: {
        ...currentItem,
        [field]: value
      }
    }

    console.log('🔄 DrycleaningForm - Updating item:', clothName, field, value)
    console.log('📝 DrycleaningForm - Updated form data:', updatedFormData)

    // Update local form state
    onFormDataChange(updatedFormData)
  }

  const defaultCategory =
    clothCategories.length > 0 ? clothCategories[0] : 'Mens'

  // Show loading state
  if (loading) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.loadingText}>
          {isStoreFlow
            ? 'Loading store services...'
            : 'Loading form options...'}
        </Text>
      </View>
    )
  }

  // Show error state or empty state if no data
  if (error || clothNames.length === 0) {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'No drycleaning services available'}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.inputContainer}>
      {/* Clothing Items Selection - Using cloth names as headers */}
      <View style={styles.clothingSection}>
        {clothNames.map(clothName => (
          <ClothingItemRow
            key={clothName}
            label={clothName} // Using cloth name as header (e.g., "Men's Dress Shirt")
            item={
              formData[clothName] || { category: defaultCategory, quantity: 0 }
            }
            onCategoryChange={category =>
              handleClothingChange(clothName, 'category', category)
            }
            onQuantityChange={quantity =>
              handleClothingChange(clothName, 'quantity', quantity)
            }
            categories={clothCategories} // Using cloth categories as buttons (e.g., "Kids", "Mens", "Womens")
            categoriesLoading={false}
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
    paddingHorizontal: 10
  },
  clothingSection: {
    // marginBottom: 20
  },
  clothingItemContainer: {
    padding: 1,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  clothingLabelContainer: {
    paddingHorizontal: 15,
    paddingVertical: 7
  },
  clothingLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333'
  },
  clothingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'white',
    paddingHorizontal: 5,
    paddingVertical: 10
  },

  // Category Selector Styles
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#008ECC',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'transparent'
  },
  categoryButtonSelected: {
    backgroundColor: '#e6f3ff'
  },
  categoryText: {
    fontSize: 14,
    color: '#008ECC',
    fontWeight: '500'
  },
  categoryTextSelected: {
    color: '#0056b3',
    fontWeight: '600'
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic'
  },

  // Counter Styles
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0
  },
  counterButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#008ECC'
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008ECC'
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 25,
    textAlign: 'center'
  },

  // Error Styles
  errorContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    marginLeft: 4
  }
})
