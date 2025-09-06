// app/(tabs)/(home)/order/select-clothes.tsx
import { nextStep, prevStep, setCurrentStep } from '@/Redux/slices/orderSlice'
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
import { useDispatch } from 'react-redux'

export default function SelectClothesScreen () {
  const dispatch = useDispatch()

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setCurrentStep(2)) // This will run every time screen is focused
    }, [dispatch])
  )

  const handleNext = () => {
    dispatch(nextStep())
    router.push('./select-store')
  }

  const handleBack = () => {
    dispatch(prevStep())
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Clothes</Text>
        <Text style={styles.subtitle}>Step 2 of 4</Text>

        <ScrollView
          style={styles.dummyContent}
          showsVerticalScrollIndicator={false}
        >
          {[
            'T-Shirts (5)',
            'Jeans (2)',
            'Dress Shirts (3)',
            'Sweaters (1)',
            'Socks (8)'
          ].map((item, index) => (
            <View key={index} style={styles.clothingItem}>
              <Text style={styles.itemName}>{item}</Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Selected Items</Text>
            <Text style={styles.summaryText}>19 items selected</Text>
            <Text style={styles.summaryPrice}>Estimated Price: $45.00</Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
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
  clothingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemName: {
    fontSize: 16,
    color: '#333'
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
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
  }
})
