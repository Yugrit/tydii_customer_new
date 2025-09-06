// app/(tabs)/(home)/order/select-store.tsx
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

export default function SelectStoreScreen () {
  const dispatch = useDispatch()

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setCurrentStep(3)) // This will run every time screen is focused
    }, [dispatch])
  )
  const handleNext = () => {
    dispatch(nextStep())
    router.push('./confirmation')
  }

  const handleBack = () => {
    dispatch(prevStep())
    router.back()
  }

  const stores = [
    { id: 1, name: 'Downtown Cleaners', distance: '0.5 mi', rating: 4.8 },
    { id: 2, name: 'Quick Wash', distance: '1.2 mi', rating: 4.5 },
    { id: 3, name: 'Premium Laundry', distance: '2.1 mi', rating: 4.9 }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Store</Text>
        <Text style={styles.subtitle}>Step 3 of 4</Text>

        <ScrollView
          style={styles.dummyContent}
          showsVerticalScrollIndicator={false}
        >
          {stores.map(store => (
            <TouchableOpacity key={store.id} style={styles.storeItem}>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeDetails}>
                  {store.distance} • ⭐ {store.rating}
                </Text>
              </View>
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.selectedStore}>
            <Text style={styles.selectedTitle}>Selected Store</Text>
            <Text style={styles.selectedName}>Downtown Cleaners</Text>
            <Text style={styles.selectedDetails}>
              0.5 mi away • ⭐ 4.8 rating
            </Text>
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
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  storeInfo: {
    flex: 1
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  storeDetails: {
    fontSize: 14,
    color: '#666'
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  selectedStore: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6f3ff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8
  },
  selectedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  selectedDetails: {
    fontSize: 14,
    color: '#666'
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
