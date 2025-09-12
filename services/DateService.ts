export const formatDateToISO = (dateStr: string): string => {
  if (!dateStr) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  console.log('🔍 Original date string:', dateStr)

  // If date is already in YYYY-MM-DD format, return as-is
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log('✅ Already in ISO format:', dateStr)
    return dateStr
  }

  let date: Date

  // Handle MM/DD/YYYY format (most common from date pickers)
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const [month, day, year] = parts
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      throw new Error(`Invalid date format: ${dateStr}`)
    }
  }
  // Handle DD-MM-YYYY format
  else if (dateStr.includes('-')) {
    const parts = dateStr.split('-')
    if (parts.length === 3 && parts[2].length === 4) {
      const [day, month, year] = parts
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      throw new Error(`Invalid date format: ${dateStr}`)
    }
  }
  // Handle other formats
  else {
    date = new Date(dateStr)
  }

  // Validate the date
  if (isNaN(date.getTime())) {
    console.error('❌ Invalid date created from:', dateStr)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`

  console.log('✅ Formatted date:', formattedDate)
  return formattedDate
}
