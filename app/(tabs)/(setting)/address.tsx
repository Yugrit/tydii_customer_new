import { useThemeColors } from '@/hooks/useThemeColor'
import { useToast } from '@/hooks/useToast'
import { updateUserData } from '@/Redux/slices/userSlices'
import { updateUserAddresses } from '@/services/AddressService'
import { useRouter } from 'expo-router'
import {
  Building,
  Edit3,
  Home,
  MapPin,
  Plus,
  Trash2
} from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

export default function ManageAddressScreen () {
  const router = useRouter()
  const colors = useThemeColors()
  const dispatch = useDispatch()
  const toast = useToast()

  // Get user data from Redux
  const user = useSelector((state: any) => state.user.userData)

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)

  // Initialize addresses from user data
  useEffect(() => {
    if (user?.addresses) {
      // Filter out deleted addresses and transform data
      const transformedAddresses = user.addresses
        .filter((addr: any) => !addr.latlong?.is_deleted)
        .map((addr: any) => ({
          id: addr.id,
          shop_id: addr.shop_id,
          addressType: addr.address_type,
          houseNo: addr.house_no,
          streetAddress: addr.street_address,
          city: addr.city,
          state: addr.state,
          zipcode: addr.zipcode,
          landmark: addr.landmark,
          isPrimary: addr.is_primary,
          latLongId: addr.latlong?.id,
          latitude: addr.latlong?.latitude,
          longitude: addr.latlong?.longitude,
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

  // Transform local address back to API format
  const transformToApiFormat = (localAddresses: any[]) => {
    return localAddresses.map(addr => ({
      id: addr.id,
      shop_id: addr.shop_id || 101, // Default shop_id
      house_no: addr.houseNo,
      street_address: addr.streetAddress,
      landmark: addr.landmark || '',
      city: addr.city,
      address_type: addr.addressType,
      state: addr.state,
      zipcode: addr.zipcode,
      is_primary: addr.isPrimary,
      latlong: {
        id: addr.latLongId,
        latitude: addr.latitude || 0,
        longitude: addr.longitude || 0,
        is_deleted: false
      }
    }))
  }

  const handleAddNewAddress = () => {
    console.log('Add new address')
    router.push('/add-address')
  }

  const handleEditAddress = (id: number) => {
    console.log('Edit address:', id)
    router.push(`./edit-address?id=${id}`)
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
          onPress: async () => {
            if (loading) return

            setLoading(true)
            try {
              console.log('🗑️ Deleting address:', id)

              // Transform current addresses to API format
              const apiAddresses = transformToApiFormat(addresses)

              // Call the address service to delete
              const updatedAddresses = await updateUserAddresses(
                user.id,
                apiAddresses,
                { type: 'delete', addressId: id }
              )

              console.log('✅ Address deleted successfully')

              // Update Redux state
              dispatch(
                updateUserData({
                  ...user,
                  addresses: updatedAddresses
                })
              )

              // Show success toast
              toast.success('Address deleted successfully')
            } catch (error) {
              console.error('❌ Failed to delete address:', error)
              toast.error('Failed to delete address. Please try again.')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleSetPrimary = async (id: number) => {
    if (loading) return

    // Don't do anything if it's already primary
    const currentAddress: any = addresses.find((addr: any) => addr.id === id)
    if (currentAddress?.isPrimary) {
      return
    }

    setLoading(true)
    try {
      console.log('🏠 Setting primary address:', id)

      // Transform current addresses to API format
      const apiAddresses = transformToApiFormat(addresses)

      // Call the address service to set primary
      const updatedAddresses = await updateUserAddresses(
        user.id,
        apiAddresses,
        { type: 'setPrimary', addressId: id }
      )

      console.log('✅ Primary address updated successfully')

      // Update Redux state
      dispatch(
        updateUserData({
          ...user,
          addresses: updatedAddresses
        })
      )

      // Show success toast
      toast.success('Primary address updated')
    } catch (error) {
      console.error('❌ Failed to update primary address:', error)
      toast.error('Failed to update primary address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderAddressItem = ({ item }: { item: any }) => {
    const IconComponent = getAddressIcon(item.addressType)
    const styles = createStyles(colors)

    return (
      <View style={[styles.addressCard, loading && styles.disabledCard]}>
        <View style={styles.addressHeader}>
          <View style={styles.addressIconContainer}>
            <IconComponent size={20} color={colors.primary} />
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
              <Text
                style={[styles.primaryLabel, loading && styles.disabledText]}
              >
                Set as Primary
              </Text>
            </View>
            <Switch
              value={item.isPrimary}
              onValueChange={() => handleSetPrimary(item.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={item.isPrimary ? colors.background : colors.surface}
              ios_backgroundColor={colors.border}
              disabled={loading}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, loading && styles.disabledButton]}
              onPress={() => handleEditAddress(item.id)}
              disabled={loading}
              activeOpacity={loading ? 1 : 0.7}
            >
              <Edit3
                size={18}
                color={loading ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.disabledButton]}
              onPress={() => handleDeleteAddress(item.id)}
              disabled={loading}
              activeOpacity={loading ? 1 : 0.7}
            >
              <Trash2
                size={18}
                color={loading ? colors.textSecondary : colors.notification}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>
    )
  }

  const styles = createStyles(colors)

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
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleAddNewAddress}
          disabled={loading}
          activeOpacity={loading ? 1 : 0.7}
        >
          <Plus
            size={16}
            color={loading ? colors.textSecondary : colors.background}
            strokeWidth={2}
          />
          <Text style={[styles.addButtonText, loading && styles.disabledText]}>
            Add New
          </Text>
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
          scrollEnabled={!loading}
        />
      ) : (
        <View style={styles.emptyState}>
          <MapPin size={48} color={colors.border} />
          <Text style={styles.emptyTitle}>No Addresses Found</Text>
          <Text style={styles.emptyText}>
            Add your first address to get started with deliveries
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, loading && styles.disabledButton]}
            onPress={handleAddNewAddress}
            disabled={loading}
            activeOpacity={loading ? 1 : 0.7}
          >
            <Text
              style={[styles.emptyButtonText, loading && styles.disabledText]}
            >
              Add Address
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
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
      color: colors.text
    },
    titleAccent: {
      color: colors.primary
    },
    underline: {
      width: 100,
      height: 3,
      backgroundColor: colors.primary,
      marginTop: 8
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6
    },
    addButtonText: {
      color: colors.background,
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
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border,
      position: 'relative'
    },
    disabledCard: {
      opacity: 0.7
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
      backgroundColor: colors.light,
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
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    primaryBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8
    },
    primaryBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.background
    },
    addressText: {
      fontSize: 14,
      color: colors.text,
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
      color: colors.textSecondary,
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
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border
    },
    disabledButton: {
      backgroundColor: colors.border,
      opacity: 0.6
    },
    disabledText: {
      color: colors.textSecondary
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500'
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
      color: colors.text,
      marginTop: 16,
      marginBottom: 8
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8
    },
    emptyButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600'
    }
  })
