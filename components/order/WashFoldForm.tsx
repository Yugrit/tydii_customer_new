// components/order/forms/WashFoldForm.tsx
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import {
  updateSelectedClothes,
  updateStorePrices
} from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import ApiService from '@/services/ApiService'
import React, { useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

interface WashFoldFormProps {
  formData: any
  errors: Record<string, string>
  onFormDataChange: (data: any) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

// Enhanced Clothing Type Counter Component with Smart Increment Logic
const ClothingCounter = ({
  label,
  value,
  onChange,
  selected,
  colors
}: {
  label: string
  value: number
  onChange: (value: number) => void
  selected: boolean
  colors: any
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())

  // Update input value when external value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString())
    }
  }, [value, isEditing])

  // Smart decrease function
  const decrease = () => {
    if (value <= 0) return

    let newValue
    const remainder = value % 0.5

    if (remainder === 0) {
      newValue = Math.max(0, value - 0.5)
    } else {
      newValue = Math.floor(value / 0.5) * 0.5
    }

    onChange(newValue)
    if (isEditing) {
      setInputValue(newValue.toString())
    }
  }

  // Smart increase function
  const increase = () => {
    let newValue
    const remainder = value % 0.5

    if (remainder === 0) {
      newValue = value + 0.5
    } else {
      newValue = Math.ceil(value / 0.5) * 0.5
    }

    onChange(newValue)
    if (isEditing) {
      setInputValue(newValue.toString())
    }
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    setInputValue(value.toString())
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    const parsedValue = parseFloat(inputValue)

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      onChange(parsedValue)
    } else {
      setInputValue(value.toString())
    }
  }

  const handleInputChange = (text: string) => {
    const validInput = text.match(/^\d*\.?\d*$/)
    if (validInput || text === '') {
      setInputValue(text)
    }
  }

  const handleInputSubmit = () => {
    handleInputBlur()
  }

  const styles = createCounterStyles(colors, selected)

  return (
    <View style={styles.clothingCounter}>
      <Text style={styles.clothingLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[styles.counterButton, styles.decreaseButton]}
          onPress={decrease}
          disabled={value <= 0}
        >
          <Text
            style={[
              styles.counterButtonText,
              value <= 0 && styles.counterButtonTextDisabled
            ]}
          >
            -
          </Text>
        </TouchableOpacity>

        {isEditing ? (
          <TextInput
            style={styles.counterInput}
            value={inputValue}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onSubmitEditing={handleInputSubmit}
            keyboardType='decimal-pad'
            returnKeyType='done'
            selectTextOnFocus={true}
            maxLength={6}
            autoFocus={true}
          />
        ) : (
          <TouchableOpacity onPress={handleInputFocus}>
            <Text style={styles.counterValue}>{value}</Text>
          </TouchableOpacity>
        )}

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
  const colors = useThemeColors()

  // Get store flow data from Redux
  const { isStoreFlow, orderData } = useSelector(
    (state: RootState) => state.order
  )

  const [clothNames, setClothNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Conditional fetch based on store flow
  useEffect(() => {
    const fetchClothNames = async () => {
      try {
        setLoading(true)
        setError(null)

        let clothTypes = []

        if (isStoreFlow && orderData?.selectedStore?.store_id) {
          console.log(
            '🏪 Fetching store-specific services for store:',
            orderData.selectedStore.store_id
          )

          const response = await ApiService.get({
            url: `/customer/services-offered?storeId=${orderData.selectedStore.store_id}&serviceType=WASH_N_FOLD`
          })

          const allDetails: any[] = []

          if (Array.isArray(response)) {
            response.forEach((service: any) => {
              if (Array.isArray(service.poundDetails)) {
                const validPoundDetails = service.poundDetails.filter(
                  (item: any) => item.deleted_at === null
                )
                allDetails.push(...validPoundDetails)
              }

              if (Array.isArray(service.unitDetails)) {
                const validUnitDetails = service.unitDetails.filter(
                  (item: any) => item.deleted_at === null
                )
                allDetails.push(...validUnitDetails)
              }
            })
          }

          clothTypes = allDetails.map(item => item.category)

          const pricesMap = allDetails.reduce((acc, item) => {
            acc[item.category] = item.price
            return acc
          }, {} as Record<string, number>)

          dispatch(
            updateStorePrices({
              serviceType: ServiceTypeEnum.WASH_N_FOLD,
              prices: pricesMap
            })
          )
        } else {
          const response = await ApiService.get({
            url: '/customer/core/dropdown/wash_fold'
          })

          if (response.data && Array.isArray(response.data.value)) {
            clothTypes = response.data.value
          } else if (Array.isArray(response.data)) {
            clothTypes = response.data
          } else if (response.value && Array.isArray(response.value)) {
            clothTypes = response.value
          }
        }

        if (clothTypes.length === 0) {
          clothTypes = ['Mix Cloth', 'Household Cloth', 'Door Mats', 'Curtains']
        }

        setClothNames(clothTypes)
      } catch (apiError) {
        console.error('❌ Failed to fetch cloth names:', apiError)
        setError('Failed to load cloth types')
        setClothNames(['Mix Cloth', 'Household Cloth', 'Door Mats', 'Curtains'])
      } finally {
        setLoading(false)
      }
    }

    fetchClothNames()
  }, [isStoreFlow, orderData?.selectedStore?.store_id, dispatch])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

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

    const updatedFormData = { ...formData, ...updatedData }
    dispatch(updateSelectedClothes(updatedFormData))
  }

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss()
  }

  const styles = createMainStyles(colors)

  // Common content component
  const renderContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                colors={colors}
              />
            ))}
          </View>

          {errors.clothingItems && (
            <Text style={styles.errorText}>{errors.clothingItems}</Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  )

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cloth types...</Text>
      </View>
    )
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    )
  }

  // Platform-specific keyboard handling
  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior='padding'
        keyboardVerticalOffset={100}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    )
  }

  // For Android, use different approach
  return <View style={styles.container}>{renderContent()}</View>
}

