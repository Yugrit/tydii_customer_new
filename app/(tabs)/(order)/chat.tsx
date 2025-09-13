import { useThemeColors } from '@/hooks/useThemeColor'
import ApiService from '@/services/ApiService'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

interface Message {
  id: string
  text: string
  timestamp: Date
  isCurrentUser: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  messageType?: 'text' | 'weight_mismatch'
  relatedMismatch?: any
  order?: any
}

interface ApiMessage {
  id: number
  senderRole: 'customer' | 'delivery' | 'store'
  message: string
  messageType: 'text' | 'weight_mismatch'
  createdAt: string
  relatedMismatch?: any
  order?: any
}

export default function ChatScreen () {
  const router = useRouter()
  const colors = useThemeColors()
  const { id, type } = useLocalSearchParams()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMismatch, setSelectedMismatch] = useState<any>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const pollingIntervalRef = useRef<any | null>(null)

  // Handle pay now for mismatch
  const handlePayNow = (mismatch: any) => {
    console.log('💳 Pay Now pressed for mismatch:', mismatch)
    setSelectedMismatch(mismatch)
    setShowPaymentModal(true)
  }

  // Handle proceed to pay
  const handleProceedToPay = async () => {
    if (!selectedMismatch) return

    setProcessingPayment(true)

    try {
      console.log('🔄 Processing payment for mismatch:', selectedMismatch.id)

      const response = await ApiService.patch({
        url: `/customer/chat/mismatch/${selectedMismatch.id}/decision`,
        data: {
          decision: 'accepted'
        }
      })

      console.log('✅ Payment response:', response)

      if (response?.checkoutUrl) {
        // Close modal
        setShowPaymentModal(false)
        setSelectedMismatch(null)

        // Open checkout URL
        console.log('🌐 Opening checkout URL:', response.checkoutUrl)
        await Linking.openURL(response.checkoutUrl)

        // Refresh messages to get updated mismatch status
        setTimeout(() => {
          fetchMessages()
        }, 1000)
      } else {
        Alert.alert('Error', 'Unable to proceed to payment. Please try again.')
      }
    } catch (error) {
      console.error('❌ Failed to process payment:', error)
      Alert.alert('Error', 'Failed to process payment. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Render payment modal
  const renderPaymentModal = () => {
    if (!selectedMismatch) return null

    const styles = createStyles(colors)

    return (
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Proceed to Payment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Ionicons name='close' size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                You will be redirected to a secure payment page to pay the
                additional charge.
              </Text>

              <View style={styles.chargeDetails}>
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeLabel}>Additional Charge:</Text>
                  <Text style={styles.chargeAmount}>
                    ${parseFloat(selectedMismatch.additionalCharge).toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.chargeReason}>
                  {selectedMismatch.message}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPaymentModal(false)}
                disabled={processingPayment}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  processingPayment && styles.proceedButtonDisabled
                ]}
                onPress={handleProceedToPay}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <ActivityIndicator size={16} color={colors.background} />
                ) : (
                  <Text style={styles.proceedButtonText}>Proceed</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  // Render mismatch content
  const renderMismatchContent = (item: Message) => {
    const mismatch = item.relatedMismatch
    if (!mismatch) return null

    const styles = createStyles(colors)

    return (
      <View style={styles.mismatchContainer}>
        <View style={styles.mismatchHeader}>
          <Ionicons name='alert-circle' size={18} color={colors.primary} />
          <Text style={styles.mismatchTitle}>Order Mismatch</Text>
        </View>

        <View style={styles.mismatchDetails}>
          <View style={styles.mismatchRow}>
            <Text style={styles.mismatchLabel}>Expected:</Text>
            <Text style={styles.mismatchValue}>
              {mismatch.expectedValue} lbs
            </Text>
          </View>
          <View style={styles.mismatchRow}>
            <Text style={styles.mismatchLabel}>Actual:</Text>
            <Text style={styles.mismatchValue}>{mismatch.actualValue} lbs</Text>
          </View>
          <View style={styles.mismatchRow}>
            <Text style={styles.mismatchLabel}>Extra Charge:</Text>
            <Text style={styles.mismatchValueHighlight}>
              ${parseFloat(mismatch.additionalCharge).toFixed(2)}
            </Text>
          </View>
        </View>

        {mismatch.message && (
          <Text style={styles.mismatchMessage}>{mismatch.message}</Text>
        )}

        {(mismatch.decision === 'pending' ||
          mismatch.decision === 'accepted') && (
          <TouchableOpacity
            style={styles.payNowButton}
            onPress={() => handlePayNow(mismatch)}
          >
            <Text style={styles.payNowButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      console.log('🔄 Fetching messages for:', { id, type })

      let response
      if (type === 'driver') {
        // For driver chat, use pickupId
        response = await ApiService.get({
          url: '/customer/chat/messages',
          params: {
            pickupId: id
          }
        })
      } else {
        // For store chat, use orderId
        response = await ApiService.get({
          url: '/customer/chat/messages',
          params: {
            orderId: id
          }
        })
      }

      console.log('📋 Messages API Response:', response)

      if (response && Array.isArray(response)) {
        // Transform API messages to component format
        const transformedMessages: Message[] = response.map(
          (apiMessage: ApiMessage) => ({
            id: apiMessage.id.toString(),
            text: apiMessage.message,
            timestamp: new Date(apiMessage.createdAt),
            isCurrentUser: apiMessage.senderRole === 'customer',
            status:
              apiMessage.senderRole === 'customer' ? 'delivered' : undefined,
            messageType: apiMessage.messageType || 'text',
            relatedMismatch: apiMessage.relatedMismatch,
            order: apiMessage.order
          })
        )

        // Sort messages by timestamp (oldest first)
        transformedMessages.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        )

        // Check if we have new messages by comparing lengths or content
        setMessages(prev => {
          // Only update if messages have changed
          if (
            prev.length !== transformedMessages.length ||
            JSON.stringify(prev) !== JSON.stringify(transformedMessages)
          ) {
            console.log('📬 Messages updated:', transformedMessages.length)
            return transformedMessages
          }
          return prev
        })
      }
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error)
      // Don't clear messages on polling errors, just log them
    }
  }

  // Initial fetch and polling setup
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true)
      await fetchMessages()
      setLoading(false)

      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages()
      }, 2000)
    }

    if (id) {
      initializeChat()
    }

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [id, type])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length])

  // Get chat title based on type
  const getChatTitle = () => {
    switch (type) {
      case 'store':
        return 'Chat with Store'
      case 'driver':
        return 'Chat with Driver'
      default:
        return 'Chat'
    }
  }

  // Get status icon color
  const getStatusIconColor = (status?: string) => {
    switch (status) {
      case 'sending':
        return colors.textSecondary
      case 'sent':
        return colors.textSecondary
      case 'delivered':
        return colors.primary
      case 'read':
        return '#10b981'
      default:
        return colors.textSecondary
    }
  }

  // Send message function with API integration
  const sendMessage = async () => {
    if (inputText.trim() && !sending) {
      const messageText = inputText.trim()
      const tempId = Date.now().toString()

      // Create temporary message for UI
      const newMessage: Message = {
        id: tempId,
        text: messageText,
        timestamp: new Date(),
        isCurrentUser: true,
        status: 'sending',
        messageType: 'text'
      }

      // Add message to UI immediately
      setMessages(prev => [...prev, newMessage])
      setInputText('')
      setSending(true)

      try {
        console.log('📤 Sending message:', { messageText, id, type })

        // Prepare API payload with fixed values
        const payload: any = {
          senderRole: 'customer',
          messageType: 'text',
          message: messageText
        }

        // Add pickupId or orderId based on chat type
        if (type === 'driver') {
          payload.pickupId = parseInt(id as string)
        } else if (type === 'store') {
          payload.orderId = parseInt(id as string)
        }

        console.log('📤 API Payload:', payload)

        // Send message to API
        const response = await ApiService.post({
          url: '/customer/chat/message',
          data: payload
        })

        console.log('✅ Message sent successfully:', response)

        // Update message status to sent and remove temp message
        // The real message will be fetched from polling
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? {
                  ...msg,
                  status: 'sent'
                }
              : msg
          )
        )

        // Force fetch latest messages after sending
        setTimeout(() => {
          fetchMessages()
        }, 500)
      } catch (error) {
        console.error('❌ Failed to send message:', error)

        // Update message status to failed/error
        setMessages(prev =>
          prev.map(
            msg => (msg.id === tempId ? { ...msg, status: 'sending' } : msg) // Keep as sending to indicate error
          )
        )

        // Optionally show error message to user
        // Alert.alert('Error', 'Failed to send message. Please try again.')
      } finally {
        setSending(false)
      }

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }

  // Handle submit editing (Enter key)
  const handleSubmitEditing = () => {
    sendMessage()
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const styles = createStyles(colors)

    return (
      <View
        style={[
          styles.messageContainer,
          item.isCurrentUser
            ? styles.currentUserMessage
            : styles.otherUserMessage
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isCurrentUser
              ? styles.currentUserBubble
              : styles.otherUserBubble
          ]}
        >
          <View style={{ width: '100%' }}>
            {item.messageType === 'weight_mismatch' ? (
              renderMismatchContent(item)
            ) : (
              <Text
                style={[
                  styles.messageText,
                  item.isCurrentUser
                    ? styles.currentUserText
                    : styles.otherUserText
                ]}
              >
                {item.text}
              </Text>
            )}
          </View>

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                item.isCurrentUser
                  ? styles.currentUserTimestamp
                  : styles.otherUserTimestamp
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>

            {item.isCurrentUser && item.status && (
              <Ionicons
                name={
                  item.status === 'sending'
                    ? 'time-outline'
                    : item.status === 'sent'
                    ? 'checkmark'
                    : item.status === 'delivered'
                    ? 'checkmark-done'
                    : 'checkmark-done'
                }
                size={14}
                color={getStatusIconColor(item.status)}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    )
  }

  const styles = createStyles(colors)

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name='chevron-back' size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{getChatTitle()}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name='chevron-back' size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{getChatTitle()}</Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder='Type a message...'
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType='send'
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
              multiline={false}
              maxLength={1000}
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && !sending
                ? styles.sendButtonActive
                : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size={16} color={colors.background} />
            ) : (
              <Ionicons name='send' size={20} color={colors.background} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Payment Modal */}
      {renderPaymentModal()}
    </View>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    keyboardView: {
      flex: 1
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary
    },
    // Header Styles
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      elevation: 2,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2
    },
    backButton: {
      padding: 4,
      marginRight: 8
    },
    headerInfo: {
      flex: 1
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2
    },
    // Messages List Styles
    messagesList: {
      flex: 1
    },
    messagesContent: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexGrow: 1
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 12,
      maxWidth: '70%',
      alignSelf: 'flex-start'
    },
    currentUserMessage: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse'
    },
    otherUserMessage: {
      alignSelf: 'flex-start'
    },
    messageBubble: {
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flex: 1,
      minWidth: 80
    },
    currentUserBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 6
    },
    otherUserBubble: {
      backgroundColor: colors.background,
      borderBottomLeftRadius: 6,
      borderWidth: 1,
      borderColor: colors.border
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
      marginBottom: 4,
      textAlign: 'left',
      includeFontPadding: false
    },
    currentUserText: {
      color: colors.background
    },
    otherUserText: {
      color: colors.text
    },
    messageFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 2
    },
    timestamp: {
      fontSize: 11,
      fontWeight: '500'
    },
    currentUserTimestamp: {
      color: colors.background + 'B3' // 70% opacity
    },
    otherUserTimestamp: {
      color: colors.textSecondary
    },
    statusIcon: {
      marginLeft: 4
    },
    // Mismatch Styles
    mismatchContainer: {
      width: '100%'
    },
    mismatchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
    },
    mismatchTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 6
    },
    mismatchDetails: {
      marginBottom: 12
    },
    mismatchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    },
    mismatchLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500'
    },
    mismatchValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600'
    },
    mismatchValueHighlight: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '700'
    },
    mismatchMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 18
    },
    payNowButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
      alignSelf: 'flex-start'
    },
    payNowButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600'
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      width: '100%',
      maxWidth: 400,
      elevation: 10,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text
    },
    closeButton: {
      padding: 4
    },
    modalContent: {
      paddingHorizontal: 20,
      paddingVertical: 20
    },
    modalText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 20
    },
    chargeDetails: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    chargeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    },
    chargeLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500'
    },
    chargeAmount: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: '700'
    },
    chargeReason: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4
    },
    modalActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 12
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center'
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600'
    },
    proceedButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center'
    },
    proceedButtonDisabled: {
      backgroundColor: colors.textSecondary
    },
    proceedButtonText: {
      fontSize: 16,
      color: colors.background,
      fontWeight: '600'
    },
    // Input Area Styles
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: Platform.OS === 'ios' ? 34 : 12,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    textInputContainer: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 8,
      minHeight: 44
    },
    textInput: {
      fontSize: 16,
      color: colors.text,
      minHeight: 20
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center'
    },
    sendButtonActive: {
      backgroundColor: colors.primary
    },
    sendButtonInactive: {
      backgroundColor: colors.textSecondary
    }
  })
