// services/AddressService.ts
import ApiService from '@/services/ApiService'

export interface Address {
  id?: number | null
  house_no: string
  street_address: string | null
  landmark: string
  city: string
  address_type: string
  state: string
  zipcode: string
  is_primary?: boolean
  is_deleted?: boolean
  created_at?: string
  deleted_at?: string | null
  latlongs?: {
    id?: number | null
    latitude: string | number
    longitude: string | number
    is_deleted: boolean
  }[]
  // For new addresses without ID
  latlong?: {
    latitude: number
    longitude: number
  }
}

type AddressOperation =
  | { type: 'delete'; addressId: number }
  | { type: 'setPrimary'; addressId: number }
  | { type: 'add'; newAddress: any }
  | { type: 'update'; addressId: number; updatedFields: Partial<Address> }

export const updateUserAddresses = async (
  userId: number,
  currentAddresses: Address[],
  operation: AddressOperation
): Promise<Address[]> => {
  try {
    let updatedAddresses = [...currentAddresses]

    console.log('🔄 Processing operation:', operation.type)
    console.log('📋 Current addresses:', currentAddresses.length)

    switch (operation.type) {
      case 'delete':
        console.log('🗑️ Deleting address with DELETE API:', operation.addressId)

        try {
          const deleteResponse = await ApiService.delete({
            url: `/customer/users/address/delete/${operation.addressId}`
          })

          console.log('✅ DELETE API response:', deleteResponse)

          // Remove the deleted address from local array
          updatedAddresses = updatedAddresses.filter(
            address => address.id !== operation.addressId
          )

          console.log('📋 Addresses after removal:', updatedAddresses.length)

          // If deleted address was primary and there are remaining addresses,
          // set the first remaining address as primary
          const deletedAddress = currentAddresses.find(
            addr => addr.id === operation.addressId
          )

          if (deletedAddress?.is_primary && updatedAddresses.length > 0) {
            console.log(
              '🔄 Deleted address was primary, setting new primary...'
            )

            // Find first address to make primary
            const newPrimaryAddress = updatedAddresses[0]

            if (newPrimaryAddress.id) {
              console.log(
                '🏠 Setting new primary address:',
                newPrimaryAddress.id
              )

              // Call setPrimary for the first remaining address
              return await updateUserAddresses(userId, updatedAddresses, {
                type: 'setPrimary',
                addressId: newPrimaryAddress.id
              })
            }
          }

          return updatedAddresses
        } catch (deleteError) {
          console.error('❌ DELETE API failed:', deleteError)
          throw deleteError
        }

      case 'setPrimary':
        console.log('🏠 Setting primary address:', operation.addressId)

        // Set all addresses to non-primary first
        updatedAddresses = updatedAddresses.map(address => ({
          ...address,
          is_primary: false
        }))

        // Set the selected address as primary
        updatedAddresses = updatedAddresses.map(address => ({
          ...address,
          is_primary: address.id === operation.addressId
        }))

        // Transform addresses to match API structure
        const transformedAddresses = transformAddressesForAPI(updatedAddresses)

        const setPrimaryResponse = await ApiService.patch({
          url: `/customer/users/${userId}`,
          data: { addresses: transformedAddresses }
        })

        console.log('✅ Primary address updated successfully')
        return setPrimaryResponse.addresses || updatedAddresses

      case 'add':
        console.log('➕ Adding new address')
        console.log('📦 New address data:', operation.newAddress)

        // Transform the new address to match API structure
        const newAddressForAPI = transformNewAddressForAPI(operation.newAddress)

        // Count active addresses to determine if this should be primary
        const activeAddressCount = updatedAddresses.filter(
          addr => !addr.is_deleted
        ).length

        console.log('📊 Current active address count:', activeAddressCount)

        // Prepare the addresses array for API
        const transformedExistingAddresses =
          transformAddressesForAPI(updatedAddresses)
        const allAddresses = [...transformedExistingAddresses, newAddressForAPI]

        console.log(allAddresses)

        console.log('📤 Sending to API - Total addresses:', allAddresses.length)
        console.log('📋 New address payload:', newAddressForAPI)

        const addResponse = await ApiService.patch({
          url: `/customer/users/${userId}`
          // data: { addresses: allAddresses }
        })

        console.log('✅ Address added successfully')
        console.log('📋 API Response addresses:', addResponse.addresses?.length)
        return addResponse.addresses || allAddresses

      case 'update':
        console.log('✏️ Updating address:', operation.addressId)

        updatedAddresses = updatedAddresses.map(address => {
          if (address.id === operation.addressId) {
            return { ...address, ...operation.updatedFields }
          }
          return address
        })

        // If setting as primary, make sure no other address is primary
        if (operation.updatedFields.is_primary) {
          updatedAddresses.forEach(addr => {
            if (addr.id !== operation.addressId) {
              addr.is_primary = false
            }
          })
        }

        const transformedUpdatedAddresses =
          transformAddressesForAPI(updatedAddresses)

        console.log(transformedUpdatedAddresses)

        const updateResponse = await ApiService.patch({
          url: `/customer/users/${userId}`
          // data: { addresses: transformedUpdatedAddresses }
        })

        console.log('✅ Address updated successfully')
        return updateResponse.addresses || updatedAddresses

      default:
        throw new Error(`Unknown operation type: ${(operation as any).type}`)
    }
  } catch (error) {
    console.error('❌ Failed to update addresses:', error)
    throw error
  }
}

// Transform addresses from your app format to API format
const transformAddressesForAPI = (addresses: Address[]): any[] => {
  console.log('🔄 Transforming existing addresses for API:', addresses.length)

  return addresses.map(address => {
    // For existing addresses with ID
    if (address.id) {
      return {
        id: address.id,
        house_no: address.house_no,
        street_address: address.street_address,
        landmark: address.landmark || '',
        city: address.city,
        address_type: address.address_type,
        state: address.state,
        zipcode: address.zipcode,
        is_primary: address.is_primary,
        is_deleted: address.is_deleted || false,
        created_at: address.created_at,
        deleted_at: address.deleted_at,
        latlongs: address.latlongs
      }
    }

    // For new addresses without ID, transform latlong structure
    return transformNewAddressForAPI(address)
  })
}

// Transform new address to API format
const transformNewAddressForAPI = (address: any): any => {
  console.log('🔄 Transforming new address for API:', address)

  const apiAddress: any = {
    house_no: address.house_no || '',
    street_address: address.street_address || null,
    landmark: address.landmark || '',
    city: address.city,
    address_type: address.address_type,
    state: address.state,
    zipcode: address.zipcode
  }

  // Handle latlong transformation - API expects this structure for new addresses
  if (address.latlong) {
    apiAddress.latlong = {
      latitude: address.latlong.latitude,
      longitude: address.latlong.longitude
    }
  }

  console.log('📤 Transformed API address:', apiAddress)
  return apiAddress
}

// Helper function to get only active addresses
export const getActiveAddresses = (addresses: Address[]): Address[] => {
  return addresses.filter(address => !address.is_deleted)
}

// Helper function to get primary address
export const getPrimaryAddress = (addresses: Address[]): Address | null => {
  const activeAddresses = getActiveAddresses(addresses)
  return (
    activeAddresses.find(address => address.is_primary) ||
    activeAddresses[0] ||
    null
  )
}
