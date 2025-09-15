// app/(tabs)/(home)/order/_layout.tsx
import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

export default function OrderLayout () {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right'
      }}
      initialRouteName='index'
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Settings',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='notification'
        options={{
          title: 'Notifications'
          // headerShown: true
        }}
      />
    </Stack>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20
  },
  stickyHeader: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  stackContainer: {
    flex: 1,
    minHeight: 600 // Ensure minimum height for proper scrolling
  }
})
