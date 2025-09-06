// app/(tabs)/(home)/order/pickup-details.tsx
import { nextStep, setCurrentStep } from '@/Redux/slices/orderSlice'
import { router, useFocusEffect } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

export default function PickupDetailsScreen () {
  const dispatch = useDispatch()

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setCurrentStep(1))
    }, [dispatch])
  )

  const handleNext = () => {
    dispatch(nextStep())
    router.push('./select-clothes')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickup Details</Text>
      <Text style={styles.subtitle}>Step 1 of 4</Text>

      <View style={styles.dummyContent}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.placeholder}>123 Main Street, City, State</Text>

        <Text style={styles.label}>Date & Time:</Text>
        <Text style={styles.placeholder}>Tomorrow, 10:00 AM - 12:00 PM</Text>

        <Text style={styles.label}>Instructions:</Text>
        <Text style={styles.placeholder}>Ring doorbell twice</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40 // Add bottom padding for better scrolling
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
    marginBottom: 30
  },
  dummyContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30
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
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#007AFF'
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  scrollItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  }
})
