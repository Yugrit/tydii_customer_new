// components/order/AddOnsSelector.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import ApiService from '@/services/ApiService'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

interface AddOn {
  id: number
  itemName: string
  itemDescription: string
  pricePerQuantity: number
  category: string
  itemImage?: string
  itemQuantity: number
  skuCode: string
  applicableCategory: string[]
}

interface SelectedAddOn {
  addOn: AddOn
  quantity: number
}

interface AddOnsSelectorProps {
  storeId: number
  serviceType: string
  selectedAddOns: SelectedAddOn[]
  onAddOnsChange: (addOns: SelectedAddOn[]) => void
  disabled?: boolean
}

const AddOnItem = ({
  addOn,
  quantity,
  onIncrement,
  onDecrement,
  colors,
  disabled = false
}: {
  addOn: AddOn
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  colors: any
  disabled?: boolean
}) => {
  const getAddOnIcon = (category: string) => {
    const categoryLower = category.toLowerCase()
    if (categoryLower.includes('retail')) return '🛒'
    if (categoryLower.includes('operational')) return '🔧'
    if (categoryLower.includes('packaging')) return '📦'
    if (categoryLower.includes('cleaning')) return '🧽'
    if (categoryLower.includes('detergent')) return '🧴'
    if (
      categoryLower.includes('freshner') ||
      categoryLower.includes('freshener')
    )
      return '🌸'
    if (categoryLower.includes('dryer')) return '🌀'
    return '➕'
  }

  const styles = createAddOnItemStyles(colors)

  // Check if we can add more
  const canAddMore = quantity < addOn.itemQuantity
  const isOutOfStock = addOn.itemQuantity === 0

  return (
    <View style={[styles.addOnCard, disabled && styles.disabledCard]}>
      <View style={styles.addOnHeader}>
        {addOn.itemImage ? (
          <Image
            source={{ uri: addOn.itemImage }}
            style={styles.addOnImage}
            defaultSource={{
              uri: 'https://via.placeholder.com/32x32/cccccc/ffffff?text=?'
            }}
          />
        ) : (
          <View style={styles.addOnIcon}>
            <Text style={styles.addOnIconText}>
              {getAddOnIcon(addOn.category)}
            </Text>
          </View>
        )}
        <Text style={styles.addOnPrice}>
          ${addOn.pricePerQuantity.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.addOnName} numberOfLines={2}>
        {addOn.itemName}
      </Text>

      <Text style={styles.addOnDescription} numberOfLines={3}>
        {addOn.itemDescription}
      </Text>

      <Text style={styles.addOnCategory}>{addOn.category}</Text>

      {/* Stock status */}
      <View style={styles.stockContainer}>
        <Text style={styles.stockText}>Stock: {addOn.itemQuantity}</Text>
        {addOn.itemQuantity <= 5 && addOn.itemQuantity > 0 && (
          <Text style={styles.stockWarning}>Low Stock!</Text>
        )}
        {isOutOfStock && <Text style={styles.outOfStock}>Out of Stock</Text>}
      </View>

      <View style={styles.quantityContainer}>
        {quantity > 0 ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, disabled && styles.disabledButton]}
              onPress={onDecrement}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  disabled && styles.disabledButtonText
                ]}
              >
                -
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.quantityText, disabled && styles.disabledText]}
            >
              {quantity}
            </Text>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                (disabled || !canAddMore) && styles.disabledButton
              ]}
              onPress={onIncrement}
              disabled={disabled || !canAddMore}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  (disabled || !canAddMore) && styles.disabledButtonText
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addButton,
              (disabled || isOutOfStock) && styles.disabledButton
            ]}
            onPress={onIncrement}
            disabled={disabled || isOutOfStock}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.addButtonText,
                (disabled || isOutOfStock) && styles.disabledButtonText
              ]}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add'}
            </Text>
          </TouchableOpacity>
        )}

        {quantity > 0 && canAddMore && (
          <Text style={styles.canAddMore}>
            Can add {addOn.itemQuantity - quantity} more
          </Text>
        )}
      </View>
    </View>
  )
}

