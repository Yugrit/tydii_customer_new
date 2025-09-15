import { useThemeColors } from '@/hooks/useThemeColor'
import { useToast } from '@/hooks/useToast'
import { updateUserData } from '@/Redux/slices/userSlices'
import { updateUserAddresses } from '@/services/AddressService'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import { MapPin, Navigation, RefreshCw, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useDispatch, useSelector } from 'react-redux'

const { width, height } = Dimensions.get('window')

interface LocationCoords {
  latitude: number
  longitude: number
}

interface AddressDetails {
  formattedAddress?: string
  streetNumber?: string
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  district?: string
  subregion?: string
  region?: string
}

export default function AddAddressScreen () {
  const router = useRouter()
  const colors = useThemeColors()
  const dispatch = useDispatch()
  const toast = useToast()

  const user = useSelector((state: any) => state.user.userData)

  const [addressData, setAddressData] = useState({
    address: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    addressType: 'home',
    landmark: ''
  })

  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  })
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoords | null>(null)
  const [loading, setLoading] = useState(false)
  const [reverseGeocoding, setReverseGeocoding] = useState(false)
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(
    null
  )

  useEffect(() => {
    requestLocationPermission()
  }, [])

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is required to auto-fill your address.',
          [{ text: 'OK' }]
        )
        return
      }

      setTimeout(() => {
        setShowLocationModal(true)
      }, 500)
    } catch (error) {
      console.error('Error requesting location permission:', error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      setLoading(true)
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      })

      const coords: LocationCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      }

      setSelectedLocation(coords)
      setMapRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      })

      // Get address details but don't auto-fill form yet
      await enhancedReverseGeocode(coords)

      setShowLocationModal(false)
      setShowMapModal(true)
    } catch (error) {
      console.error('Error getting current location:', error)
      toast.error('Failed to get current location')
      setShowLocationModal(false)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced reverse geocoding function
  const enhancedReverseGeocode = async (coords: LocationCoords) => {
    try {
      setReverseGeocoding(true)
      console.log('🔄 Reverse geocoding coordinates:', coords)

      const reverseGeocodedLocation = await Location.reverseGeocodeAsync(coords)

      if (reverseGeocodedLocation && reverseGeocodedLocation.length > 0) {
        const address = reverseGeocodedLocation[0]
        console.log('📍 Reverse geocoded address:', address)

        // Extract comprehensive address details
        const details: AddressDetails = {
          formattedAddress: address.formattedAddress || '',
          streetNumber: address.streetNumber || '',
          street: address.street ?? undefined,
          city: address.city || address.district || address.subregion || '',
          state: address.region || '',
          country: address.country || '',
          postalCode: address.postalCode || '',
          district: address.district || '',
          subregion: address.subregion || '',
          region: address.region || ''
        }

        setAddressDetails(details)
        console.log('✅ Address details extracted:', details)
      }
    } catch (error) {
      console.error('❌ Error reverse geocoding:', error)
    } finally {
      setReverseGeocoding(false)
    }
  }

  // Forward geocoding - convert address text to coordinates
  const forwardGeocode = async (
    addressText: string
  ): Promise<LocationCoords | null> => {
    try {
      console.log('🔄 Forward geocoding address:', addressText)

      const geocodedLocation = await Location.geocodeAsync(addressText)

      if (geocodedLocation && geocodedLocation.length > 0) {
        const coords = {
          latitude: geocodedLocation[0].latitude,
          longitude: geocodedLocation[0].longitude
        }

        console.log('📍 Forward geocoded coordinates:', coords)
        return coords
      }

      console.warn('⚠️ No coordinates found for address:', addressText)
      return null
    } catch (error) {
      console.error('❌ Error forward geocoding:', error)
      return null
    }
  }

  // Fixed map press handler
  const handleMapPress = (event: any) => {
    const coords = event.nativeEvent.coordinate
    console.log('📍 Map pressed at coordinates:', coords)
    setSelectedLocation(coords)

    // Delay reverse geocoding to prevent modal flickering
    setTimeout(() => {
      enhancedReverseGeocode(coords)
    }, 100)
  }

  const handleRefreshAddress = () => {
    if (selectedLocation) {
      enhancedReverseGeocode(selectedLocation)
    }
  }

  const handleConfirmLocation = () => {
    if (selectedLocation && addressDetails) {
      setLocation(selectedLocation)

      // Auto-fill form with address data
      const streetAddress = [addressDetails.streetNumber, addressDetails.street]
        .filter(Boolean)
        .join(' ')

      const cityName =
        addressDetails.city ||
        addressDetails.district ||
        addressDetails.subregion ||
        addressDetails.region ||
        ''

      const stateName = addressDetails.region || addressDetails.district || ''

      setAddressData(prev => ({
        ...prev,
        address:
          streetAddress || addressDetails.formattedAddress?.split(',')[0] || '',
        city: cityName,
        state: stateName,
        zipCode: addressDetails.postalCode || '',
        landmark:
          addressDetails.district !== cityName
            ? addressDetails.district || ''
            : ''
      }))

      console.log('✅ Address auto-filled on confirm:', {
        streetAddress,
        city: cityName,
        state: stateName,
        zipCode: addressDetails.postalCode,
        landmark:
          addressDetails.district !== cityName ? addressDetails.district : ''
      })

      setShowMapModal(false)
      toast.success('Location confirmed and address auto-filled!')
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

  const handleSubmit = async () => {
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

    setLoading(true)
    try {
      console.log('🏠 Adding new address:', addressData)

      let finalCoordinates = location

      // If no location is selected from map, try to geocode the address
      if (!finalCoordinates) {
        console.log('📍 No map location selected, geocoding address...')

        const fullAddress = `${addressData.address}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}`
        finalCoordinates = await forwardGeocode(fullAddress)

        if (!finalCoordinates) {
          Alert.alert(
            'Location Required',
            'Could not find coordinates for this address. Please select your location on the map.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Select on Map', onPress: () => setShowMapModal(true) }
            ]
          )
          setLoading(false)
          return
        }
      } else {
        console.log('📍 Using selected map location:', finalCoordinates)
      }

      // Double-check coordinates by geocoding the entered address
      const fullAddress = `${addressData.address}, ${addressData.city}, ${addressData.state} ${addressData.zipCode}`
      const geocodedCoords = await forwardGeocode(fullAddress)

      if (geocodedCoords) {
        // Calculate distance between selected location and geocoded address
        const distance = calculateDistance(finalCoordinates, geocodedCoords)

        console.log(
          `📏 Distance between selected and geocoded location: ${distance.toFixed(
            2
          )}km`
        )

        // If distance is more than 10km, ask user to confirm
        if (distance > 10) {
          Alert.alert(
            'Location Mismatch',
            `The address you entered seems to be ${distance.toFixed(
              1
            )}km away from your selected location. Which location would you like to use?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Use Entered Address',
                onPress: () => continueSubmission(geocodedCoords)
              },
              {
                text: 'Use Selected Location',
                onPress: () => continueSubmission(finalCoordinates!)
              }
            ]
          )
          setLoading(false)
          return
        } else {
          // Use the geocoded coordinates for better accuracy
          console.log('📍 Using geocoded coordinates for better accuracy')
          finalCoordinates = geocodedCoords
        }
      }

      await continueSubmission(finalCoordinates)
    } catch (error) {
      console.error('❌ Failed to add address:', error)
      toast.error('Failed to add address. Please try again.')
      setLoading(false)
    }
  }

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (
    coord1: LocationCoords,
    coord2: LocationCoords
  ): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Continue with submission after coordinate validation
  const continueSubmission = async (coordinates: LocationCoords) => {
    try {
      console.log('📤 Submitting address with coordinates:', coordinates)

      const currentApiAddresses = user.addresses || []
      console.log('CURRR ADDR :::', currentApiAddresses)

      // Create newAddress object matching the API structure exactly
      const newAddress = {
        house_no: addressData.unit || '', // Unit/Apartment number
        street_address: addressData.address, // Main street address
        landmark: addressData.landmark || '',
        city: addressData.city,
        address_type:
          addressData.addressType.charAt(0).toUpperCase() +
          addressData.addressType.slice(1), // Capitalize
        state: addressData.state,
        zipcode: addressData.zipCode,
        latlong: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      }

      console.log('📦 New address object:', newAddress)

      const updatedAddresses = await updateUserAddresses(
        user.id,
        currentApiAddresses,
        { type: 'add', newAddress }
      )

      console.log('✅ Address added successfully')

      dispatch(
        updateUserData({
          ...user,
          addresses: updatedAddresses
        })
      )

      toast.success('Address added successfully!')
      router.back()
    } catch (error) {
      console.error('❌ Failed to submit address:', error)
      toast.error('Failed to add address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const LocationPermissionModal = () => (
    <Modal
      visible={showLocationModal}
      transparent
      animationType='fade'
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.locationModalContent}>
          <View style={styles.locationIconContainer}>
            <Navigation size={32} color={colors.primary} />
          </View>

          <Text style={styles.locationModalTitle}>Use Your Location</Text>
          <Text style={styles.locationModalText}>
            We can auto-fill all your address details using your current
            location. This makes it easier and more accurate.
          </Text>

          <View style={styles.locationModalButtons}>
            <TouchableOpacity
              style={styles.locationModalButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.locationModalButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.locationModalButton,
                styles.locationModalPrimaryButton
              ]}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Text
                style={[
                  styles.locationModalButtonText,
                  styles.locationModalPrimaryButtonText
                ]}
              >
                {loading ? 'Getting Location...' : 'Use Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  const MapModal = () => (
    <Modal
      visible={showMapModal}
      animationType='slide'
      onRequestClose={() => setShowMapModal(false)}
    >
      <View style={styles.mapModalContainer}>
        <View style={styles.mapModalHeader}>
          <Text style={styles.mapModalTitle}>Select Your Location</Text>
          <TouchableOpacity
            onPress={() => setShowMapModal(false)}
            style={styles.mapModalCloseButton}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Address Preview */}
        {addressDetails && (
          <View style={styles.addressPreview}>
            <View style={styles.addressPreviewHeader}>
              <Text style={styles.addressPreviewTitle}>Detected Address:</Text>
              <TouchableOpacity
                onPress={handleRefreshAddress}
                disabled={reverseGeocoding}
                style={styles.refreshButton}
              >
                <RefreshCw
                  size={16}
                  color={
                    reverseGeocoding ? colors.textSecondary : colors.primary
                  }
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.addressPreviewText}>
              {addressDetails.formattedAddress || 'Address detected'}
            </Text>
            {reverseGeocoding && (
              <Text style={styles.loadingText}>Getting address details...</Text>
            )}
          </View>
        )}

        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title='Selected Location'
              description={
                addressDetails?.formattedAddress || 'Selected address location'
              }
            >
              <View style={styles.customMarker}>
                <MapPin size={30} color={colors.primary} />
              </View>
            </Marker>
          )}
        </MapView>

        <View style={styles.mapModalFooter}>
          <Text style={styles.mapModalInstruction}>
            Tap on the map to select your exact location and auto-fill address
          </Text>

          <TouchableOpacity
            style={[
              styles.confirmLocationButton,
              !selectedLocation && styles.confirmLocationButtonDisabled
            ]}
            onPress={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            <Text style={styles.confirmLocationButtonText}>
              Confirm Location & Auto-fill
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

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

        {/* Location Status */}
        {location && (
          <View style={styles.locationStatus}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationStatusText}>
              Location selected & verified
            </Text>
            <TouchableOpacity onPress={() => setShowMapModal(true)}>
              <Text style={styles.changeLocationText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.formTitleContainer}>
            <Text style={styles.formTitle}>Address Details</Text>
            {location && (
              <TouchableOpacity
                onPress={handleRefreshAddress}
                disabled={reverseGeocoding}
                style={styles.refreshFormButton}
              >
                <RefreshCw
                  size={16}
                  color={
                    reverseGeocoding ? colors.textSecondary : colors.primary
                  }
                />
                <Text style={styles.refreshFormText}>
                  {reverseGeocoding ? 'Updating...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Address Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Type</Text>
            <View style={styles.addressTypeContainer}>
              {['home', 'office', 'other'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.addressTypeButton,
                    addressData.addressType === type &&
                      styles.addressTypeButtonSelected
                  ]}
                  onPress={() => handleInputChange('addressType', type)}
                >
                  <Text
                    style={[
                      styles.addressTypeButtonText,
                      addressData.addressType === type &&
                        styles.addressTypeButtonTextSelected
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Street Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.address}
              onChangeText={text => handleInputChange('address', text)}
              placeholder='Enter street address'
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Unit/Apartment */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit/Apartment (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.unit}
              onChangeText={text => handleInputChange('unit', text)}
              placeholder='Apt, suite, unit, building, floor, etc.'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Landmark */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Landmark (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.landmark}
              onChangeText={text => handleInputChange('landmark', text)}
              placeholder='Near landmark, building, etc.'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* City/Town */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City/Town *</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.city}
              onChangeText={text => handleInputChange('city', text)}
              placeholder='Enter city/town'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* State */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.state}
              onChangeText={text => handleInputChange('state', text)}
              placeholder='Enter state'
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Zip Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip Code *</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.zipCode}
              onChangeText={text => handleInputChange('zipCode', text)}
              placeholder='Enter zip code'
              placeholderTextColor={colors.textSecondary}
              keyboardType='numeric'
            />
          </View>

          {/* Location Button */}
          {!location && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowMapModal(true)}
            >
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.locationButtonText}>
                Select Location & Auto-fill Address
              </Text>
            </TouchableOpacity>
          )}

          {/* Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              💡 Note: We'll verify the coordinates of your address before
              saving to ensure accuracy.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.cancelButton, loading && styles.disabledButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text
            style={[styles.cancelButtonText, loading && styles.disabledText]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text
            style={[styles.submitButtonText, loading && styles.disabledText]}
          >
            {loading ? 'Verifying & Adding...' : 'Add Address'}
          </Text>
        </TouchableOpacity>
      </View>

      <LocationPermissionModal />
      <MapModal />
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
      paddingBottom: 100
    },
    header: {
      marginBottom: 20
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
    locationStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.light,
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
      gap: 8
    },
    locationStatusText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500'
    },
    changeLocationText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600'
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
    formTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text
    },
    refreshFormButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 8,
      borderRadius: 6,
      backgroundColor: colors.light
    },
    refreshFormText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500'
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
      textAlignVertical: 'top'
    },
    addressTypeContainer: {
      flexDirection: 'row',
      gap: 8
    },
    addressTypeButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center'
    },
    addressTypeButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary
    },
    addressTypeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text
    },
    addressTypeButtonTextSelected: {
      color: colors.background
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      gap: 8,
      marginBottom: 16
    },
    locationButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary
    },
    noteContainer: {
      backgroundColor: colors.light,
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary
    },
    noteText: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16
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
    },
    disabledButton: {
      opacity: 0.6
    },
    disabledText: {
      color: colors.textSecondary
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
    },
    locationModalContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 350,
      alignItems: 'center'
    },
    locationIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.light,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16
    },
    locationModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center'
    },
    locationModalText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24
    },
    locationModalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%'
    },
    locationModalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center'
    },
    locationModalPrimaryButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary
    },
    locationModalButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text
    },
    locationModalPrimaryButtonText: {
      color: colors.background
    },

    // Map Modal
    mapModalContainer: {
      flex: 1,
      backgroundColor: colors.background
    },
    mapModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    mapModalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text
    },
    mapModalCloseButton: {
      padding: 4
    },
    addressPreview: {
      backgroundColor: colors.light,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    addressPreviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    },
    addressPreviewTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'uppercase'
    },
    refreshButton: {
      padding: 4
    },
    addressPreviewText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 18
    },
    loadingText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4
    },
    map: {
      flex: 1
    },
    customMarker: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    mapModalFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background
    },
    mapModalInstruction: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16
    },
    confirmLocationButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center'
    },
    confirmLocationButtonDisabled: {
      backgroundColor: colors.border
    },
    confirmLocationButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background
    }
  })
