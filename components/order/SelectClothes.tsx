// components/order/forms/SelectClothesForm.tsx
import { ServiceTypeEnum } from '@/enums'
import { useThemeColors } from '@/hooks/useThemeColor'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import DrycleaningForm from './DryCleaningForm'
import OrderNavigationButtons from './OrderNavigationButtons'
import TailoringForm from './TailoringForm'
import WashFoldForm from './WashFoldForm'

interface SelectClothesFormProps {
  serviceType: ServiceTypeEnum
  onNext: () => void
  onPrev: () => void
}

interface FormData {
  [key: string]: any
}

export default function SelectClothesForm ({
  serviceType,
  onNext,
  onPrev
}: SelectClothesFormProps) {
  const dispatch = useDispatch()
  const colors = useThemeColors()

  const [formData, setFormData] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFormDataChange = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  const handleErrorsChange = (newErrors: Record<string, string>) => {
    setErrors(newErrors)
  }

  const handleNext = () => {
    if (Object.keys(errors).length === 0) {
      // Save form data to Redux
      // dispatch(updateOrderData({ clothesDetails: { serviceType, ...formData } }))
      console.log('Form Data:', { serviceType, ...formData })
      onNext()
    } else {
      console.log('Form has errors:', errors)
    }
  }

  const renderForm = () => {
    const commonProps = {
      formData,
      errors,
      onFormDataChange: handleFormDataChange,
      onErrorsChange: handleErrorsChange
    }

    switch (serviceType) {
      case ServiceTypeEnum.WASH_N_FOLD:
        return <WashFoldForm {...commonProps} />
      case ServiceTypeEnum.DRYCLEANING:
        return <DrycleaningForm {...commonProps} />
      case ServiceTypeEnum.TAILORING:
        return <TailoringForm {...commonProps} />
      default:
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Please select a service type
            </Text>
          </View>
        )
    }
  }

  const styles = createStyles(colors)

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formCard}>
        {/* Title stays here */}
        <Text style={styles.title}>
          Select <Text style={{ color: colors.primary }}>Clothes</Text>
        </Text>
        <View style={styles.divider} />

        {/* Only form content renders conditionally */}
        {renderForm()}
        <OrderNavigationButtons
          onPrevious={onPrev}
          onNext={handleNext}
          previousLabel='Previous'
          nextLabel='Next'
        />
      </View>
      {/* Navigation stays here */}
    </ScrollView>
  )
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.surface
    },
    contentContainer: {
      marginHorizontal: 15,
      paddingBottom: 20
    },
    formCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 20,
      elevation: 1,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      borderWidth: colors.background === '#000000' ? 1 : 0,
      borderColor: colors.border
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginHorizontal: 20,
      color: colors.text,
      marginBottom: 10
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 15
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  })
