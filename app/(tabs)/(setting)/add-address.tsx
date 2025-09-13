import { useThemeColors } from '@/hooks/useThemeColor'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
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

export default function AddAddressScreen () {
  const router = useRouter()
  const colors = useThemeColors()

  const [addressData, setAddressData] = useState({
    address: '',
    unit: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCancel = () => {
    router.back()
  }

  const handleSubmit = () => {
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

    // TODO: Submit address to API
    console.log('Submit address:', addressData)

    // Navigate back or show success
    Alert.alert('Success', 'Address added successfully!', [
      {
        text: 'OK',
        onPress: () => router.back()
      }
    ])
  }

  const styles = createStyles(colors)

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
            Add <Text style={styles.titleAccent}>Address</Text>
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
              style={styles.textInput}
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
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
      backgroundColor: colors.surface,
      textAlignVertical: 'top' // For multiline input
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
    submitButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center'
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background
    }
  })
