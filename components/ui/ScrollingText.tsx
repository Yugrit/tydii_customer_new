// components/ScrollingTags.tsx
import React, { useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View
} from 'react-native'

interface ScrollingTagsProps {
  tags: string[]
  colors: any
}

const { width: screenWidth } = Dimensions.get('window')

export default function ScrollingTags ({ tags, colors }: ScrollingTagsProps) {
  const translateX = useRef(new Animated.Value(0)).current
  const [contentWidth, setContentWidth] = useState(0)

  if (!tags || tags.length === 0) {
    return null
  }

  // If 2 or fewer tags -> static
  if (tags.length <= 2) {
    return (
      <View style={styles.simpleTagsContainer}>
        {tags.map((tag, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              {
                borderColor: colors.border || '#e0e0e0',
                backgroundColor: colors.surface
              }
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: colors.textSecondary || '#666' }
              ]}
            >
              {tag}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  // Exactly 3 tags -> smooth infinite scroll
  if (tags.length === 3) {
    const repeatedTags = [...tags, ...tags] // clone

    // Start animation once we know the width
    if (contentWidth > 0) {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: -contentWidth / 2,
          duration: 8000, // adjust speed
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start()
    }

    return (
      <View style={styles.infiniteScrollContainer}>
        <View style={styles.scrollMask}>
          <Animated.View
            style={[styles.scrollingContent, { transform: [{ translateX }] }]}
            onLayout={e => setContentWidth(e.nativeEvent.layout.width)}
          >
            {repeatedTags.map((tag, index) => (
              <View
                key={`${tag}-${index}`}
                style={[
                  styles.scrollingTag,
                  {
                    borderColor: colors.border || '#e0e0e0',
                    backgroundColor: colors.surface
                  }
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: colors.textSecondary || '#666' }
                  ]}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Gradient fade effects for smooth edges */}
        <View style={[styles.leftFade, { backgroundColor: colors.surface }]} />
        <View style={[styles.rightFade, { backgroundColor: colors.surface }]} />
      </View>
    )
  }

  // More than 3 -> show first 3 + "+N"
  return (
    <View style={styles.multiTagsContainer}>
      {tags.slice(0, 3).map((tag, index) => (
        <View
          key={index}
          style={[
            styles.tag,
            {
              borderColor: colors.border || '#e0e0e0',
              backgroundColor: colors.surface
            }
          ]}
        >
          <Text
            style={[styles.tagText, { color: colors.textSecondary || '#666' }]}
          >
            {tag}
          </Text>
        </View>
      ))}
      {tags.length > 3 && (
        <View
          style={[
            styles.tag,
            {
              borderColor: colors.border || '#e0e0e0',
              backgroundColor: colors.surface
            }
          ]}
        >
          <Text
            style={[styles.tagText, { color: colors.textSecondary || '#666' }]}
          >
            +{tags.length - 3}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  simpleTagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8
  },
  multiTagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap'
  },
  infiniteScrollContainer: {
    height: 32,
    marginBottom: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative'
  },
  scrollMask: {
    overflow: 'hidden',
    width: '100%'
  },
  scrollingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%'
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4
  },
  scrollingTag: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 8,
    alignItems: 'center'
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center'
  },
  // Gradient fade effects
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 15,
    opacity: 0.8
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 15,
    opacity: 0.8
  }
})
