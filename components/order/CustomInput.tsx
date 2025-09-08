// components/CustomInput.tsx
import { useThemeColors } from '@/hooks/useThemeColor'
import {
  Calendar,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  X
} from 'lucide-react-native'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Calendar as RNCalendar } from 'react-native-calendars'

const { width: screenWidth } = Dimensions.get('window')

interface CustomInputProps {
  label: string
  placeholder: string
  value?: string
  onChangeText?: (text: string) => void
  type?:
    | 'text'
    | 'email'
    | 'phone'
    | 'date'
    | 'time'
    | 'dropdown'
    | 'location'
    | 'textarea'
  dropdownData?: string[]
  multiline?: boolean
  required?: boolean
  onAddNew?: () => void
  disabled?: boolean
  error?: string
  disabledDates?: string[] // Array of dates to disable (format: 'YYYY-MM-DD')
}

export interface CustomInputRef {
  focus: () => void
}

const CustomInput = forwardRef<CustomInputRef, CustomInputProps>(
  (
    {
      label,
      placeholder,
      value = '',
      onChangeText,
      type = 'text',
      dropdownData = [],
      multiline = false,
      required = false,
      onAddNew,
      disabled = false,
      error,
      disabledDates = []
    },
    ref
  ) => {
    const colors = useThemeColors()
    const [inputValue, setInputValue] = useState(value)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [focused, setFocused] = useState(false)

    const textInputRef = useRef<TextInput>(null)

    const isDateTimeField = type === 'date' || type === 'time'
    const isDropdownField = type === 'dropdown' || type === 'location'

    useEffect(() => {
      setInputValue(value)
    }, [value])

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (isDateTimeField) {
          setShowDatePicker(true)
        } else if (isDropdownField) {
          setShowDropdown(true)
        } else if (textInputRef.current) {
          textInputRef.current.focus()
        }
      }
    }))

    const styles = useMemo(() => createStyles(colors), [colors])

    // Enhanced date confirmation with disabled date check
    const handleDateConfirm = (dateString: string) => {
      // Check if selected date is disabled
      if (disabledDates.includes(dateString)) {
        console.log('Selected date is disabled:', dateString)
        return // Don't allow selection of disabled dates
      }

      setShowDatePicker(false)

      // Convert YYYY-MM-DD to MM/DD/YYYY
      const [year, month, day] = dateString.split('-')
      const formatted = `${month}/${day}/${year}`

      console.log('Date selected:', formatted)
      setInputValue(formatted)
      onChangeText?.(formatted)
    }

    const handleDropdownSelect = (item: string) => {
      setInputValue(item)
      onChangeText?.(item)
      setShowDropdown(false)
    }

    const handleTextChange = (text: string) => {
      setInputValue(text)
      onChangeText?.(text)
    }

    // Get marked dates including disabled dates
    const getMarkedDates = () => {
      let marked: any = {}

      // Mark disabled dates
      disabledDates.forEach(date => {
        marked[date] = {
          disabled: true,
          disableTouchEvent: true,
          dotColor: '#ff6b6b',
          textColor: '#cccccc',
          selectedColor: '#f0f0f0',
          selectedTextColor: '#999999'
        }
      })

      // Mark selected date if it exists and is not disabled
      if (inputValue) {
        try {
          const [month, day, year] = inputValue.split('/')
          const calendarDate = `${year}-${month.padStart(
            2,
            '0'
          )}-${day.padStart(2, '0')}`

          // Only mark as selected if not disabled
          if (!disabledDates.includes(calendarDate)) {
            marked[calendarDate] = {
              selected: true,
              selectedColor: '#008ECC',
              selectedTextColor: 'white'
            }
          }
        } catch {
          // Handle invalid date format
        }
      }

      return marked
    }

    const getIcon = () => {
      const iconColor = '#008ECC'
      const iconSize = 20

      switch (type) {
        case 'date':
          return <Calendar size={iconSize} color={iconColor} />
        case 'time':
          return <Clock size={iconSize} color={iconColor} />
        case 'location':
          return <MapPin size={iconSize} color={iconColor} />
        case 'dropdown':
          return <ChevronDown size={iconSize} color={iconColor} />
        case 'email':
          return <Mail size={iconSize} color={iconColor} />
        case 'phone':
          return <Phone size={iconSize} color={iconColor} />
        default:
          return <User size={iconSize} color={iconColor} />
      }
    }

    const getKeyboardType = () => {
      switch (type) {
        case 'email':
          return 'email-address'
        case 'phone':
          return 'phone-pad'
        default:
          return 'default'
      }
    }

    return (
      <View style={styles.container}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>

        {/* Input Container */}
        <TouchableOpacity
          onPress={() => {
            if (disabled) return

            if (isDateTimeField && !multiline) {
              setShowDatePicker(true)
            } else if (isDropdownField && !multiline) {
              console.log('Opening dropdown with data:', dropdownData)
              setShowDropdown(true)
            }
          }}
          activeOpacity={isDateTimeField || isDropdownField ? 0.8 : 1}
          style={[
            styles.inputContainer,
            focused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            disabled && styles.inputContainerDisabled
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              placeholder={disabled ? 'Please select date first' : placeholder}
              placeholderTextColor={disabled ? '#999' : colors.textSecondary}
              style={[
                styles.input,
                multiline && styles.inputMultiline,
                disabled && styles.inputDisabled
              ]}
              value={inputValue}
              onChangeText={handleTextChange}
              editable={!isDateTimeField && !isDropdownField && !disabled}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              keyboardType={getKeyboardType()}
              autoCapitalize={type === 'email' ? 'none' : 'sentences'}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />

            <View style={styles.iconContainer}>{getIcon()}</View>
          </View>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Beautiful Calendar Modal with Disabled Dates */}
        <Modal
          visible={showDatePicker && type === 'date'}
          transparent
          animationType='fade'
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.calendarContainer}>
                  {/* Calendar Header */}
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>Select Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Beautiful Calendar */}
                  <RNCalendar
                    onDayPress={day => handleDateConfirm(day.dateString)}
                    markedDates={getMarkedDates()}
                    minDate={new Date().toISOString().split('T')[0]} // Today onwards
                    theme={{
                      backgroundColor: colors.background,
                      calendarBackground: colors.background,
                      textSectionTitleColor: colors.textSecondary,
                      selectedDayBackgroundColor: '#008ECC',
                      selectedDayTextColor: 'white',
                      todayTextColor: '#008ECC',
                      dayTextColor: colors.text,
                      textDisabledColor: '#cccccc',
                      dotColor: '#ff6b6b',
                      selectedDotColor: 'white',
                      arrowColor: '#008ECC',
                      monthTextColor: colors.text,
                      indicatorColor: '#008ECC',
                      textDayFontFamily: 'System',
                      textMonthFontFamily: 'System',
                      textDayHeaderFontFamily: 'System',
                      textDayFontWeight: '400',
                      textMonthFontWeight: '600',
                      textDayHeaderFontWeight: '600',
                      textDayFontSize: 16,
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 14
                    }}
                    style={styles.calendar}
                  />

                  {/* Action Buttons */}
                  <View style={styles.calendarActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.todayButton,
                        disabledDates.includes(
                          new Date().toISOString().split('T')[0]
                        ) && styles.todayButtonDisabled
                      ]}
                      onPress={() => {
                        const today = new Date()
                        const todayString = today.toISOString().split('T')[0]
                        handleDateConfirm(todayString)
                      }}
                      disabled={disabledDates.includes(
                        new Date().toISOString().split('T')[0]
                      )}
                    >
                      <Text
                        style={[
                          styles.todayButtonText,
                          disabledDates.includes(
                            new Date().toISOString().split('T')[0]
                          ) && styles.todayButtonTextDisabled
                        ]}
                      >
                        Today
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Dropdown Modal - Same as before */}
        <Modal
          visible={showDropdown}
          transparent
          animationType='fade'
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.dropdownContainer}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownTitle}>Select {label}</Text>
                    <TouchableOpacity
                      onPress={() => setShowDropdown(false)}
                      style={styles.closeButton}
                    >
                      <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {dropdownData.length > 0 ? (
                    <FlatList
                      data={dropdownData}
                      keyExtractor={(item, index) => `${item}-${index}`}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            index === dropdownData.length - 1 &&
                              styles.dropdownItemLast
                          ]}
                          onPress={() => {
                            console.log('Selecting item:', item)
                            handleDropdownSelect(item)
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownItemText}>{item}</Text>
                          {inputValue === item && (
                            <View style={styles.selectedIndicator} />
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        {type === 'dropdown'
                          ? 'No time slots available'
                          : 'No options available'}
                      </Text>
                    </View>
                  )}

                  {type === 'location' && onAddNew && (
                    <>
                      <View style={styles.separator} />
                      <TouchableOpacity
                        style={styles.addLocationButton}
                        onPress={() => {
                          setShowDropdown(false)
                          onAddNew()
                        }}
                      >
                        <Plus size={20} color={colors.primary} />
                        <Text style={styles.addLocationText}>
                          Add New Location
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    )
  }
)

