// components/order/forms/TailoringForm.tsx
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
  categoriesLoading
}: {
  label: string
  item: { category: string; tailoringType: string }
  onCategoryChange: (category: string) => void
  onTailoringTypeChange: (type: string) => void
  tailoringOptions: string[]
  categories: string[]
  categoriesLoading: boolean
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
        <CategorySelector
          selected={item.category}
          onSelect={onCategoryChange}
          categories={categories}
          loading={categoriesLoading}
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
  const [clothNames, setClothNames] = useState<string[]>([])
  const [clothCategories, setClothCategories] = useState<string[]>([])
  const [tailoringTypes, setTailoringTypes] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all dropdown data in parallel
  useEffect(() => {
    const fetchAllDropdownData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Fetching tailoring form data...')

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

        console.log('📊 All API responses received:', {
          clothName: clothNameResponse,
          clothCategory: clothCategoryResponse,
          tailoringType: tailoringTypeResponse
        })

        // Extract cloth names for headers
        let names = []
        if (
          clothNameResponse.data &&
          Array.isArray(clothNameResponse.data.value)
        ) {
          names = clothNameResponse.data.value
        } else {
          names = [
            "Men's Dress Shirt",
            "Women's Blouse",
            'Pants / Trousers',
            'Suit Jacket / Blazer',
            'Casual Dress'
          ]
        }

        // Extract cloth categories for buttons
        let categories = []
        if (
          clothCategoryResponse.data &&
          Array.isArray(clothCategoryResponse.data.value)
        ) {
          categories = clothCategoryResponse.data.value
        } else {
          categories = ['Kids', 'Mens', 'Womens']
        }

        // Extract tailoring types for dropdown
        let tailoringOptions = []
        if (
          tailoringTypeResponse.data &&
          Array.isArray(tailoringTypeResponse.data.value)
        ) {
          tailoringOptions = tailoringTypeResponse.data.value
        } else {
          tailoringOptions = [
            'Button Fix',
            'Bottom Length Crop',
            'Waist Fix',
            'Hem Pants',
            'Take In Waist',
            'Shorten Sleeves',
            'Replace Zipper',
            'Patch or Repair Tears',
            'Custom Request (Please describe)',
            'Adjust Jacket Shoulders'
          ]
        }

        setClothNames(names)
        setClothCategories(categories)
        setTailoringTypes(tailoringOptions)

        console.log('✅ All tailoring data loaded:', {
          clothNames: names,
          clothCategories: categories,
          tailoringTypes: tailoringOptions
        })
      } catch (apiError) {
        console.error('❌ Failed to fetch tailoring data:', apiError)
        setError('Failed to load form options')

        // Set fallback data
        setClothNames([
          "Men's Dress Shirt",
          "Women's Blouse",
          'Pants / Trousers',
          'Suit Jacket / Blazer',
          'Casual Dress'
        ])
        setClothCategories(['Kids', 'Mens', 'Womens'])
        setTailoringTypes([
          'Button Fix',
          'Bottom Length Crop',
          'Waist Fix',
          'Hem Pants',
          'Take In Waist',
          'Shorten Sleeves',
          'Replace Zipper',
          'Patch or Repair Tears',
          'Custom Request (Please describe)',
          'Adjust Jacket Shoulders'
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAllDropdownData()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one cloth name has a tailoring type selected
    const hasItems = clothNames.some(
      clothName => formData[clothName] && formData[clothName].tailoringType
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

    onFormDataChange({
      [clothName]: {
        ...currentItem,
        [field]: value
      }
    })
  }

  const defaultCategory =
    clothCategories.length > 0 ? clothCategories[0] : 'Mens'

  // Show loading state
  if (loading) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.loadingText}>Loading tailoring options...</Text>
      </View>
    )
  }

  return (
    <View style={styles.inputContainer}>
      {/* Show error if API calls failed */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

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
  tailoringSection: {},
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
    fontSize: 15,
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

  // Category Selector Styles
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1
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
    marginLeft: 4
  }
})
