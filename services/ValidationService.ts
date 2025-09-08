export const parseDateFromMMDDYYYY = (dateString: string): Date | null => {
  if (!dateString) return null

  const parts = dateString.split('/')
  console.log(parts)
  if (parts.length !== 3) return null

  const month = parseInt(parts[0], 10)
  const day = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)

  // Validate basic ranges
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (year < 1900 || year > 2100) return null

  // Create date using Date constructor (month is 0-based)
  const date = new Date(year, month - 1, day)

  // Verify the date components match what we set
  // This catches invalid dates like 02/30/2023
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export const isFutureDate = (dateString: string): boolean => {
  const parsedDate = parseDateFromMMDDYYYY(dateString)
  if (!parsedDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsedDate.setHours(0, 0, 0, 0)

  return parsedDate >= today
}

// FIXED: Use the parsed date instead of creating new Date()
export const generateTimeSlots = (selectedDateStr: string): string[] => {
  console.log('Generating time slots for date:', selectedDateStr)
  if (!selectedDateStr || selectedDateStr.trim() === '') {
    return []
  }

  const slots: string[] = []

  try {
    // Parse the input date string
    const selectedDate = parseDateFromMMDDYYYY(selectedDateStr)
    if (!selectedDate) {
      console.log('Failed to parse date:', selectedDateStr)
      return []
    }

    const today = new Date()
    const selectedDateOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    )
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    const isToday = selectedDateOnly.getTime() === todayOnly.getTime()
    const currentHour = today.getHours()

    console.log('Is selected date today?', isToday)
    console.log('Current hour:', currentHour)

    const formatHour = (hour: number): string => {
      if (hour === 0) return '12:00 AM'
      if (hour < 12) return `${hour}:00 AM`
      if (hour === 12) return '12:00 PM'
      return `${hour - 12}:00 PM`
    }

    // Generate slots from 7 AM to 9 PM
    for (let hour = 7; hour < 21; hour++) {
      // If today, skip past hours. If future date, include all hours
      if (isToday && hour <= currentHour) {
        console.log(`Skipping past hour: ${hour}`)
        continue // Skip past hours for today only
      }

      const slotStart = formatHour(hour)
      const slotEnd = formatHour(hour + 1)
      slots.push(`${slotStart} - ${slotEnd}`)
    }

    console.log('Generated slots:', slots)
    return slots
  } catch (error) {
    console.error('Error generating time slots:', error)
    return []
  }
}
