// components/ScrollingText.tsx
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

interface ScrollingTagsProps {
  tags: string[]
  colors: any
}

export default function ScrollingTags ({ tags, colors }: ScrollingTagsProps) {
  // Don't render anything if no tags
  if (!tags || tags.length === 0) {
    return null
  }

  // If 2 or fewer tags, don't show scroller - just display normally
  if (tags.length <= 2) {
    return (
      <View style={styles.simpleTagsContainer}>
        {tags.map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { borderColor: colors.border }]}
          >
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  // More than 2 tags - show horizontal scroller
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tagsContainer}
      contentContainerStyle={styles.tagsContent}
    >
      {tags.map((tag, index) => (
        <View key={index} style={[styles.tag, { borderColor: colors.border }]}>
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>
            {tag}
          </Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  simpleTagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8
  },
  tagsContainer: {
    marginBottom: 12
  },
  tagsContent: {
    paddingHorizontal: 8
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 4
  },
  tagText: {
    fontSize: 12,
    fontWeight: '400'
  }
})
