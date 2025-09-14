// components/LogoutModal.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { LogOut } from 'lucide-react-native'
import React from 'react'
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

interface LogoutModalProps {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

const { width } = Dimensions.get('window')

export default function LogoutModal ({
  visible,
  onConfirm,
  onCancel
}: LogoutModalProps) {
  const colors = useThemeColors()

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <LogOut size={32} color={colors.notification} strokeWidth={1.5} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Confirm Logout
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Are you sure you want to logout? You'll need to login again to
            access your account.
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: colors.notification }
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  container: {
    width: Math.min(width - 40, 400),
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    borderWidth: 1
  },
  confirmButton: {
    // backgroundColor applied inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
})
