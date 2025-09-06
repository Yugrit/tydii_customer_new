// app/(tabs)/(home)/order/confirmation.tsx
import { completeOrder, setCurrentStep } from '@/Redux/slices/orderSlice'
import { RootState } from '@/Redux/Store'
import { router, useFocusEffect } from 'expo-router'
import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

export default function ConfirmationScreen () {
  const dispatch = useDispatch()
  const { serviceType } = useSelector((state: RootState) => state.order)

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setCurrentStep(4)) // This will run every time screen is focused
    }, [dispatch])
  )

  const handleConfirm = () => {
    dispatch(completeOrder())
    // Navigate back to home and show success
    router.replace('../../') // Go back to home tab root
  }

  const handleBack = () => {
    router.back()
  }

  const handleEditOrder = () => {
    router.push('../pickup-details') // Go back to first step
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Order Confirmation</Text>
        <Text style={styles.subtitle}>Step 4 of 4 • Review your order</Text>

        <ScrollView
          style={styles.dummyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service</Text>
            <Text style={styles.sectionValue}>{serviceType}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Details</Text>
            <Text style={styles.sectionValue}>
              123 Main Street, City, State
            </Text>
            <Text style={styles.sectionSubValue}>
              Tomorrow, 10:00 AM - 12:00 PM
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            <Text style={styles.sectionValue}>19 items selected</Text>
            <Text style={styles.sectionSubValue}>
              T-Shirts, Jeans, Dress Shirts, Sweaters, Socks
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store</Text>
            <Text style={styles.sectionValue}>Downtown Cleaners</Text>
            <Text style={styles.sectionSubValue}>
              0.5 mi away • ⭐ 4.8 rating
            </Text>
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>$45.00</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery:</Text>
              <Text style={styles.totalValue}>$5.00</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>$50.00</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditOrder}>
            <Text style={styles.editButtonText}>Edit Order</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  content: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  dummyContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20
  },
  section: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  sectionSubValue: {
    fontSize: 14,
    color: '#666'
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  totalLabel: {
    fontSize: 16,
    color: '#666'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  editButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e0e0e0'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  confirmButton: {
    flex: 2,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#28a745'
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
})
