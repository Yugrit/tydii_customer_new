// components/feedback/FeedbackModal.tsx
import { Star } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

interface FeedbackModalProps {
  visible: boolean
  onClose: () => void
  targetName: string // Store name or driver name
  targetType: 'store' | 'driver'
  onSubmit: (rating: number, comment: string) => Promise<void>
}

export default function FeedbackModal ({
  visible,
  onClose,
  targetName,
  targetType,
  onSubmit
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setSubmitting(true)
    try {
      await onSubmit(rating, comment)
      // Reset form
      setRating(0)
      setComment('')
      onClose()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Star
            size={32}
            color={i <= rating ? '#FFD700' : '#e0e0e0'}
            fill={i <= rating ? '#FFD700' : 'transparent'}
          />
        </TouchableOpacity>
      )
    }
    return stars
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Rate {targetType === 'store' ? 'Store' : 'Driver'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.targetName}>{targetName}</Text>

            <Text style={styles.ratingLabel}>How was your experience?</Text>

            <View style={styles.starsContainer}>{renderStars()}</View>

            <TextInput
              style={styles.commentInput}
              placeholder='Add a comment (optional)'
              placeholderTextColor='#999'
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical='top'
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator size={16} color='#ffffff' />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333'
  },
  closeButton: {
    padding: 4
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: '300'
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  targetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20
  },
  ratingLabel: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    height: 100,
    backgroundColor: '#f8f9fa'
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
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600'
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#02537F',
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8'
  },
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600'
  }
})
