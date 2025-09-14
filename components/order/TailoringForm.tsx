// components/order/forms/TailoringForm.tsx
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { useToast } from '@/hooks/useToast'
import {
  updateSelectedClothes,
  updateStorePrices
} from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import ApiService from '@/services/ApiService'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

interface TailoringFormProps {
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
  loading,
  colors
}: {
  selected: string
  onSelect: (category: string) => void
  categories: string[]
  loading: boolean
  colors: any
}) => {
  const styles = createCategorySelectorStyles(colors)

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

// Tailoring Type Dropdown Component
const TailoringTypeDropdown = ({
  selected,
  options,
  onSelect,
  colors
}: {
  selected: string
  options: string[]
  onSelect: (type: string) => void
  colors: any
}) => {
  const [showModal, setShowModal] = useState(false)
  const styles = createDropdownStyles(colors)

  return (
    <View style={styles.tailoringDropdownContainer}>
      <TouchableOpacity
        style={styles.tailoringDropdown}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.tailoringDropdownText}>
          {selected || 'Tailoring Type'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.modalTitle}>Select Tailoring Type</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    onSelect(item)
                    setShowModal(false)
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                  {selected === item && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// Tailoring Item Row Component
const TailoringItemRow = ({
  label,
  item,
  onCategoryChange,
  onTailoringTypeChange,
  tailoringOptions,
  categories,
  categoriesLoading,
  colors
}: {
  label: string
  item: { category: string; tailoringType: string }
  onCategoryChange: (category: string) => void
  onTailoringTypeChange: (type: string) => void
  tailoringOptions: string[]
  categories: string[]
  categoriesLoading: boolean
  colors: any
}) => {
  const styles = createTailoringItemStyles(colors)

  return (
    <View style={styles.tailoringItemContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.clothingLabel}>{label}</Text>
        <TailoringTypeDropdown
          selected={item.tailoringType}
          options={tailoringOptions}
          onSelect={onTailoringTypeChange}
          colors={colors}
        />
      </View>

      <View style={styles.tailoringControls}>
        <CategorySelector
          selected={item.category}
          onSelect={onCategoryChange}
          categories={categories}
          loading={categoriesLoading}
          colors={colors}
        />
      </View>
    </View>
  )
}

export default function TailoringForm ({
  formData,
  errors,
  onFormDataChange,
  onErrorsChange
}: TailoringFormProps) {
  const dispatch = useDispatch()
  const colors = useThemeColors()

  // Get store flow data from Redux
  const { isStoreFlow, orderData } = useSelector(
    (state: RootState) => state.order
  )

  const [clothNames, setClothNames] = useState<string[]>([])
  const [clothCategories, setClothCategories] = useState<string[]>([])
  const [tailoringTypes, setTailoringTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug selector for verification
  const storePrices = useSelector(
    (state: RootState) => state.order.orderData?.storePrices
  )

  useEffect(() => {
    console.log(
      '🔍 Current TAILORING store prices:',
      storePrices?.[ServiceTypeEnum.TAILORING]
    )
  }, [storePrices])

  const toast = useToast()

  // Conditional fetch based on store flow
  useEffect(() => {
    const fetchAllDropdownData = async () => {
      try {
        setLoading(true)
        setError(null)

        let names = []
        let categories = []
        let tailoringOptions = []

        // CONDITIONAL FETCHING: Store flow vs Normal flow
        if (isStoreFlow && orderData?.selectedStore?.store_id) {
          // Fetch from store-specific API
          console.log(
            '🏪 Fetching store-specific TAILORING services for store:',
            orderData.selectedStore.store_id
          )

          const response = await ApiService.get({
            url: `/customer/services-offered?storeId=${orderData.selectedStore.store_id}&serviceType=TAILORING`
          })

          console.log('📊 Store TAILORING API response:', response)

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

          // Extract cloth names, categories, and tailoring types from store data
          names = [
            ...new Set(allDetails.map(item => item.cloth_name).filter(Boolean))
          ]
          categories = [
            ...new Set(allDetails.map(item => item.category).filter(Boolean))
          ]
          tailoringOptions = [
            ...new Set(
              allDetails.map(item => item.tailoringType?.name).filter(Boolean)
            )
          ]

          // Create prices map from store data
          const itemPricesMap = allDetails.reduce((acc, item) => {
            if (item.cloth_name && item.price !== undefined) {
              acc[item.cloth_name] = item.price
            }
            return acc
          }, {} as Record<string, number>)

          // Create tailoring prices map
          const tailoringPricesMap = allDetails.reduce((acc, item) => {
            if (
              item.cloth_name &&
              item.tailoringType &&
              item.tailoringType.price !== undefined
            ) {
              acc[`${item.cloth_name}_${item.tailoringType.name}`] =
                item.tailoringType.price
            }
            return acc
          }, {} as Record<string, number>)

          console.log('💰 Updating Redux with TAILORING store prices:', {
            itemPrices: itemPricesMap,
            tailoringPrices: tailoringPricesMap
          })

          // Dispatch store prices to Redux
          dispatch(
            updateStorePrices({
              serviceType: ServiceTypeEnum.TAILORING,
              prices: itemPricesMap,
              tailoringPrices: tailoringPricesMap
            })
          )
        } else {
          // Normal flow - fetch from dropdown APIs
          console.log('🔄 Fetching normal flow tailoring data...')

          // Fetch all APIs in parallel
          const [
            clothNameResponse,
            clothCategoryResponse,
            tailoringTypeResponse
          ] = await Promise.all([
            ApiService.get({ url: '/customer/core/dropdown/cloth_name' }),
            ApiService.get({ url: '/customer/core/dropdown/cloth_category' }),
            ApiService.get({ url: '/customer/core/dropdown/tailoring_type' })
          ])

          console.log('📊 Normal API responses received:', {
            clothName: clothNameResponse,
            clothCategory: clothCategoryResponse,
            tailoringType: tailoringTypeResponse
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

          // Extract tailoring types for dropdown
          if (
            tailoringTypeResponse &&
            Array.isArray(tailoringTypeResponse.value)
          ) {
            tailoringOptions = tailoringTypeResponse.value
          }
        }

        setClothNames(names)
        setClothCategories(categories)
        setTailoringTypes(tailoringOptions)

        console.log('✅ TAILORING data loaded:', {
          clothNames: names,
          clothCategories: categories,
          tailoringTypes: tailoringOptions,
          isFromStore: isStoreFlow
        })
      } catch (apiError) {
        console.error('❌ Failed to fetch TAILORING data:', apiError)
        setError('Failed to load tailoring options')

        // Do not set fallback data - leave arrays empty
        setClothNames([])
        setClothCategories([])
        setTailoringTypes([])
        toast.error('Failed to fetch clothes')
      } finally {
        setLoading(false)
      }
    }

    fetchAllDropdownData()
  }, [isStoreFlow, orderData?.selectedStore?.store_id, dispatch])

  // Save to Redux whenever formData changes
  useEffect(() => {
    console.log('📊 TailoringForm - Current formData:', formData)

    if (Object.keys(formData).length > 0) {
      // Filter out items that don't have tailoringType selected
      const validTailoringData: any = {}

      Object.keys(formData).forEach(clothName => {
        const clothInfo = formData[clothName]
        if (clothInfo && clothInfo.tailoringType) {
          validTailoringData[clothName] = {
            category: clothInfo.category,
            tailoringType: clothInfo.tailoringType,
            quantity: 1 // For tailoring, quantity is always 1
          }
        }
      })

      // Only dispatch if we have valid tailoring items
      if (Object.keys(validTailoringData).length > 0) {
        console.log(
          '✅ TailoringForm - Dispatching valid data to Redux:',
          validTailoringData
        )

        // Dispatch the clothes data directly, not wrapped in another object
        dispatch(updateSelectedClothes(validTailoringData))
      } else {
        console.log('⚠️ TailoringForm - No valid tailoring items to dispatch')
      }
    }
  }, [formData, dispatch])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one cloth name has a tailoring type selected
    const hasItems = clothNames.some(
      clothName => formData[clothName] && formData[clothName].tailoringType
    )

    if (!hasItems && clothNames.length > 0) {
      newErrors.tailoringItems =
        'Please select tailoring service for at least one item'
    }

    onErrorsChange(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    validateForm()
  }, [formData, clothNames])

  const handleTailoringChange = (
    clothName: string,
    field: 'category' | 'tailoringType',
    value: string
  ) => {
    const defaultCategory =
      clothCategories.length > 0 ? clothCategories[0] : 'Mens'
    const currentItem = formData[clothName] || {
      category: defaultCategory,
      tailoringType: ''
    }

    const updatedFormData = {
      [clothName]: {
        ...currentItem,
        [field]: value
      }
    }

    console.log('🔄 TailoringForm - Updating item:', clothName, field, value)
    console.log('📝 TailoringForm - Updated form data:', updatedFormData)

    // Update local form state
    onFormDataChange(updatedFormData)
  }

  const defaultCategory =
    clothCategories.length > 0 ? clothCategories[0] : 'Mens'

  const styles = createMainStyles(colors)

  // Show loading state
  if (loading) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.loadingText}>
          {isStoreFlow
            ? 'Loading store services...'
            : 'Loading tailoring options...'}
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
            {error || 'No tailoring services available'}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.inputContainer}>
      {/* Tailoring Items Selection - Using cloth names as headers */}
      <View style={styles.tailoringSection}>
        {clothNames.map(clothName => (
          <TailoringItemRow
            key={clothName}
            label={clothName} // Using cloth name as header (e.g., "Men's Dress Shirt")
            item={
              formData[clothName] || {
                category: defaultCategory,
                tailoringType: ''
              }
            }
            onCategoryChange={category =>
              handleTailoringChange(clothName, 'category', category)
            }
            onTailoringTypeChange={type =>
              handleTailoringChange(clothName, 'tailoringType', type)
            }
            tailoringOptions={tailoringTypes} // Dynamic tailoring types from API
            categories={clothCategories} // Dynamic categories from API
            categoriesLoading={false}
            colors={colors}
          />
        ))}
      </View>

      {errors.tailoringItems && (
        <Text style={styles.errorText}>{errors.tailoringItems}</Text>
      )}
    </View>
  )
}

// Main styles
const createMainStyles = (colors: any) =>
  StyleSheet.create({
    inputContainer: {
      paddingHorizontal: 20,
      backgroundColor: colors.background
    },
    tailoringSection: {},
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic'
    },
    errorContainer: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: colors.notification + '20',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.notification + '50'
    },
    errorText: {
      fontSize: 12,
      color: colors.notification,
      marginLeft: 4
    }
  })

