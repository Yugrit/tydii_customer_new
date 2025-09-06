// components/StoreCard.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import { ArrowRight, BadgeCheck, Heart } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import ScrollingTags from './ScrollingText'

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
  preferred: boolean
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
            size={14}
            color={item.isFavorite ? '#FF4757' : 'white'}
            fill={item.isFavorite ? '#FF4757' : 'transparent'}
          />
        </TouchableOpacity>

        {item.preferred && (
          <View style={styles.verifiedBadge}>
            <BadgeCheck
              fill={'#1876A9'}
              stroke={'white'}
              size={15}
            ></BadgeCheck>
            <Text style={styles.verifiedText}>TYDII</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>

        <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>

        <ScrollingTags tags={item.tags} colors={colors} />

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
      width: 25,
      height: 25,
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
      backgroundColor: '#FFFFFF',
      opacity: 0.8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3
    },
    verifiedText: {
      color: 'black',
      fontSize: 8,
      letterSpacing: 1,
      fontWeight: '600'
    },
    cardContent: {
      paddingTop: 4
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      color: colors.primary,
      marginVertical: 6
    },
    ratingContainer: {
      marginHorizontal: 'auto',
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
