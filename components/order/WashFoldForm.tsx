// components/order/forms/WashFoldForm.tsx
import React, { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
          <Text style={styles.counterButtonText}>−</Text>
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
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const totalWeight =
      (formData.mixCloth || 0) +
      (formData.householdCloth || 0) +
      (formData.doorMats || 0) +
      (formData.curtains || 0)

    if (totalWeight === 0) {
      newErrors.clothingItems = 'Please select at least one clothing type'
    }

    onErrorsChange(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    validateForm()
  }, [formData])

  const handleClothingChange = (type: string, value: number) => {
    onFormDataChange({ [type]: value })
  }

  const clothingTypes = [
    { key: 'mixCloth', label: 'Mix Cloth' },
    { key: 'householdCloth', label: 'Household Cloth' },
    { key: 'doorMats', label: 'Door Mats' },
    { key: 'curtains', label: 'Curtains' }
  ]

  return (
    <View style={styles.inputContainer}>
      {/* Clothing Type Counters */}
      <View style={styles.clothingSection}>
        {clothingTypes.map(({ key, label }) => (
          <ClothingCounter
            key={key}
            label={label}
            value={formData[key] || 0}
            onChange={value => handleClothingChange(key, value)}
            selected={(formData[key] || 0) > 0}
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
    paddingHorizontal: 20,
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
    gap: 15
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
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    marginLeft: 4
  }
})
