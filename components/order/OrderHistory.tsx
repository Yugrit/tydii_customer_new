import { useThemeColors } from '@/hooks/useThemeColor'
import ApiService from '@/services/ApiService'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useSelector } from 'react-redux'
import OrderCard from './OrderCard'

export default function OrderHistory () {
  const colors = useThemeColors()

  type OrderCardProps = {
    id: string
    orderId: string
    laundryName: string
    laundryImage: string
    rating: number
    serviceType: string
    weight: string
    price: string
    orderDate: string
    orderStatus: string
    fullOrderData: any
  }

  const [orderData, setOrderData] = useState<OrderCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const { userData } = useSelector((state: any) => state.user)

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getServiceTypeDisplay = (serviceType: string) => {
    switch (serviceType) {
      case 'WASH_N_FOLD':
        return 'Wash & Fold'
      case 'DRYCLEANING':
        return 'Dry Clean'
      case 'TAILORING':
        return 'Tailoring'
      default:
        return serviceType
    }
  }

  const fetchOrders = async (pageNumber: number, isLoadMore = false) => {
    try {
      if (!userData?.id) {
        setError('User not found')
        setLoading(false)
        return
      }

      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      console.log(`🔄 Fetching orders for page ${pageNumber}...`)

      const response = await ApiService.get({
        url: '/customer/orders',
        params: {
          user_id: userData.id,
          limit: 10,
          page: pageNumber
        }
      })

      if (response?.data && Array.isArray(response.data)) {
        const transformedOrders = response.data.map((order: any) => {
          const service = order.services
          const serviceItems = service?.items || []
          const totalWeight = serviceItems.reduce((sum: number, item: any) => {
            return sum + parseFloat(item.quantity || 0)
          }, 0)

          return {
            id: order.id.toString(),
            orderId: order.order_id.replace('ORD-', '').replace(/-/g, ''),
            laundryName: order.store?.storeName || 'Laundry Store',
            laundryImage:
              order.store?.shopImageUrl ||
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
            rating: order.store_avg_rating || 5,
            serviceType: getServiceTypeDisplay(service?.service_type || ''),
            weight:
              totalWeight.toString() || service?.estimated_weight_or_qty || '0',
            price: Math.round(parseFloat(order.total_amount || 0)).toString(),
            orderDate: formatOrderDate(order.created_at),
            orderStatus: order.status || 'Pending',
            fullOrderData: order
          }
        })

        if (isLoadMore) {
          setOrderData(prev => {
            const existingIds = new Set(prev.map(item => item.id))
            const newOrders = transformedOrders.filter(
              (order: any) => !existingIds.has(order.id)
            )
            console.log(`✅ Added ${newOrders.length} new orders`)
            return [...prev, ...newOrders]
          })
        } else {
          setOrderData(transformedOrders)
        }

        setHasMore(response.data.length === 10)
        console.log(
          `📄 Page ${pageNumber} loaded. Has more: ${
            response.data.length === 10
          }`
        )
      } else {
        if (!isLoadMore) {
          setOrderData([])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error)
      if (!isLoadMore) {
        setError('Failed to load orders. Please try again.')
        setOrderData([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (userData?.id) {
      setPage(1)
      fetchOrders(1, false)
    }
  }, [userData?.id])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      console.log(`🔄 Loading next page: ${page + 1}`)
      const nextPage = page + 1
      setPage(nextPage)
      fetchOrders(nextPage, true)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    console.log('🚫 Cancel order:', orderId)
    // TODO: Implement cancel order API call
    alert(`Cancel functionality for order ${orderId}`)
  }

  // Updated handleTrackOrder function with navigation
  const handleTrackOrder = (orderId: string, orderData?: any) => {
    console.log('📍 Track order:', orderId)
    console.log('📋 Order details:', orderData)

    // Navigate to order screen with orderId parameter
    router.push({
      pathname: './(order)/order-tracking',
      params: {
        orderId: orderData?.id || orderId // Use the actual order ID from the API
      }
    })
  }

  const renderOrderCard = ({ item }: { item: OrderCardProps }) => (
    <OrderCard
      orderId={item.orderId}
      laundryName={item.laundryName}
      laundryImage={item.laundryImage}
      rating={item.rating}
      serviceType={item.serviceType}
      weight={item.weight}
      price={item.price}
      orderDate={item.orderDate}
      orderStatus={item.orderStatus}
      onCancel={() => handleCancelOrder(item.orderId)}
      onTrack={() => handleTrackOrder(item.orderId, item.fullOrderData)}
    />
  )

  const styles = createStyles(colors)

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={styles.loadMoreText}>Loading more orders...</Text>
        </View>
      )
    }

    if (!hasMore && orderData.length > 0) {
      return (
        <View style={styles.noMoreContainer}>
          <Text style={styles.noMoreText}>No more orders to load</Text>
        </View>
      )
    }

    return null
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>
        Order <Text style={styles.titleAccent}>History</Text>
      </Text>
      <View style={styles.underline} />
    </View>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No orders found</Text>
      <Text style={styles.emptySubtext}>
        Your order history will appear here once you place your first order.
      </Text>
    </View>
  )

  if (loading && orderData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={orderData}
        renderItem={renderOrderCard}
        keyExtractor={item => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          orderData.length === 0
            ? styles.emptyContentContainer
            : styles.contentContainer
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </SafeAreaView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    headerContainer: {
      paddingHorizontal: 16,
      paddingTop: 15,
      paddingBottom: 10
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      includeFontPadding: false
    },
    titleAccent: {
      color: colors.primary
    },
    underline: {
      marginTop: 8,
      height: 3,
      width: '28%',
      backgroundColor: colors.primary,
      borderRadius: 2
    },
    contentContainer: {
      paddingBottom: 20
    },
    emptyContentContainer: {
      flexGrow: 1,
      paddingHorizontal: 20
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      includeFontPadding: false,
      paddingHorizontal: 10,
      lineHeight: 22,
      alignSelf: 'stretch'
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 50
    },
    errorText: {
      fontSize: 16,
      color: colors.notification,
      textAlign: 'center',
      includeFontPadding: false,
      paddingHorizontal: 10,
      lineHeight: 22,
      alignSelf: 'stretch'
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 100
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
      includeFontPadding: false,
      paddingHorizontal: 10,
      alignSelf: 'stretch'
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      includeFontPadding: false,
      paddingHorizontal: 10,
      alignSelf: 'stretch'
    },
    loadMoreContainer: {
      width: '100%',
      paddingVertical: 20,
      alignItems: 'center',
      paddingHorizontal: 20
    },
    loadMoreText: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      includeFontPadding: false
    },
    noMoreContainer: {
      width: '100%',
      paddingVertical: 20,
      alignItems: 'center',
      paddingHorizontal: 20
    },
    noMoreText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      includeFontPadding: false
    }
  })
