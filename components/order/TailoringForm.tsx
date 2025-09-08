// components/order/forms/TailoringForm.tsx
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

interface TailoringFormProps {
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

// Tailoring Type Dropdown Component
const TailoringTypeDropdown = ({
  selected,
  options,
  onSelect
}: {
  selected: string
  options: string[]
  onSelect: (type: string) => void
}) => {
  const [showModal, setShowModal] = useState(false)

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

      {/* Dropdown Modal */}
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
  onGenderChange,
  onTailoringTypeChange,
  tailoringOptions
}: {
  label: string
  item: { gender: string; tailoringType: string }
  onGenderChange: (gender: string) => void
  onTailoringTypeChange: (type: string) => void
  tailoringOptions: string[]
}) => {
  return (
    <View style={styles.tailoringItemContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.clothingLabel}>{label}</Text>
        <TailoringTypeDropdown
          selected={item.tailoringType}
          options={tailoringOptions}
          onSelect={onTailoringTypeChange}
        />
      </View>

      <View style={styles.tailoringControls}>
        <GenderSelector selected={item.gender} onSelect={onGenderChange} />
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
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one item has a tailoring type selected
    const clothingTypes = ['shirt', 'pant', 'skirt', 'top', 'saree']
    const hasItems = clothingTypes.some(
      type => formData[type] && formData[type].tailoringType
    )

    if (!hasItems) {
      newErrors.tailoringItems =
        'Please select tailoring service for at least one item'
    }

    onErrorsChange(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    validateForm()
  }, [formData])

  const handleTailoringChange = (
    type: string,
    field: 'gender' | 'tailoringType',
    value: string
  ) => {
    const currentItem = formData[type] || { gender: 'Male', tailoringType: '' }

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

  const tailoringOptions = [
    'Hemming',
    'Sleeve Adjustment',
    'Waist Adjustment',
    'Shoulder Fitting',
    'Take In/Let Out',
    'Length Alteration',
    'Button Replacement',
    'Zipper Repair',
    'Custom Fitting',
    'Complete Resizing'
  ]

  return (
    <View style={styles.inputContainer}>
      {/* Tailoring Items Selection */}
      <View style={styles.tailoringSection}>
        {clothingTypes.map(({ key, label }) => (
          <TailoringItemRow
            key={key}
            label={label}
            item={formData[key] || { gender: 'Male', tailoringType: '' }}
            onGenderChange={gender =>
              handleTailoringChange(key, 'gender', gender)
            }
            onTailoringTypeChange={type =>
              handleTailoringChange(key, 'tailoringType', type)
            }
            tailoringOptions={tailoringOptions}
          />
        ))}
      </View>

      {errors.tailoringItems && (
        <Text style={styles.errorText}>{errors.tailoringItems}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 20
  },
  tailoringSection: {
    marginBottom: 20
  },
  tailoringItemContainer: {
    marginBottom: 20,
    paddingBottom: 2,
    paddingHorizontal: 2,
    backgroundColor: '#F6F6F6'
  },
  headerRow: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  clothingLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  tailoringControls: {
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  // Gender Selector Styles
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1
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
  // Tailoring Dropdown Styles
  tailoringDropdownContainer: {
    width: 150
  },
  tailoringDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    minHeight: 40
  },
  tailoringDropdownText: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: 'white',
    borderRadius: 12,
    width: 300,
    maxHeight: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center'
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#008ECC'
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginLeft: 4
  }
})
