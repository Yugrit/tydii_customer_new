// components/order/forms/WashFoldForm.tsx
import { updateSelectedClothes } from '@/Redux/slices/orderSlice'
import ApiService from '@/services/ApiService'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

interface WashFoldFormProps {
  formData: any
  errors: Record<string, string>
  onFormDataChange: (data: any) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

// Clothing Type Counter Component
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
  const [clothNames, setClothNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cloth names from API
  useEffect(() => {
    const fetchClothNames = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Fetching wash & fold cloth names...')

        const response = await ApiService.get({
          url: '/customer/core/dropdown/wash_fold'
        })

        console.log('📊 Wash & fold API response:', response)

        // Extract cloth names from API response structure
        // Expected: { id: 1, key: "wash_fold", value: ["Comforter / Duvet", "Towel-Only Wash and Fold", ...] }
        let clothTypes = []

        if (response.data && Array.isArray(response.data.value)) {
          clothTypes = response.data.value
        } else if (Array.isArray(response.data)) {
          clothTypes = response.data
        } else if (response.value && Array.isArray(response.value)) {
          clothTypes = response.value
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
  }, [])

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

  // Show loading state
  if (loading) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.loadingText}>Loading cloth types...</Text>
      </View>
    )
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    )
  }

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
