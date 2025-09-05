// app/(tabs)/index.tsx
import ApiService from '@/services/ApiService'
import {
  clearStorage_MMKV,
  getData_MMKV,
  storeData_MMKV
} from '@/services/StorageService'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { userLoginState } from '../../Redux/slices/userSlices'

// ✅ Interface for JWT
interface JWTPayload {
  sub: string
  exp: number
  iat: number
  [key: string]: any
}

export default function HomePage () {
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.user)

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const token = user?.token
  const isApproved = user?.isApproved

  // 🔄 Fetch user from API
  const fetchFromAPI = async () => {
    if (!token) return
    try {
      setLoading(true)
      const decodedToken = jwtDecode<JWTPayload>(token)
      const userId = decodedToken.sub

      const response = await ApiService.get({
        url: `/customer/users`,
        params: { id: userId, limit: 1, page: 1 }
      })

      const freshUser = response.data?.[0]
      if (freshUser) {
        setUserData(freshUser)
        storeData_MMKV('user-data', JSON.stringify(freshUser))

        // update redux
        dispatch(
          userLoginState({
            token,
            isApproved: freshUser.isApproved || 'approved',
            user: freshUser
          })
        )
      }
    } catch (error) {
      console.error('❌ Error fetching user from API:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ On mount - first try MMKV, else API
  useEffect(() => {
    async function init () {
      try {
        setLoading(true)
        const savedUserData = getData_MMKV('user-data')

        if (savedUserData) {
          console.log('📦 Loaded from MMKV:', savedUserData)
          setUserData(JSON.parse(savedUserData))
        } else {
          await fetchFromAPI()
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [token])

  // ✅ Logout
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            dispatch(
              userLoginState({ token: '', isApproved: false, user: null })
            )
            clearStorage_MMKV()
            router.replace('/auth/login')
          } catch (error) {
            Alert.alert('Error', 'Logout failed')
          }
        }
      }
    ])
  }

  // ✅ Loader
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#3587B8' />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome to Your App</Text>

        {/* ✅ User Profile Card */}
        {userData && (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {userData.profile_img_url ? (
                  <Image
                    source={{ uri: userData.profile_img_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name='person' size={40} color='#FFF' />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userType}>{userData.userType}</Text>
                <View style={styles.statusBadge}>
                  <Text
                    style={[
                      styles.statusText,
                      userData.isApproved === 'approved'
                        ? styles.approvedText
                        : styles.pendingText
                    ]}
                  >
                    {userData.isApproved === 'approved'
                      ? '✅ Approved'
                      : '⏳ Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ✅ User Details Card */}
        {userData && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Personal Information</Text>

            <View style={styles.detailRow}>
              <Ionicons name='mail' size={20} color='#666' />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='call' size={20} color='#666' />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{userData.phone_number}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='calendar' size={20} color='#666' />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date of Birth</Text>
                <Text style={styles.detailValue}>
                  {new Date(userData.dob).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='person' size={20} color='#666' />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>
                  {userData.gender.charAt(0).toUpperCase() +
                    userData.gender.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='shield-checkmark' size={20} color='#666' />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Auth Provider</Text>
                <Text style={styles.detailValue}>
                  {userData.authProvider.charAt(0).toUpperCase() +
                    userData.authProvider.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name='time' size={20} color='#666' />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Member Since</Text>
                <Text style={styles.detailValue}>
                  {new Date(userData.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ✅ App Status Card */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>App Status:</Text>
          <Text style={styles.statusText}>
            Token: {token ? '✅ Active' : '❌ No token'}
          </Text>
          <Text style={styles.statusText}>
            Approved: {isApproved ? '✅ Yes' : '❌ No'}
          </Text>
          {userData && (
            <Text style={styles.statusText}>
              User Status: {userData.user_status ? '🟢 Active' : '🔴 Inactive'}
            </Text>
          )}
        </View>

        {/* ✅ Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchFromAPI}>
            <Ionicons name='refresh' size={20} color='#FFF' />
            <Text style={styles.buttonText}>Refresh Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name='create' size={20} color='#FFF' />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name='log-out' size={20} color='#FFF' />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  innerContainer: { flex: 1, padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937'
  },

  // ✅ Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3587B8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInfo: { flex: 1 },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  userType: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6'
  },
  approvedText: { color: '#059669', fontSize: 14, fontWeight: '600' },
  pendingText: { color: '#D97706', fontSize: 14, fontWeight: '600' },

  // ✅ Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  detailContent: { marginLeft: 16, flex: 1 },
  detailLabel: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  detailValue: { fontSize: 16, color: '#1F2937', fontWeight: '500' },

  // ✅ Status Container
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937'
  },
  statusText: { fontSize: 16, marginBottom: 6, color: '#4B5563' },

  // ✅ Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12
  },
  editButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
})