// Category Selector styles
const createCategorySelectorStyles = (colors: any) =>
  StyleSheet.create({
    categoryContainer: {
      flexDirection: 'row',
      gap: 8,
      flex: 1
    },
    categoryButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: 'transparent'
    },
    categoryButtonSelected: {
      backgroundColor: colors.light
    },
    categoryText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500'
    },
    categoryTextSelected: {
      color: colors.primary,
      fontWeight: '600'
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic'
    }
  })

// Tailoring Item styles
const createTailoringItemStyles = (colors: any) =>
  StyleSheet.create({
    tailoringItemContainer: {
      marginBottom: 20,
      paddingBottom: 2,
      paddingHorizontal: 2,
      backgroundColor: colors.surface
    },
    headerRow: {
      paddingHorizontal: 5,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    clothingLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      flex: 1
    },
    tailoringControls: {
      backgroundColor: colors.background,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center'
    }
  })

// Dropdown styles
const createDropdownStyles = (colors: any) =>
  StyleSheet.create({
    tailoringDropdownContainer: {
      width: 150
    },
    tailoringDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.background,
      minHeight: 40
    },
    tailoringDropdownText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1
    },
    dropdownArrow: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    dropdownModal: {
      backgroundColor: colors.background,
      borderRadius: 12,
      width: 300,
      maxHeight: 400,
      elevation: 10,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      textAlign: 'center'
    },
    dropdownOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    dropdownOptionText: {
      fontSize: 16,
      color: colors.text,
      flex: 1
    },
    selectedIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary
    }
  })
