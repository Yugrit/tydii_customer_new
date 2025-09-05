// components/StoreCard.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { ArrowRight, Heart } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface LaundryStore {
  id: string
  title: string
  image: any
  rating: number
  time: string
  description: string
  tags: string[]
  isNew: boolean
  isFavorite: boolean
}

interface StoreCardProps {
  item: LaundryStore
  cardWidth: number
  onPress?: (item: LaundryStore) => void
  onFavoritePress?: (item: LaundryStore) => void
}

export default function StoreCard ({
  item,
  cardWidth,
  onPress,
  onFavoritePress
}: StoreCardProps) {
  const colors = useThemeColors()
  const styles = useMemo(
    () => createStyles(colors, cardWidth),
    [colors, cardWidth]
  )

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          ⭐
        </Text>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Text key='half' style={styles.star}>
          ⭐
        </Text>
      )
    }

    return stars
  }

  const handleOrderPress = () => {
    onPress?.(item)
  }

  const handleFavoritePress = () => {
    onFavoritePress?.(item)
  }

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.cardImage} />

        {/* Badges and Icons */}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Heart
            size={20}
            color={item.isFavorite ? '#FF4757' : 'white'}
            fill={item.isFavorite ? '#FF4757' : 'transparent'}
          />
        </TouchableOpacity>

        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>TYDII</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>

        <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.orderButton} onPress={handleOrderPress}>
          <Text style={styles.orderButtonText}>Order Now</Text>
          <ArrowRight
            size={16}
            color={colors.primary}
            strokeWidth={3}
            style={{
              backgroundColor: 'white',
              padding: 10,
              borderRadius: '50%'
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const createStyles = (colors: any, cardWidth: number) =>
  StyleSheet.create({
    card: {
      width: cardWidth,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 4,
        height: 4
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden'
    },
    imageContainer: {
      position: 'relative',
      height: 140
    },
    cardImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      borderRadius: 10
    },
    newBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: '#28a745',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6
    },
    newBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600'
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.light,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center'
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12
    },
    verifiedText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600'
    },
    cardContent: {
      paddingTop: 4
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      marginVertical: 6
    },
    ratingContainer: {
      flexDirection: 'row',
      marginBottom: 10
    },
    star: {
      fontSize: 14
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12
    },
    tag: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 6,
      marginBottom: 4
    },
    tagText: {
      fontSize: 10,
      color: colors.textSecondary
    },
    orderButton: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#02537F',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 16
    },
    orderButtonContent: {},
    orderButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginRight: 6
    }
  })