CustomInput.displayName = 'CustomInput'

// Updated styles with disabled date styling
const createStyles = (colors: any) =>
  StyleSheet.create({
    // ... all existing styles remain the same

    // Add these new styles for disabled dates:
    disabledInfo: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: '#fff3cd',
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    disabledInfoText: {
      fontSize: 12,
      color: '#856404',
      textAlign: 'center',
      fontWeight: '500'
    },
    todayButtonDisabled: {
      backgroundColor: '#cccccc',
      opacity: 0.6
    },
    todayButtonTextDisabled: {
      color: '#999999'
    },

    // ... all other existing styles remain unchanged
    container: {
      marginBottom: 20
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#242B33'
    },
    required: {
      color: 'red'
    },
    addNewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4
    },
    addNewText: {
      fontSize: 12,
      color: '#008ECC',
      fontWeight: '500',
      marginLeft: 4
    },
    inputContainer: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      minHeight: 52
    },
    inputContainerFocused: {
      borderColor: '#008ECC',
      backgroundColor: colors.background,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    inputContainerError: {
      borderColor: 'red'
    },
    inputContainerDisabled: {
      backgroundColor: '#F5F5F5',
      borderColor: '#E0E0E0',
      opacity: 0.8
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: '#242B33',
      fontWeight: '400'
    },
    inputMultiline: {
      height: 80,
      textAlignVertical: 'top',
      paddingTop: 12
    },
    inputDisabled: {
      color: '#999'
    },
    iconContainer: {
      marginLeft: 12,
      padding: 4
    },
    errorText: {
      fontSize: 12,
      color: 'red',
      marginTop: 4,
      marginLeft: 4
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    calendarContainer: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: screenWidth - 40,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    calendarTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text
    },
    calendar: {
      paddingHorizontal: 10,
      paddingVertical: 10
    },
    calendarActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    cancelButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.muted
    },
    cancelButtonText: {
      color: colors.mutedForeground,
      fontWeight: '600',
      fontSize: 16
    },
    todayButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: '#008ECC'
    },
    todayButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16
    },
    closeButton: {
      padding: 4
    },
    dropdownContainer: {
      backgroundColor: colors.background,
      borderRadius: 16,
      width: screenWidth - 40,
      maxHeight: 500,
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 8
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12
    },
    dropdownHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    dropdownTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    dropdownItemLast: {
      borderBottomWidth: 0
    },
    dropdownItemText: {
      fontSize: 16,
      color: colors.text,
      flex: 1
    },
    selectedIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#008ECC'
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyText: {
      fontSize: 14,
      color: '#999',
      textAlign: 'center'
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20
    },
    addLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      justifyContent: 'center'
    },
    addLocationText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '500',
      marginLeft: 8
    }
  })

export default CustomInput
