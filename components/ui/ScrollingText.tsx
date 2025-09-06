// components/ScrollingTags.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native'

const { width } = Dimensions.get('window')

interface ScrollingTagsProps {
  tags: string[]
  colors: any
}

export default function ScrollingTags ({ tags, colors }: ScrollingTagsProps) {
  const animatedValue = useRef(new Animated.Value(0)).current
  const scrollWidth = tags.length * 80 // Approximate width per tag

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: -scrollWidth,
        duration: 10000, // 10 seconds for one complete loop
        useNativeDriver: true,
        isInteraction: false
      })
    )
    animation.start()

    return () => animation.stop()
  }, [scrollWidth])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { transform: [{ translateX: animatedValue }] }]}
      >
        {/* First set of tags */}
        {tags.map((tag, idx) => (
          <View
            key={`tag-${idx}`}
            style={[styles.tag, { borderColor: colors.border }]}
          >
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>
              {tag}
            </Text>
          </View>
        ))}

        {/* Duplicate tags for seamless infinite scroll */}
        {tags.map((tag, idx) => (
          <View
            key={`tag-dup-${idx}`}
            style={[styles.tag, { borderColor: colors.border }]}
          >
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>
              {tag}
            </Text>
          </View>
        ))}

        {/* Triple for extra smooth loop */}
        {tags.map((tag, idx) => (
          <View
            key={`tag-triple-${idx}`}
            style={[styles.tag, { borderColor: colors.border }]}
          >
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>
              {tag}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 32, // Fixed height for single line
    overflow: 'hidden'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'transparent'
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500'
  }
})