// Main component styles
const createMainStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: Platform.OS === 'android' ? 0 : 0
    },
    inputContainer: {
      paddingHorizontal: 20,
      minHeight: '100%'
    },
    instructionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 15,
      textAlign: 'center',
      fontStyle: 'italic'
    },

    // Clothing Counter Styles
    clothingSection: {
      gap: 15
    },

    // Loading and Error Styles
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic'
    },
    errorContainer: {
      padding: 16,
      backgroundColor: colors.notification + '20', // Semi-transparent error background
      borderRadius: 8,
      margin: 10,
      borderWidth: 1,
      borderColor: colors.notification + '50'
    },
    errorText: {
      fontSize: 12,
      color: colors.notification,
      marginTop: 5,
      marginLeft: 4
    }
  })

// Counter component styles
const createCounterStyles = (colors: any, selected: boolean) =>
  StyleSheet.create({
    clothingCounter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 15,
      borderWidth: 1,
      borderColor: selected ? colors.primary : colors.border,
      borderRadius: 25,
      backgroundColor: selected ? colors.background : colors.surface
    },
    clothingLabel: {
      fontSize: 16,
      marginRight: 10,
      color: selected ? colors.primary : colors.textSecondary,
      fontWeight: selected ? '500' : '400',
      flex: 1
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
      justifyContent: 'center'
    },
    decreaseButton: {
      backgroundColor: colors.surface
    },
    increaseButton: {
      backgroundColor: colors.light
    },
    counterButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary
    },
    counterButtonTextDisabled: {
      color: colors.textSecondary
    },
    counterValue: {
      fontSize: 16,
      fontWeight: '600',
      color: selected ? colors.primary : colors.textSecondary,
      minWidth: 50,
      textAlign: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4
    },
    counterInput: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      minWidth: 50,
      textAlign: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 4,
      backgroundColor: colors.background
    }
  })
