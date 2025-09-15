// app/auth/otp-verification.tsx
import { AuthApiService } from '@/services/AuthApi'
import { storeData_MMKV } from '@/services/StorageService'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import Loader from '../../components/ui/Loader' // ✅ Import Loader component
import { userLoginState } from '../../Redux/slices/userSlices'

export default function OtpVerification () {
  const dispatch = useDispatch()
  const { email, phone, mode } = useLocalSearchParams()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs: any = useRef([])
  const [timer, setTimer] = useState(30)
  const [resendEnabled, setResendEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const displayValue = email || phone
  const verificationType = mode || (email ? 'email' : 'phone')

  useEffect(() => {
    let interval: any = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    } else {
      setResendEnabled(true)
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [timer])

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)

    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === 'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleVerify = async () => {
    const enteredOtp = otp.join('')
    const isOtpValid =
      enteredOtp.length === 6 && otp.every(digit => digit !== '')

    if (!isOtpValid) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits.')
      return
    }

    setLoading(true)

    try {
      // ✅ Call AuthApiService.verifyOtp
      const payload = email
        ? { email: email as string, otp: enteredOtp }
        : { mobileNumber: phone as string, otp: enteredOtp }

      console.log('Verifying OTP with payload:', payload)
      const response = await AuthApiService.verifyOtp(payload)
      console.log(response)
      console.log('OTP Verification Response:', response)

      const { token, refreshToken } = response
      console.log(response)
      const userApprovalStatus: any = 'approved' // Replace with actual status from response if available

      if (token) {
        // ✅ Update Redux state
        dispatch(
          userLoginState({
            token,
            isApproved: true
          })
        )

        // ✅ Save to MMKV

        storeData_MMKV('user-token', token)
        storeData_MMKV('refresh-token', refreshToken)
        storeData_MMKV('sub', response?.payload?.sub)

        console.log('✅ User data saved to Redux and MMKV')

        // ✅ Handle different approval statuses
        if (
          userApprovalStatus === 'inprocess' ||
          userApprovalStatus === 'pending'
        ) {
          Alert.alert('Info', 'Your account is still being processed.', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') }
          ])
        } else if (userApprovalStatus === 'approved') {
          Alert.alert(
            'Welcome!',
            'Your account has been verified successfully.',
            [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
          )
        } else {
          // Default case - just navigate to tabs
          router.replace('/(tabs)')
        }
      } else {
        Alert.alert('Error', 'Invalid response from server. Please try again.')
      }
    } catch (err: any) {
      console.error('OTP Verification Failed:', err)

      // ✅ Enhanced error handling
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'OTP verification failed. Please check your code and try again.'

      Alert.alert('Verification Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!resendEnabled) return

    setLoading(true)
    try {
      // ✅ Call AuthApiService.requestOtp again
      const payload = email
        ? { email: email as string }
        : { mobileNumber: phone as string }

      console.log('Resending OTP with payload:', payload)
      const response = await AuthApiService.requestOtp(payload)

      Alert.alert('Success', response.message || 'OTP resent successfully')
      setTimer(30)
      setResendEnabled(false)

      // Clear current OTP
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      console.error('Resend OTP failed:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to resend OTP. Please try again.'
      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Show Loader component during verification
  if (loading) {
    return (
      <Loader
        message='Verifying OTP...'
        subMessage='Please wait while we authenticate you'
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name='arrow-back' size={24} color='#3587B8' />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Account Verification</Text>
        </View>

        <Ionicons
          name='lock-closed-outline'
          size={36}
          color='#3587B8'
          style={styles.lockIcon}
        />

        <Text style={styles.boldSubTitle}>Verify your account</Text>
        <Text style={styles.subTitle}>
          {`We've sent a 6-digit code to your ${verificationType}. Enter the code below to verify your account.`}
        </Text>

        <Text style={styles.contactInfo}>{displayValue}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref
              }}
              style={styles.otpBox}
              keyboardType='number-pad'
              maxLength={1}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          style={styles.verifyButton}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={!resendEnabled || loading}
        >
          <Text
            style={[
              styles.resendTitle,
              (!resendEnabled || loading) && { color: '#999' }
            ]}
          >
            {resendEnabled && !loading
              ? 'Resend Code'
              : `Resend in ${timer < 10 ? `0${timer}` : timer} sec`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          💡 Having trouble? Make sure you entered the correct email/phone
          number
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FDFF'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10
  },
  backButtonText: {
    color: '#3587B8',
    fontSize: 16,
    marginLeft: 5
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center'
  },
  lockIcon: {
    marginBottom: 20
  },
  boldSubTitle: {
    fontSize: 22,
    marginVertical: 10,
    fontWeight: '500',
    textAlign: 'center'
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
    lineHeight: 20
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3587B8',
    marginBottom: 30
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 40
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#aaa',
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
    padding: 0
  },
  verifyButton: {
    backgroundColor: '#3587B8',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: 10
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  resendTitle: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: '#3587B8',
    textDecorationLine: 'underline'
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic'
  }
})
