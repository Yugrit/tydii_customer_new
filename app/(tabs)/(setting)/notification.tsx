// screens/NotificationScreen.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import ApiService from '@/services/ApiService'
import { getData_MMKV } from '@/services/StorageService'
import { jwtDecode } from 'jwt-decode'
import { Bell, CheckCircle } from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

interface ApiNotification {
  id: number
  message: string
  read: boolean
  action: string
  comment: string
  data: any
  createdAt: string
}

interface JWTPayload {
  sub: number
  email: string
  name: string
  phone_number: string
  usertype: string
  roles: any[]
  isApproved: string
  stores: any[]
  deliveryPersonId: null
  iat: number
  exp: number
}

export default function NotificationScreen () {
  const colors = useThemeColors()
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    getUserIdFromToken()
  }, [])

  useEffect(() => {
    if (userId) {
      loadNotifications(1, false)
    }
  }, [userId])

  const getUserIdFromToken = () => {
    try {
      const token = getData_MMKV('user-token')
      if (token) {
        const decodedToken = jwtDecode<JWTPayload>(token)
        setUserId(decodedToken.sub)
        console.log('👤 User ID from token:', decodedToken.sub)
      } else {
        console.error('No authentication token found')
      }
    } catch (err) {
      console.error('Error decoding token:', err)
    }
  }

  const loadNotifications = async (
    page: number = 1,
    isLoadMore: boolean = false
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      console.log('🔄 Fetching notifications for page:', page)

      const response = await ApiService.get({
        url: '/notification/getNotifications',
        params: {
          page: page,
          limit: 20
        }
      })

      console.log('📋 Notifications API Response:', response)

      if (response?.success && Array.isArray(response.data)) {
        const apiNotifications: ApiNotification[] = response.data

        if (isLoadMore) {
          setNotifications(prev => [...prev, ...apiNotifications])
        } else {
          setNotifications(apiNotifications)
        }

        setUnreadCount(response.unreadCount || 0)
        setCurrentPage(page)
        setHasMore(page < (response.totalPages || 1))

        console.log('✅ Notifications loaded:', {
          total: apiNotifications.length,
          unread: response.unreadCount,
          page: page,
          hasMore: page < (response.totalPages || 1)
        })
      } else {
        if (!isLoadMore) {
          setNotifications([])
          setUnreadCount(0)
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('❌ Failed to load notifications:', error)
      if (!isLoadMore) {
        setNotifications([])
        setUnreadCount(0)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setCurrentPage(1)
    setHasMore(true)
    await loadNotifications(1, false)
    setRefreshing(false)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1
      loadNotifications(nextPage, true)
    }
  }, [loadingMore, hasMore, loading, currentPage])

  const markAsRead = async (notificationIds: number[]) => {
    if (!userId) {
      console.error('User ID not available')
      return
    }

    try {
      // Update local state immediately for better UX
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      )

      // Update unread count
      const unreadNotificationsToMark = notifications.filter(
        n => notificationIds.includes(n.id) && !n.read
      )
      if (unreadNotificationsToMark.length > 0) {
        setUnreadCount(prev =>
          Math.max(0, prev - unreadNotificationsToMark.length)
        )
      }

      // Call API to mark as read
      const idsString = notificationIds.join(',')
      console.log(
        '📖 Marking notifications as read:',
        idsString,
        'for user:',
        userId
      )

      const response = await ApiService.patch({
        url: `/notification/mark-read/${idsString}`,
        data: {
          userId: userId
        }
      })

      console.log('✅ Mark as read response:', response)
    } catch (error) {
      console.error('❌ Failed to mark notifications as read:', error)

      // Revert local state on error
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, read: false }
            : notification
        )
      )

      // Restore unread count
      const unreadNotificationsToRevert = notifications.filter(
        n => notificationIds.includes(n.id) && !n.read
      )
      if (unreadNotificationsToRevert.length > 0) {
        setUnreadCount(prev => prev + unreadNotificationsToRevert.length)
      }

      Alert.alert(
        'Error',
        'Failed to mark notifications as read. Please try again.'
      )
    }
  }

  const markSingleAsRead = async (id: number) => {
    await markAsRead([id])
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length === 0) {
      return
    }

    const unreadIds = unreadNotifications.map(n => n.id)
    await markAsRead(unreadIds)
  }

  const deleteNotification = (id: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update local state
              setNotifications(prev => {
                const notification = prev.find(n => n.id === id)
                if (notification && !notification.read) {
                  setUnreadCount(prevCount => Math.max(0, prevCount - 1))
                }
                return prev.filter(n => n.id !== id)
              })

              // TODO: Call API to delete notification
              console.log('🗑️ Deleting notification:', id)
              // await ApiService.delete({
              //   url: `/notification/${id}`
              // })
            } catch (error) {
              console.error('❌ Failed to delete notification:', error)
              // Refresh data on error
              handleRefresh()
            }
          }
        }
      ]
    )
  }

  const handleNotificationPress = (notification: ApiNotification) => {
    if (!notification.read) {
      markSingleAsRead(notification.id)
    }

    // Extract order ID from message if present for navigation
    const orderIdMatch = notification.message.match(/#(ORD-[A-Za-z0-9-]+)/i)
    if (orderIdMatch) {
      console.log('🔗 Navigate to order:', orderIdMatch[1])
      // router.push(`/order-tracking?orderId=${orderIdMatch[1]}`)
    }
  }

  const formatTimestamp = (createdAt: string) => {
    const timestamp = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  // Generate a simple title from the message
  const generateTitle = (message: string) => {
    const messageLower = message.toLowerCase()

    if (messageLower.includes('confirmed')) {
      return 'Order Confirmed'
    } else if (messageLower.includes('mismatch')) {
      return 'Order Mismatch Resolved'
    } else if (messageLower.includes('pickup')) {
      return 'Pickup Update'
    } else if (messageLower.includes('delivery')) {
      return 'Delivery Update'
    } else if (messageLower.includes('offer')) {
      return 'Special Offer'
    } else if (messageLower.includes('feedback')) {
      return 'Feedback Request'
    } else {
      return 'Notification'
    }
  }

  // Check if notification has an order ID for action button
  const hasOrderAction = (message: string) => {
    return message.match(/#(ORD-[A-Za-z0-9-]+)/i) !== null
  }

  const filteredNotifications = notifications.filter(notification =>
    selectedTab === 'all' ? true : !notification.read
  )

  const renderNotificationItem = ({ item }: { item: ApiNotification }) => {
    const styles = createStyles(colors)
    const title = generateTitle(item.message)

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.notificationInfo}>
              <Text
                style={[
                  styles.notificationTitle,
                  !item.read && styles.unreadTitle
                ]}
              >
                {title}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.createdAt)}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size='small' color={colors.primary} />
          <Text style={styles.loadMoreText}>Loading more...</Text>
        </View>
      )
    }
    return null
  }

  const renderEmpty = () => {
    const styles = createStyles(colors)

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <Bell size={48} color={colors.border} />
        <Text style={styles.emptyTitle}>
          {selectedTab === 'unread'
            ? 'No Unread Notifications'
            : 'No Notifications'}
        </Text>
        <Text style={styles.emptyText}>
          {selectedTab === 'unread'
            ? 'All caught up! No unread notifications.'
            : "You'll see your notifications here when you receive them."}
        </Text>
      </View>
    )
  }

  const styles = createStyles(colors)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.underline} />
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <CheckCircle size={16} color={colors.primary} />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'all' && styles.activeTabText
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
          onPress={() => setSelectedTab('unread')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'unread' && styles.activeTabText
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id.toString()}
        style={styles.notificationsList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text
    },
    underline: {
      width: 80,
      height: 3,
      backgroundColor: colors.primary,
      marginTop: 8
    },
    markAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.light,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6
    },
    markAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4
    },
    activeTab: {
      backgroundColor: colors.primary
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary
    },
    activeTabText: {
      color: colors.background
    },
    notificationsList: {
      flex: 1
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      flexGrow: 1
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 50
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    },
    loadMoreContainer: {
      paddingVertical: 16,
      alignItems: 'center'
    },
    loadMoreText: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary
    },
    notificationCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    unreadCard: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary
    },
    notificationContent: {
      width: '100%'
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.light,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12
    },
    notificationInfo: {
      flex: 1
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2
    },
    unreadTitle: {
      fontWeight: '700'
    },
    timestamp: {
      fontSize: 12,
      color: colors.textSecondary
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary
    },
    deleteButton: {
      padding: 4
    },
    notificationMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12
    },
    actionButtonContainer: {
      alignItems: 'flex-start'
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.background
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 100
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
      lineHeight: 20
    }
  })