export default function AddOnsSelector ({
  storeId,
  serviceType,
  selectedAddOns,
  onAddOnsChange,
  disabled = false
}: AddOnsSelectorProps) {
  const colors = useThemeColors()
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch available add-ons from API
  const fetchAvailableAddOns = async () => {
    if (!storeId || !serviceType) {
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Fetching available add-ons...', { storeId, serviceType })

      const response = await ApiService.get({
        url: `/customer/store/inventory/${storeId}?serviceType=${serviceType}&limit=50&page=1`
      })

      console.log('🎯 Add-ons response:', response)

      // Filter items that are applicable for the current service type AND have quantity > 0
      const inventory = response.inventory || []
      const filteredAddOns = inventory.filter(
        (item: AddOn) =>
          item.applicableCategory.includes(serviceType) && item.itemQuantity > 0 // Only include items with stock
      )

      console.log(
        '✅ Filtered add-ons:',
        filteredAddOns.length,
        'items with stock'
      )
      setAvailableAddOns(filteredAddOns)
    } catch (error) {
      console.error('❌ Failed to fetch add-ons:', error)
      setAvailableAddOns([])
    } finally {
      setLoading(false)
    }
  }

  // Handle add-on increment with stock validation
  const handleAddOnIncrement = (addOn: AddOn) => {
    const existing = selectedAddOns.find(sa => sa.addOn.id === addOn.id)

    if (existing) {
      // Check if we can add more (current quantity < available stock)
      if (existing.quantity < addOn.itemQuantity) {
        const updated = selectedAddOns.map(sa =>
          sa.addOn.id === addOn.id ? { ...sa, quantity: sa.quantity + 1 } : sa
        )
        onAddOnsChange(updated)
        console.log(
          `✅ Incremented ${addOn.itemName} to ${existing.quantity + 1}`
        )
      } else {
        console.warn(
          `⚠️ Cannot add more ${addOn.itemName}. Max quantity ${addOn.itemQuantity} reached.`
        )
      }
    } else {
      // Adding for the first time
      if (addOn.itemQuantity > 0) {
        onAddOnsChange([...selectedAddOns, { addOn, quantity: 1 }])
        console.log(`✅ Added ${addOn.itemName} with quantity 1`)
      } else {
        console.warn(`⚠️ Cannot add ${addOn.itemName}. Out of stock.`)
      }
    }
  }

  // Handle add-on decrement
  const handleAddOnDecrement = (addOnId: number) => {
    const updated = selectedAddOns
      .map(sa =>
        sa.addOn.id === addOnId ? { ...sa, quantity: sa.quantity - 1 } : sa
      )
      .filter(sa => sa.quantity > 0) // Remove items with 0 quantity
    onAddOnsChange(updated)

    const addOnName = selectedAddOns.find(sa => sa.addOn.id === addOnId)?.addOn
      .itemName
    console.log(`✅ Decremented ${addOnName}`)
  }

  // Get quantity for a specific add-on
  const getAddOnQuantity = (addOnId: number) => {
    const selected = selectedAddOns.find(sa => sa.addOn.id === addOnId)
    return selected?.quantity || 0
  }

  // Calculate total add-ons amount
  const addOnsTotal = selectedAddOns.reduce((total, { addOn, quantity }) => {
    return total + addOn.pricePerQuantity * quantity
  }, 0)

  // Remove selected add-ons that are no longer available or out of stock
  useEffect(() => {
    if (availableAddOns.length > 0 && selectedAddOns.length > 0) {
      const validSelectedAddOns = selectedAddOns.filter(selectedAddOn => {
        const availableAddOn = availableAddOns.find(
          available => available.id === selectedAddOn.addOn.id
        )

        // Keep only if the add-on is still available and has stock
        if (!availableAddOn || availableAddOn.itemQuantity === 0) {
          console.log(
            `🗑️ Removing ${selectedAddOn.addOn.itemName} - no longer available or out of stock`
          )
          return false
        }

        // If selected quantity exceeds available stock, adjust it
        if (selectedAddOn.quantity > availableAddOn.itemQuantity) {
          console.log(
            `⚠️ Adjusting ${selectedAddOn.addOn.itemName} quantity from ${selectedAddOn.quantity} to ${availableAddOn.itemQuantity}`
          )
          selectedAddOn.quantity = availableAddOn.itemQuantity
          selectedAddOn.addOn = availableAddOn // Update with latest data
        }

        return true
      })

      // Update selected add-ons if any were removed or adjusted
      if (
        validSelectedAddOns.length !== selectedAddOns.length ||
        validSelectedAddOns.some(
          (valid, index) =>
            selectedAddOns[index] &&
            valid.quantity !== selectedAddOns[index].quantity
        )
      ) {
        onAddOnsChange(validSelectedAddOns)
      }
    }
  }, [availableAddOns])

  useEffect(() => {
    fetchAvailableAddOns()
  }, [storeId, serviceType])

  const styles = createMainStyles(colors)

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Ons</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading add-ons...</Text>
        </View>
      </View>
    )
  }

  if (availableAddOns.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Ons</Text>
        <View style={styles.noAddOnsContainer}>
          <Text style={styles.noAddOnsText}>
            No add-ons available for this service
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Add Ons</Text>
        {addOnsTotal > 0 && (
          <Text style={styles.sectionSubtitle}>
            Total: ${addOnsTotal.toFixed(2)}
          </Text>
        )}
      </View>

      <FlatList
        data={availableAddOns}
        renderItem={({ item }) => (
          <AddOnItem
            addOn={item}
            quantity={getAddOnQuantity(item.id)}
            onIncrement={() => handleAddOnIncrement(item)}
            onDecrement={() => handleAddOnDecrement(item.id)}
            colors={colors}
            disabled={disabled}
          />
        )}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.addOnsListContainer}
        style={styles.addOnsList}
      />

      {/* Selected Add Ons Summary */}
      {selectedAddOns.length > 0 && (
        <View style={styles.selectedAddOnsContainer}>
          <Text style={styles.selectedAddOnsTitle}>Selected Add Ons:</Text>
          {selectedAddOns.map(({ addOn, quantity }) => (
            <View key={addOn.id} style={styles.selectedAddOnRow}>
              <Text style={styles.selectedAddOnName}>
                {addOn.itemName} x{quantity}
              </Text>
              <Text style={styles.selectedAddOnPrice}>
                ${(addOn.pricePerQuantity * quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// Main styles (same as before)
const createMainStyles = (colors: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 24,
      paddingHorizontal: 4
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 1
    },
    sectionSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary
    },
    addOnsList: {
      marginVertical: 5
    },
    addOnsListContainer: {
      paddingVertical: 8
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginVertical: 8
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    noAddOnsContainer: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginVertical: 8
    },
    noAddOnsText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    selectedAddOnsContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.light,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    selectedAddOnsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8
    },
    selectedAddOnRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4
    },
    selectedAddOnName: {
      fontSize: 14,
      color: colors.text,
      flex: 1
    },
    selectedAddOnPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text
    }
  })

// Updated AddOn Item styles
const createAddOnItemStyles = (colors: any) =>
  StyleSheet.create({
    addOnCard: {
      width: 180,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    disabledCard: {
      opacity: 0.6,
      backgroundColor: colors.surface
    },
    addOnHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    },
    addOnIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.light,
      alignItems: 'center',
      justifyContent: 'center'
    },
    addOnImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.light
    },
    addOnIconText: {
      fontSize: 16
    },
    addOnPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary
    },
    addOnName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      minHeight: 36
    },
    addOnDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
      marginBottom: 8,
      minHeight: 32
    },
    addOnCategory: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '500',
      marginBottom: 8,
      backgroundColor: colors.light,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      textAlign: 'center'
    },
    stockContainer: {
      marginBottom: 12,
      alignItems: 'center'
    },
    stockText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '600'
    },
    stockWarning: {
      fontSize: 10,
      color: '#FFA500',
      marginTop: 2,
      textAlign: 'center',
      fontWeight: '600'
    },
    outOfStock: {
      fontSize: 10,
      color: colors.notification,
      marginTop: 2,
      textAlign: 'center',
      fontWeight: '600'
    },
    quantityContainer: {
      alignItems: 'center'
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.light,
      borderRadius: 8,
      paddingHorizontal: 4
    },
    quantityButton: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    quantityButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.background
    },
    quantityText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginHorizontal: 16,
      minWidth: 24,
      textAlign: 'center'
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center'
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.background
    },
    disabledButton: {
      backgroundColor: colors.border
    },
    disabledButtonText: {
      color: colors.textSecondary
    },
    disabledText: {
      color: colors.textSecondary
    },
    canAddMore: {
      fontSize: 10,
      color: colors.primary,
      marginTop: 4,
      textAlign: 'center'
    }
  })

// Export types for use in other components
export type { AddOn, SelectedAddOn }
