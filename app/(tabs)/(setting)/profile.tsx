import { Edit3 } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

export default function ProfileInformationScreen () {
  const dispatch = useDispatch()

  // Get user data from Redux store
  const user = useSelector((state: any) => state.user.userData)
  console.log(user)

  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    zipCode: '',
    gender: 'Male'
  })

  const [isEditMode, setIsEditMode] = useState(false)

  // Initialize form data from Redux user data
  useEffect(() => {
    if (user) {
      // Get primary address zipcode
      const primaryAddress = user.addresses?.find(
        (addr: any) => addr.is_primary
      )

      setProfileData({
        fullName: user.name || '',
        phone: user.phone_number || '',
        email: user.email || '',
        zipCode: primaryAddress?.zipcode || '',
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() +
            user.gender.slice(1).toLowerCase()
          : 'Male'
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    if (!isEditMode) return // Prevent changes when not in edit mode

    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      const primaryAddress = user.addresses?.find(
        (addr: any) => addr.is_primary
      )

      setProfileData({
        fullName: user.name || '',
        phone: user.phone_number || '',
        email: user.email || '',
        zipCode: primaryAddress?.zipcode || '',
        gender: user.gender
          ? user.gender.charAt(0).toUpperCase() +
            user.gender.slice(1).toLowerCase()
          : 'Male'
      })
    }
    setIsEditMode(false)
    console.log('Cancel pressed')
  }

  const handleUpdate = () => {
    // Dispatch action to update user profile in Redux
    dispatch({
      type: 'user/updateProfile',
      payload: profileData
    })

    setIsEditMode(false)
    console.log('Update profile:', profileData)
    Alert.alert('Success', 'Profile updated successfully!')
  }

  // Get profile image URL from user data or use default
  const getProfileImage = () => {
    if (user?.profile_img_url) {
      return { uri: user.profile_img_url }
    }
    return {
      uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>
                Profile <Text style={styles.titleAccent}>Information</Text>
              </Text>
              <View style={styles.underline} />
            </View>

            {/* Edit Button */}
            {!isEditMode && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit3 size={20} color='#02537F' />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Image Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={getProfileImage()} style={styles.profileImage} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'user@email.com'}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[
                styles.textInput,
                !isEditMode && styles.textInputDisabled
              ]}
              value={profileData.fullName}
              onChangeText={text => handleInputChange('fullName', text)}
              placeholder='Enter full name'
              editable={isEditMode}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone No.</Text>
            <View style={styles.phoneInputContainer}>
              <View
                style={[
                  styles.countryCodeContainer,
                  !isEditMode && styles.textInputDisabled
                ]}
              >
                <Text
                  style={[
                    styles.countryCodeText,
                    !isEditMode && styles.textDisabled
                  ]}
                >
                  US
                </Text>
              </View>
              <TextInput
                style={[
                  styles.phoneInput,
                  !isEditMode && styles.textInputDisabled
                ]}
                value={profileData.phone}
                onChangeText={text => handleInputChange('phone', text)}
                placeholder='Phone number'
                keyboardType='phone-pad'
                editable={isEditMode}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.textInput,
                !isEditMode && styles.textInputDisabled
              ]}
              value={profileData.email}
              onChangeText={text => handleInputChange('email', text)}
              placeholder='Enter email'
              keyboardType='email-address'
              autoCapitalize='none'
              editable={isEditMode}
            />
          </View>

          {/* Zip Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip code</Text>
            <TextInput
              style={[
                styles.textInput,
                !isEditMode && styles.textInputDisabled
              ]}
              value={profileData.zipCode}
              onChangeText={text => handleInputChange('zipCode', text)}
              placeholder='Enter zip code'
              keyboardType='numeric'
              editable={isEditMode}
            />
          </View>

          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  profileData.gender === 'Male' && styles.genderOptionSelected,
                  !isEditMode && styles.genderOptionDisabled
                ]}
                onPress={() =>
                  isEditMode && handleInputChange('gender', 'Male')
                }
                disabled={!isEditMode}
              >
                <View
                  style={[
                    styles.radioButton,
                    profileData.gender === 'Male' && styles.radioButtonSelected,
                    !isEditMode && styles.radioButtonDisabled
                  ]}
                >
                  {profileData.gender === 'Male' && (
                    <View
                      style={[
                        styles.radioButtonInner,
                        !isEditMode && styles.radioButtonInnerDisabled
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.genderText,
                    profileData.gender === 'Male' && styles.genderTextSelected,
                    !isEditMode && styles.textDisabled
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  profileData.gender === 'Female' &&
                    styles.genderOptionSelected,
                  !isEditMode && styles.genderOptionDisabled
                ]}
                onPress={() =>
                  isEditMode && handleInputChange('gender', 'Female')
                }
                disabled={!isEditMode}
              >
                <View
                  style={[
                    styles.radioButton,
                    profileData.gender === 'Female' &&
                      styles.radioButtonSelected,
                    !isEditMode && styles.radioButtonDisabled
                  ]}
                >
                  {profileData.gender === 'Female' && (
                    <View
                      style={[
                        styles.radioButtonInner,
                        !isEditMode && styles.radioButtonInnerDisabled
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.genderText,
                    profileData.gender === 'Female' &&
                      styles.genderTextSelected,
                    !isEditMode && styles.textDisabled
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  profileData.gender === 'Other' && styles.genderOptionSelected,
                  !isEditMode && styles.genderOptionDisabled
                ]}
                onPress={() =>
                  isEditMode && handleInputChange('gender', 'Other')
                }
                disabled={!isEditMode}
              >
                <View
                  style={[
                    styles.radioButton,
                    profileData.gender === 'Other' &&
                      styles.radioButtonSelected,
                    !isEditMode && styles.radioButtonDisabled
                  ]}
                >
                  {profileData.gender === 'Other' && (
                    <View
                      style={[
                        styles.radioButtonInner,
                        !isEditMode && styles.radioButtonInnerDisabled
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.genderText,
                    profileData.gender === 'Other' && styles.genderTextSelected,
                    !isEditMode && styles.textDisabled
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons - Only show when in edit mode */}
        {isEditMode && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  header: {
    marginBottom: 30
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333'
  },
  titleAccent: {
    color: '#02537F'
  },
  underline: {
    width: 120,
    height: 3,
    backgroundColor: '#02537F',
    marginTop: 8
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5f3f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#02537F'
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  profileImageContainer: {
    marginRight: 16
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0'
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666'
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#f8f9fa'
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e8e8e8',
    color: '#888888'
  },
  textDisabled: {
    color: '#888888'
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 8
  },
  countryCodeContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500'
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#f8f9fa'
  },
  genderSection: {
    marginTop: 10
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 20
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  genderOptionSelected: {
    // Add any selected state styling if needed
  },
  genderOptionDisabled: {
    opacity: 0.6
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#02537F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  radioButtonSelected: {
    borderColor: '#02537F'
  },
  radioButtonDisabled: {
    borderColor: '#cccccc'
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#02537F'
  },
  radioButtonInnerDisabled: {
    backgroundColor: '#cccccc'
  },
  genderText: {
    fontSize: 16,
    color: '#666666'
  },
  genderTextSelected: {
    color: '#333333',
    fontWeight: '500'
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#e5f3f8',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#02537F'
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#02537F',
    alignItems: 'center'
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  }
})
