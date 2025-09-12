// components/order/forms/PickupDetailsForm.tsx
import { updatePickupDetails } from '@/Redux/slices/orderSlice'
import { generateTimeSlots, isFutureDate } from '@/services/ValidationService'
import React, { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import CustomInput from './CustomInput'
import OrderNavigationButtons from './OrderNavigationButtons'

// NEW: Address interface
interface Address {
  address_line: string
  city: string
  state: string
  pincode: string
  landmark: string
  lat: string
  long: string
}

interface PickupDetailsFormProps {
  onNext: () => void
  onPrev: () => void
}

export default function PickupDetailsForm ({
  onNext,
  onPrev
}: PickupDetailsFormProps) {
  const dispatch = useDispatch()

  // Get user addresses from Redux
  const { userData } = useSelector((state: any) => state.user)

  // UPDATED: State now uses Address objects
  const [formData, setFormData] = useState({
    selectedPickupAddress: null as Address | null,
    selectedDeliveryAddress: null as Address | null,
    pickupLocationLabel: '', // For display purposes
    deliveryLocationLabel: '', // For display purposes
    collectionDate: '',
    collectionTime: '',
    deliveryDate: '',
    deliveryTime: '',
    partnerNote: '',
    repeatOption: 'no-repeat'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Generate location data from user addresses
  const locationData = useMemo(() => {
    const locations: any = []

    if (userData?.addresses && Array.isArray(userData.addresses)) {
      userData.addresses
        .filter((addr: any) => !addr.is_deleted) // Only show non-deleted addresses
        .forEach((address: any) => {
          // Format address for display
          const addressLine = `${address.house_no}${
            address.street_address ? ', ' + address.street_address : ''
          }`
          const cityState = `${address.city}, ${address.state} ${address.zipcode}`
          const displayAddress = `${address.address_type} - ${addressLine}, ${cityState}`

          // Convert user address to our Address interface format
          const addressObject: Address = {
            address_line: `${address.house_no}${
              address.street_address ? ', ' + address.street_address : ''
            }`,
            city: address.city,
            state: address.state,
            pincode: address.zipcode,
            landmark: address.landmark || '',
            lat: address.latlongs.latitude,
            long: address.latlongs.longitude
          }

          locations.push({
            id: address.id,
            label: displayAddress,
            value: displayAddress,
            isPrimary: address.is_primary,
            addressObject: addressObject // NEW: Store the full address object
          })
        })
    }

    // Sort to show primary address first
    locations.sort((a: any, b: any) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      return 0
    })

    // Add "Add New Address" option
    locations.push({
      id: 'add-new',
      label: '+ Add New Address',
      value: '+ Add New Address',
      isPrimary: false,
      addressObject: null
    })

    return locations
  }, [userData?.addresses])

  // Get available time slots
  const availableCollectionTimeSlots = useMemo(() => {
    const slots = generateTimeSlots(formData.collectionDate)
    console.log('Collection Date:', formData.collectionDate)
    console.log('Collection Slots:', slots)
    return slots
  }, [formData.collectionDate])

  const availableDeliveryTimeSlots = useMemo(() => {
    const dateToUse = formData.deliveryDate || formData.collectionDate
    const slots = generateTimeSlots(dateToUse)
    console.log('Delivery Date:', dateToUse)
    console.log('Delivery Slots:', slots)
    return slots
  }, [formData.deliveryDate, formData.collectionDate])

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {}

    if (!formData.selectedPickupAddress) {
      newErrors.pickupLocation = 'Pickup location is required'
    }

    if (!formData.collectionDate.trim()) {
      newErrors.collectionDate = 'Collection date is required'
    } else if (!isFutureDate(formData.collectionDate)) {
      newErrors.collectionDate =
        'Collection date must be today or in the future'
    }

    if (formData.deliveryDate && formData.collectionDate) {
      const deliveryDate = new Date(formData.deliveryDate)
      const collectionDate = new Date(formData.collectionDate)

      if (deliveryDate < collectionDate) {
        newErrors.deliveryDate =
          'Delivery date must be after or same as collection date'
      }
    }

    return newErrors
  }

  // UPDATED: Handle address selection
  const handleAddressSelection = (
    field: 'pickup' | 'delivery',
    selectedLabel: string
  ) => {
    // Handle add new address selection
    if (selectedLabel === '+ Add New Address') {
      console.log('Navigate to add new address screen')
      // You can navigate to add address screen here
      // router.push('/add-address')
      return
    }

    // Find the selected address object
    const selectedLocation = locationData.find(
      (loc: any) => loc.label === selectedLabel
    )

    if (selectedLocation && selectedLocation.addressObject) {
      if (field === 'pickup') {
        setFormData(prev => ({
          ...prev,
          selectedPickupAddress: selectedLocation.addressObject,
          pickupLocationLabel: selectedLabel
        }))
      } else if (field === 'delivery') {
        setFormData(prev => ({
          ...prev,
          selectedDeliveryAddress: selectedLocation.addressObject,
          deliveryLocationLabel: selectedLabel
        }))
      }

      // Clear error when address is selected
      if (errors.pickupLocation && field === 'pickup') {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.pickupLocation
          return newErrors
        })
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Handle address selections
    if (field === 'pickupLocation') {
      handleAddressSelection('pickup', value)
      return
    }

    if (field === 'deliveryLocation') {
      handleAddressSelection('delivery', value)
      return
    }

    // Handle other form fields
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear related time slots when date changes
    if (field === 'collectionDate') {
      setFormData(prev => ({ ...prev, collectionTime: '' }))
    }
    if (field === 'deliveryDate') {
      setFormData(prev => ({ ...prev, deliveryTime: '' }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const errorMessages = Object.values(validationErrors).join('\n')
      console.log('Validation errors:', errorMessages)
      return
    }

    // UPDATED: Save form data with Address objects to Redux
    dispatch(
      updatePickupDetails({
        pickupAddress: formData.selectedPickupAddress!, // Required address object

        collectionDate: formData.collectionDate,
        collectionTime: formData.collectionTime,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        partnerNote: formData.partnerNote,
        repeatOption: formData.repeatOption
      })
    )

    console.log('📍 Pickup Details Saved:', {
      pickupAddress: formData.selectedPickupAddress,
      deliveryAddress: formData.selectedDeliveryAddress,
      collectionDate: formData.collectionDate,
      collectionTime: formData.collectionTime,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      partnerNote: formData.partnerNote,
      repeatOption: formData.repeatOption
    })

    onNext()
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.title}>
            Enter <Text style={{ color: '#008ECC' }}>Pickup Details</Text>
          </Text>
          <View style={styles.divider} />

          <View style={styles.inputContainer}>
            {/* UPDATED: Pickup Address Selection */}
            <CustomInput
              label='Pickup Location'
              placeholder='Select your pickup address'
              type='location'
              required
              dropdownData={locationData.map((loc: any) => loc.label)}
              value={formData.pickupLocationLabel}
              onChangeText={text => handleInputChange('pickupLocation', text)}
              error={errors.pickupLocation}
            />

            <CustomInput
              label='Collection Date'
              placeholder='MM/DD/YYYY'
              type='date'
              required
              value={formData.collectionDate}
              onChangeText={text => handleInputChange('collectionDate', text)}
              error={errors.collectionDate}
              disabledDates={[]}
            />

            <CustomInput
              label='Collection Time'
              placeholder='Select time slot'
              type='dropdown'
              dropdownData={availableCollectionTimeSlots}
              value={formData.collectionTime}
              onChangeText={text => handleInputChange('collectionTime', text)}
              disabled={
                !formData.collectionDate ||
                availableCollectionTimeSlots.length === 0
              }
            />

            <CustomInput
              label='Delivery Date'
              placeholder='MM/DD/YYYY'
              type='date'
              value={formData.deliveryDate}
              onChangeText={text => handleInputChange('deliveryDate', text)}
              error={errors.deliveryDate}
              disabledDates={[]}
            />

            <CustomInput
              label='Delivery Time'
              placeholder='Select time slot'
              type='dropdown'
              dropdownData={availableDeliveryTimeSlots}
              value={formData.deliveryTime}
              onChangeText={text => handleInputChange('deliveryTime', text)}
              disabled={
                (!formData.deliveryDate && !formData.collectionDate) ||
                availableDeliveryTimeSlots.length === 0
              }
            />

            <CustomInput
              label='Add Notes for Delivery Partner'
              placeholder='Add Notes...'
              type='textarea'
              multiline
              value={formData.partnerNote}
              onChangeText={text => handleInputChange('partnerNote', text)}
            />

            {/* Repeat Options */}
            <View style={styles.repeatContainer}>
              <View style={styles.repeatOptionsRow}>
                <TouchableOpacity
                  style={styles.repeatOption}
                  onPress={() => handleInputChange('repeatOption', 'weekly')}
                >
                  <View
                    style={[
                      styles.radioButton,
                      formData.repeatOption === 'weekly' &&
                        styles.radioButtonSelected
                    ]}
                  >
                    {formData.repeatOption === 'weekly' && (
                      <View style={styles.radioButtonSelectedDot} />
                    )}
                  </View>
                  <Text style={styles.repeatOptionText}>Repeat Weekly</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.repeatOption}
                  onPress={() => handleInputChange('repeatOption', 'monthly')}
                >
                  <View
                    style={[
                      styles.radioButton,
                      formData.repeatOption === 'monthly' &&
                        styles.radioButtonSelected
                    ]}
                  >
                    {formData.repeatOption === 'monthly' && (
                      <View style={styles.radioButtonSelectedDot} />
                    )}
                  </View>
                  <Text style={styles.repeatOptionText}>Repeat Monthly</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.repeatOption}
                  onPress={() => handleInputChange('repeatOption', 'no-repeat')}
                >
                  <View
                    style={[
                      styles.radioButton,
                      formData.repeatOption === 'no-repeat' &&
                        styles.radioButtonSelected
                    ]}
                  >
                    {formData.repeatOption === 'no-repeat' && (
                      <View style={styles.radioButtonSelectedDot} />
                    )}
                  </View>
                  <Text style={styles.repeatOptionText}>No Repeat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <OrderNavigationButtons
            onPrevious={onPrev}
            onNext={handleNext}
            previousLabel='Previous'
            nextLabel='Next'
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    marginHorizontal: 15,
    paddingBottom: 20
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    color: '#333',
    marginBottom: 10
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 15
  },
  inputContainer: {
    paddingHorizontal: 20
  },
  repeatContainer: {
    marginTop: 20
  },
  repeatOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    flexWrap: 'wrap'
  },
  repeatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D5DD',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioButtonSelected: {
    borderColor: '#008ECC'
  },
  radioButtonSelectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#008ECC'
  },
  repeatOptionText: {
    fontSize: 14,
    color: '#667085',
    fontWeight: '400'
  }
})
