import { Info, PhoneCall } from 'lucide-react-native'
import React from 'react'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function HelpContact () {
  const phoneNumber = '+1-234-555-6789'

  const handlePhonePress = () => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Info size={20} color='#666' />
        <Text style={styles.text}>Need Help</Text>
      </View>

      <TouchableOpacity style={styles.rightSection} onPress={handlePhonePress}>
        <PhoneCall size={20} color='#666' />
        <Text style={styles.text}>{phoneNumber}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
    fontWeight: '400'
  }
})
