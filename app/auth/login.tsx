// app/auth/login.tsx
import { AuthApiService } from '@/services/AuthApi'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'

const DEFAULT_COUNTRY_CODE = '+91'

export default function LoginScreen () {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handleGenerateOtp = async () => {
    if (loading) return

    if (mode === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email.trim()) {
        Alert.alert('Error', 'Please enter your email')
        return
      }
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address')
        return
      }

      setLoading(true)
      try {
        // ✅ Use AuthApiService.requestOtp
        const response = await AuthApiService.requestOtp({
          email: email.trim()
        })

        console.log('OTP Request Response:', response)

        Alert.alert(
          'Success',
          response.message || 'OTP sent successfully to your email'
        )
        router.push({
          pathname: './otp-verification',
          params: { email: email.trim(), mode: 'email' }
        })
      } catch (err: any) {
        console.error('OTP Request Failed:', err)

        // Handle different error response structures
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to send OTP. Please try again.'

        Alert.alert('Error', errorMessage)
      } finally {
        setLoading(false)
      }
    } else {
      const phoneDigits = phone.replace(/\D/g, '')
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneDigits) {
        Alert.alert('Error', 'Please enter your mobile number')
        return
      }
      if (!phoneRegex.test(phoneDigits)) {
        Alert.alert('Error', 'Please enter a valid 10-digit mobile number')
        return
      }

      setLoading(true)
      try {
        const internationalNumber = `${DEFAULT_COUNTRY_CODE}${phoneDigits}`

        // ✅ Use AuthApiService.requestOtp
        const response = await AuthApiService.requestOtp({
          mobileNumber: internationalNumber
        })

        console.log('OTP Request Response:', response)

        Alert.alert(
          'Success',
          response.message || 'OTP sent successfully to your phone'
        )
        router.push({
          pathname: './otp-verification',
          params: { phone: internationalNumber, mode: 'phone' }
        })
      } catch (err: any) {
        console.error('OTP Request Failed:', err)

        // Handle different error response structures
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to send OTP. Please try again.'

        Alert.alert('Error', errorMessage)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <View style={styles.safeArea}>
      <ImageBackground
        source={{
          uri: 'https://via.placeholder.com/400x600/4A90E2/FFFFFF?text=Delivery'
        }}
        style={styles.bg}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>
            {mode === 'email' ? 'Enter your Email' : 'Enter your Mobile Number'}
          </Text>
          <Text style={styles.description}>
            We will send you a 6-digit verification code
          </Text>

          <View style={styles.inputContainer}>
            {mode === 'email' ? (
              <>
                <Ionicons
                  name='mail-outline'
                  size={20}
                  color='#666'
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder='abc@gmail.com'
                  style={[styles.input, { color: 'black' }]}
                  keyboardType='email-address'
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize='none'
                  autoCorrect={false}
                />
              </>
            ) : (
              <View style={styles.flagInputRow}>
                <View style={styles.flagBtn}>
                  <Text style={styles.countryCodeTxt}>
                    {DEFAULT_COUNTRY_CODE}
                  </Text>
                </View>
                <TextInput
                  placeholder='Mobile Number'
                  style={styles.mobileInput}
                  keyboardType='number-pad'
                  value={phone}
                  onChangeText={v => setPhone(v.replace(/\D/g, ''))}
                  maxLength={10}
                  autoCapitalize='none'
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleGenerateOtp}
            style={styles.otpButton}
            disabled={loading}
          >
            <Text style={styles.otpButtonText}>
              {loading ? 'Sending OTP...' : 'Generate OTP'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[
                styles.socialIcon,
                mode === 'email' && styles.selectedSocialIcon
              ]}
              onPress={() => setMode('email')}
              activeOpacity={0.8}
            >
              <Ionicons name='mail-outline' size={24} color='#3587B8' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name='logo-apple' size={24} color='#000' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name='logo-google' size={24} color='#EA4335' />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialIcon,
                mode === 'phone' && styles.selectedSocialIcon
              ]}
              onPress={() => setMode('phone')}
              activeOpacity={0.8}
            >
              <Ionicons name='call-outline' size={24} color='#3587B8' />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* ✅ Enhanced Full-screen Loader */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size='large' color='#3587B8' />
          <Text style={styles.loaderText}>Sending OTP...</Text>
          <Text style={styles.loaderSubText}>Please wait a moment</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  bg: { flex: 1, justifyContent: 'flex-end' },
  card: {
    backgroundColor: '#F9FDFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3587B8',
    marginBottom: 16
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 20,
    color: '#333'
  },
  description: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50
  },
  inputIcon: {
    marginRight: 8
  },
  flagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 8,
    minWidth: 68,
    justifyContent: 'center'
  },
  countryCodeTxt: {
    fontSize: 18,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500'
  },
  mobileInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    minWidth: 100,
    paddingLeft: 0
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    paddingLeft: 8
  },
  otpButton: {
    backgroundColor: '#3587B8',
    paddingVertical: 14,
    borderRadius: 50,
    marginBottom: 10
  },
  otpButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 30
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8
  },
  selectedSocialIcon: {
    borderWidth: 2,
    borderColor: '#3587B8',
    backgroundColor: '#fff'
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    width: '100%'
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc'
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontWeight: 'bold'
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  // ✅ Enhanced loader text styles
  loaderText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#3587B8',
    textAlign: 'center'
  },
  loaderSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
})
