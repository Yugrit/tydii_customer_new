// components/order/forms/DrycleaningForm.tsx
import React, { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface DrycleaningFormProps {
  formData: any
  errors: Record<string, string>
  onFormDataChange: (data: any) => void
  onErrorsChange: (errors: Record<string, string>) => void
}

// Gender Selector Component
const GenderSelector = ({
  selected,
  onSelect
}: {
  selected: string
  onSelect: (gender: string) => void
}) => {
  const genders = ['Male', 'Female', 'Kids']

  return (
    <View style={styles.genderContainer}>
      {genders.map(gender => (
        <TouchableOpacity
          key={gender}
          style={[
            styles.genderButton,
            selected === gender && styles.genderButtonSelected
          ]}
          onPress={() => onSelect(gender)}
        >
          <Text
            style={[
              styles.genderText,
              selected === gender && styles.genderTextSelected
            ]}
          >
            {gender}
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
  onGenderChange,
  onQuantityChange
}: {
  label: string
  item: { gender: string; quantity: number }
  onGenderChange: (gender: string) => void
  onQuantityChange: (quantity: number) => void
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
      <View
        style={{
          paddingHorizontal: 15,
          paddingVertical: 7
        }}
      >
        <Text style={styles.clothingLabel}>{label}</Text>
      </View>

      <View
        style={[
          styles.clothingControls,
          {
            backgroundColor: 'white',
            paddingHorizontal: 5,
            paddingVertical: 10
          }
        ]}
      >
        <View>
          <GenderSelector selected={item.gender} onSelect={onGenderChange} />
        </View>

        <View style={styles.counterControls}>
          <TouchableOpacity style={styles.counterButton} onPress={decrease}>
            <Text style={styles.counterButtonText}>−</Text>
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
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one item has quantity > 0
    const clothingTypes = ['shirt', 'pant', 'skirt', 'top', 'saree']
    const hasItems = clothingTypes.some(
      type => formData[type] && formData[type].quantity > 0
    )

    if (!hasItems) {
      newErrors.clothingItems = 'Please select at least one clothing item'
    }

    onErrorsChange(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    validateForm()
  }, [formData])

  const handleClothingChange = (
    type: string,
    field: 'gender' | 'quantity',
    value: string | number
  ) => {
    const currentItem = formData[type] || { gender: 'Male', quantity: 0 }

    onFormDataChange({
      [type]: {
        ...currentItem,
        [field]: value
      }
    })
  }

  const clothingTypes = [
    { key: 'shirt', label: 'Shirt' },
    { key: 'pant', label: 'Pant' },
    { key: 'skirt', label: 'Skirt' },
    { key: 'top', label: 'Top' },
    { key: 'saree', label: 'Saree' }
  ]

  return (
    <View style={styles.inputContainer}>
      {/* Clothing Items Selection */}
      <View style={styles.clothingSection}>
        {clothingTypes.map(({ key, label }) => (
          <ClothingItemRow
            key={key}
            label={label}
            item={formData[key] || { gender: 'Male', quantity: 0 }}
            onGenderChange={gender =>
              handleClothingChange(key, 'gender', gender)
            }
            onQuantityChange={quantity =>
              handleClothingChange(key, 'quantity', quantity)
            }
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
    gap: 10
  },
  // Gender Selector Styles
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5
  },
  genderButton: {
    borderWidth: 1,
    borderColor: '#008ECC',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'transparent'
  },
  genderButtonSelected: {
    backgroundColor: '#e6f3ff'
  },
  genderText: {
    fontSize: 14,
    color: '#008ECC',
    fontWeight: '500'
  },
  genderTextSelected: {
    color: '#0056b3',
    fontWeight: '600'
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
  // Info Styles
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#008ECC'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  featuresList: {
    marginLeft: 8
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    marginLeft: 4
  }
})
