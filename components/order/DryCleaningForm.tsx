// components/order/forms/DrycleaningForm.tsx
import ApiService from '@/services/ApiService'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
  const [clothNames, setClothNames] = useState<string[]>([])
  const [clothCategories, setClothCategories] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch both dropdown APIs in parallel
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Fetching cloth names and categories...')

        // Fetch both APIs in parallel
        const [clothNameResponse, clothCategoryResponse] = await Promise.all([
          ApiService.get({ url: '/customer/core/dropdown/cloth_name' }),
          ApiService.get({ url: '/customer/core/dropdown/cloth_category' })
        ])

        console.log('📊 API responses received:', {
          clothName: clothNameResponse,
          clothCategory: clothCategoryResponse
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

        setClothNames(names)
        setClothCategories(categories)

        console.log('✅ Dropdown data loaded:', {
          clothNames: names,
          clothCategories: categories
        })
      } catch (apiError) {
        console.error('❌ Failed to fetch dropdown data:', apiError)
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
      } finally {
        setLoading(false)
      }
    }

    fetchDropdownData()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one cloth name has quantity > 0
    const hasItems = clothNames.some(
      clothName => formData[clothName] && formData[clothName].quantity > 0
    )

    if (!hasItems) {
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
        <Text style={styles.loadingText}>Loading form options...</Text>
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
