import { useThemeColors } from '@/hooks/useThemeColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSelector } from 'react-redux'

export default function EditAddressScreen () {
  const router = useRouter()
  const colors = useThemeColors()
  const { id } = useLocalSearchParams() // Gets the ?id=123 query parameter

  // Get user addresses from Redux
  const user = useSelector((state: any) => state.user.userData)

  const [addressData, setAddressData] = useState({
    address: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    addressType: '',
    landmark: '',
    isPrimary: false
  })

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Load address data on mount
  useEffect(() => {
    loadAddressData()
  }, [id])

  const loadAddressData = () => {
    try {
      console.log('Address ID from query:', id) // Debug log

      if (!id || !user?.addresses) {
        Alert.alert('Error', 'Address not found')
        router.back()
        return
      }

      // Find the address by ID
      const address = user.addresses.find(
        (addr: any) => addr.id.toString() === id.toString()
      )

      if (!address) {
        Alert.alert('Error', 'Address not found')
        router.back()
        return
      }

      console.log('Found address:', address) // Debug log

      // Populate form with existing data
      setAddressData({
        address: `${address.house_no || ''}${
          address.street_address ? ', ' + address.street_address : ''
        }`,
        unit: address.house_no || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipcode || '',
        addressType: address.address_type || '',
        landmark: address.landmark || '',
        isPrimary: address.is_primary || false
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading address:', error)
      Alert.alert('Error', 'Failed to load address data')
      router.back()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCancel = () => {
    router.back()
  }

  const handleUpdate = async () => {
    // Validate required fields
    if (!addressData.address.trim()) {
      Alert.alert('Error', 'Please enter an address')
      return
    }
    if (!addressData.city.trim()) {
      Alert.alert('Error', 'Please enter a city/town')
      return
    }
    if (!addressData.state.trim()) {
      Alert.alert('Error', 'Please enter a state')
      return
    }
    if (!addressData.zipCode.trim()) {
      Alert.alert('Error', 'Please enter a zip code')
      return
    }

    try {
      setUpdating(true)

      // Prepare update payload
      const updatePayload = {
        id: id,
        house_no: addressData.unit || addressData.address.split(',')[0],
        street_address: addressData.address.includes(',')
          ? addressData.address.split(',').slice(1).join(',').trim()
          : '',
        city: addressData.city,
        state: addressData.state,
        zipcode: addressData.zipCode,
        landmark: addressData.landmark,
        address_type: addressData.addressType || 'Other',
        is_primary: addressData.isPrimary
      }

      // TODO: Call API to update address
      console.log('Update address:', updatePayload)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // TODO: Dispatch Redux action to update address
      // dispatch(updateAddress(updatePayload))

      Alert.alert('Success', 'Address updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ])
    } catch (error) {
      console.error('Error updating address:', error)
      Alert.alert('Error', 'Failed to update address. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const styles = createStyles(colors)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={styles.loadingText}>Loading address...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Edit <Text style={styles.titleAccent}>Address</Text>
          </Text>
          <View style={styles.underline} />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Billing address</Text>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={addressData.address}
              onChangeText={text => handleInputChange('address', text)}
              placeholder='Address'
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Unit Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.unit}
              onChangeText={text => handleInputChange('unit', text)}
              placeholder='Enter Unit'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* City/Town Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City/Town</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.city}
              onChangeText={text => handleInputChange('city', text)}
              placeholder='Enter City/Town'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* State Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.state}
              onChangeText={text => handleInputChange('state', text)}
              placeholder='Enter State'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Zip Code Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip code</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.zipCode}
              onChangeText={text => handleInputChange('zipCode', text)}
              placeholder='000000'
              placeholderTextColor={colors.textSecondary}
              keyboardType='numeric'
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={updating}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.updateButton, updating && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size='small' color={colors.background} />
          ) : (
            <Text style={styles.updateButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      paddingBottom: 100 // Space for buttons
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.textSecondary
    },
    header: {
      marginBottom: 30
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text
    },
    titleAccent: {
      color: colors.primary
    },
    underline: {
      width: 80,
      height: 3,
      backgroundColor: colors.primary,
      marginTop: 8
    },
    formContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 24
    },
    inputGroup: {
      marginBottom: 20
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface
    },
    multilineInput: {
      textAlignVertical: 'top',
      height: 80
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.light,
      alignItems: 'center'
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary
    },
    updateButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center'
    },
    updateButtonDisabled: {
      backgroundColor: colors.textSecondary
    },
    updateButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background
    }
  })
