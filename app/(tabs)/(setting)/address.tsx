import { useRouter } from 'expo-router'
import {
  Building,
  Edit3,
  Home,
  MapPin,
  Plus,
  Trash2
} from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useSelector } from 'react-redux'

export default function ManageAddressScreen () {
  const router = useRouter()

  // Get user data from Redux (assuming addresses are stored in user state)
  const user = useSelector((state: any) => state.user.userData)

  const [addresses, setAddresses] = useState([])

  // Initialize addresses from user data
  useEffect(() => {
    if (user?.addresses) {
      // Filter out deleted addresses and transform data
      const transformedAddresses = user.addresses
        .filter((addr: any) => !addr.is_deleted && addr.deleted_at === null)
        .map((addr: any) => ({
          id: addr.id,
          addressType: addr.address_type,
          houseNo: addr.house_no,
          streetAddress: addr.street_address,
          city: addr.city,
          state: addr.state,
          zipcode: addr.zipcode,
          landmark: addr.landmark,
          isPrimary: addr.is_primary,
          latitude: addr.latlongs?.latitude,
          longitude: addr.latlongs?.longitude,
          createdAt: addr.created_at
        }))

      setAddresses(transformedAddresses)
    }
  }, [user])

  // Format address for display
  const formatAddress = (address: any) => {
    const parts = []

    if (address.houseNo) parts.push(address.houseNo)
    if (address.streetAddress) parts.push(address.streetAddress)
    if (address.landmark) parts.push(address.landmark)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zipcode) parts.push(address.zipcode)

    return parts.filter(Boolean).join(', ')
  }

  // Get icon based on address type
  const getAddressIcon = (addressType: string) => {
    switch (addressType?.toLowerCase()) {
      case 'office':
        return Building
      case 'home':
        return Home
      default:
        return MapPin
    }
  }

  // Get address type label
  const getAddressTypeLabel = (addressType: string) => {
    switch (addressType?.toLowerCase()) {
      case 'office':
        return 'Office'
      case 'home':
        return 'Home'
      case 'other':
        return 'Other'
      default:
        return addressType || 'Address'
    }
  }

  const handleAddNewAddress = () => {
    console.log('Add new address')
    // router.push('/add-address')
  }

  const handleEditAddress = (id: number) => {
    console.log('Edit address:', id)
    // router.push(`/edit-address/${id}`)
  }

  const handleDeleteAddress = (id: number) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Call API to delete address
            // dispatch(deleteAddress(id))
            setAddresses(prev => prev.filter((addr: any) => addr.id !== id))
          }
        }
      ]
    )
  }

  const handleSetPrimary = (id: number) => {
    // TODO: Call API to update primary address
    // dispatch(updatePrimaryAddress(id))

    setAddresses((prev: any) =>
      prev.map((addr: any) => ({
        ...addr,
        isPrimary: addr.id === id
      }))
    )
  }

  const renderAddressItem = ({ item }: { item: any }) => {
    const IconComponent = getAddressIcon(item.addressType)

    return (
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <View style={styles.addressIconContainer}>
            <IconComponent size={20} color='#02537F' />
          </View>
          <View style={styles.addressInfo}>
            <View style={styles.addressTypeContainer}>
              <Text style={styles.addressTypeLabel}>
                {getAddressTypeLabel(item.addressType)}
              </Text>
              {item.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText}>{formatAddress(item)}</Text>
          </View>
        </View>

        <View style={styles.addressActions}>
          <View style={styles.primarySection}>
            <View
              style={{
                width: '50%'
              }}
            >
              <Text style={styles.primaryLabel}>Set as Primary</Text>
            </View>
            <Switch
              value={item.isPrimary}
              onValueChange={() => handleSetPrimary(item.id)}
              trackColor={{ false: '#e0e0e0', true: '#02537F' }}
              thumbColor={item.isPrimary ? '#ffffff' : '#f4f3f4'}
              ios_backgroundColor='#e0e0e0'
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditAddress(item.id)}
            >
              <Edit3 size={18} color='#02537F' />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteAddress(item.id)}
            >
              <Trash2 size={18} color='#dc3545' />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Manage <Text style={styles.titleAccent}>Address</Text>
          </Text>
          <View style={styles.underline} />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNewAddress}
        >
          <Plus size={16} color='#ffffff' strokeWidth={2} />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Address List */}
      {addresses.length > 0 ? (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={item => item.id.toString()}
          style={styles.addressList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <MapPin size={48} color='#cccccc' />
          <Text style={styles.emptyTitle}>No Addresses Found</Text>
          <Text style={styles.emptyText}>
            Add your first address to get started with deliveries
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddNewAddress}
          >
            <Text style={styles.emptyButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
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
    width: 100,
    height: 3,
    backgroundColor: '#02537F',
    marginTop: 8
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#02537F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  addressList: {
    flex: 1
  },
  listContent: {
    paddingBottom: 20
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  addressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5f3f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2
  },
  addressInfo: {
    flex: 1
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  addressTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  primaryBadge: {
    backgroundColor: '#02537F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff'
  },
  addressText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  primarySection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  primaryLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 12
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  emptyButton: {
    backgroundColor: '#02537F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
})
