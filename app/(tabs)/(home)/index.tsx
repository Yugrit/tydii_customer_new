// app/(tabs)/index.tsx
import FavouriteLaundry from '@/components/FavouriteLaundary'
import OfferedLaundry from '@/components/OfferedLaundary'
import Services from '@/components/Services'
import Loader from '@/components/ui/Loader'
import MainCard from '@/components/ui/MainCard'
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import { startOrder } from '@/Redux/slices/orderSlice'
import {
  logout,
  transformUserData,
  userLoginState
} from '@/Redux/slices/userSlices'
import ApiService from '@/services/ApiService'
import { getData_MMKV, storeData_MMKV } from '@/services/StorageService'
import { useRouter } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import { ArrowRight, X } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

interface JWTPayload {
  sub: string
  exp: number
  iat: number
  [key: string]: any
}

// Service Selection Modal Component
const ServiceSelectionModal = ({
  visible,
  onClose,
  onServiceSelect,
  colors
}: {
  visible: boolean
  onClose: () => void
  onServiceSelect: (serviceType: ServiceTypeEnum) => void
  colors: any
}) => {
  const services = [
    {
      id: ServiceTypeEnum.WASH_N_FOLD,
      title: 'Wash & Fold',
      description: 'Professional washing and folding service',
      image: require('../../../assets/images/wash.png'),
      color: colors.light
    },
    {
      id: ServiceTypeEnum.DRYCLEANING,
      title: 'Dry Clean',
      description: 'Premium dry cleaning service',
      image: require('../../../assets/images/dryclean.png'),
      color: colors.light
    },
    {
      id: ServiceTypeEnum.TAILORING,
      title: 'Tailoring',
      description: 'Expert tailoring and alterations',
      image: require('../../../assets/images/tailor.png'),
      color: colors.light
    }
  ]

  const modalStyles = createModalStyles(colors)

  const renderServiceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[modalStyles.serviceItem, { backgroundColor: colors.background }]}
      onPress={() => onServiceSelect(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={[
          modalStyles.serviceIconContainer,
          { backgroundColor: item.color }
        ]}
      >
        <Image
          source={item.image}
          style={modalStyles.serviceIcon}
          resizeMode='contain'
        />
      </View>

      <View style={modalStyles.serviceContent}>
        <Text style={[modalStyles.serviceTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[
            modalStyles.serviceDescription,
            { color: colors.textSecondary }
          ]}
        >
          {item.description}
        </Text>
      </View>

      <ArrowRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View
          style={[
            modalStyles.modalContent,
            { backgroundColor: colors.background }
          ]}
        >
          {/* Header */}
          <View style={modalStyles.modalHeader}>
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>
              Select Service
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                modalStyles.closeButton,
                { backgroundColor: colors.surface }
              ]}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text
            style={[modalStyles.modalSubtitle, { color: colors.textSecondary }]}
          >
            Choose the service you need to get started
          </Text>

          {/* Services List */}
          <FlatList
            data={services}
            renderItem={renderServiceItem}
            keyExtractor={item => item.id}
            style={modalStyles.servicesList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.servicesContainer}
          />

          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              modalStyles.cancelButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={onClose}
          >
            <Text
              style={[
                modalStyles.cancelButtonText,
                { color: colors.textSecondary }
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default function HomePage () {
  const dispatch = useDispatch()
  const router = useRouter()
  const { userData, isApproved } = useSelector((state: any) => state.user)
  const colors = useThemeColors()

  const [loading, setLoading] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)

  const token = getData_MMKV('user-token')

  useEffect(() => {
    async function checkAndFetchUserData () {
      // If no token, redirect to login
      if (!token) {
        console.log('❌ No token found, redirecting to login')
        router.replace('/auth/login')
        return
      }

      console.log('USER TOKEN :::: ', token)

      // If userData is missing or incomplete, fetch it
      if (!userData || !userData.id) {
        console.log('📡 UserData missing, fetching from API...')
        setLoading(true)

        try {
          const decodedToken = jwtDecode<JWTPayload>(token)
          const userId = decodedToken.sub

          if (!userId) {
            throw new Error('No userId in token')
          }

          console.log('🆔 Fetching user profile for:', userId)

          const response = await ApiService.get({
            url: `/customer/users`,
            params: { id: userId, limit: 10, page: 1 }
          })

          const serverUserData = response.data?.[0]

          if (!serverUserData) {
            throw new Error('No user data from API')
          }

          // Transform server data
          const transformedUserData = transformUserData(serverUserData)

          // Update Redux state
          dispatch(
            userLoginState({
              token: token,
              isApproved: true,
              userData: transformedUserData
            })
          )

          // Save to MMKV for future app launches
          storeData_MMKV('user-data', transformedUserData)

          console.log('✅ User data fetched and saved')
        } catch (error) {
          console.error('❌ Failed to fetch user data:', error)

          // Clear invalid token and redirect to login
          dispatch(logout())
          router.replace('/auth/login')
        } finally {
          setLoading(false)
        }
      } else {
        console.log('✅ UserData already available:', userData.name)
      }
    }

    checkAndFetchUserData()
  }, [token, userData, dispatch, router])

  // Handle MainCard button press
  const handleSchedulePickup = () => {
    console.log('🚀 Opening service selection modal')
    setShowServiceModal(true)
  }

  // Handle service selection
  const handleServiceSelect = (serviceType: ServiceTypeEnum) => {
    console.log('🎯 Service selected:', serviceType)

    // Close modal
    setShowServiceModal(false)

    // Start order flow with selected service
    dispatch(startOrder(serviceType))

    // Navigate to order screen
    router.push('./order')
  }

  // Handle modal close
  const handleModalClose = () => {
    setShowServiceModal(false)
  }

  // Show loader while fetching user data
  if (loading) {
    return (
      <Loader
        message='Loading your profile...'
        subMessage='Please wait while we fetch your data'
        color={colors.primary}
      />
    )
  }

  // Show loader if we have token but no userData yet
  if (token && (!userData || !userData.id)) {
    return <Loader message='Preparing your account...' color={colors.primary} />
  }

  console.log('✅ Rendering HomePage with user:', userData?.name)

  const styles = createStyles(colors)

  return (
    <>
      <ScrollView style={styles.container}>
        <MainCard
          title='Clothing Services'
          description='Having a pet means you have more joy, a new friend, a happy person who will always be with'
          button={true}
          buttonText='Schedule Your Pickup'
          onPress={handleSchedulePickup}
        />
        <Services />
        <FavouriteLaundry />
        <OfferedLaundry />
      </ScrollView>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        visible={showServiceModal}
        onClose={handleModalClose}
        onServiceSelect={handleServiceSelect}
        colors={colors}
      />
    </>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10
    }
  })

const createModalStyles = (colors: any) =>
  StyleSheet.create({
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
      paddingTop: 20
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 10
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700'
    },
    closeButton: {
      padding: 8,
      borderRadius: 20
    },
    modalSubtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 20
    },
    servicesList: {
      paddingHorizontal: 20
    },
    servicesContainer: {
      paddingBottom: 20
    },
    serviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2
    },
    serviceIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
    },
    serviceIcon: {
      width: 32,
      height: 32
    },
    serviceContent: {
      flex: 1
    },
    serviceTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4
    },
    serviceDescription: {
      fontSize: 14,
      lineHeight: 20
    },
    cancelButton: {
      margin: 20,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center'
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600'
    }
  })
