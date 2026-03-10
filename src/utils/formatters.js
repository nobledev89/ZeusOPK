import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy HH:mm')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'N/A'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format a date to show time ago (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Time ago string
 */
export const formatTimeAgo = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format currency value
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format subscription status with proper capitalization and styling
 * @param {string} status - The status to format
 * @returns {object} Object with text and color class
 */
export const formatSubscriptionStatus = (status) => {
  if (!status) return { text: 'Unknown', color: 'gray' }
  
  const statusMap = {
    trial: { text: 'Trial', color: 'blue' },
    active: { text: 'Active', color: 'green' },
    expired: { text: 'Expired', color: 'red' },
    suspended: { text: 'Suspended', color: 'yellow' },
    banned: { text: 'Banned', color: 'red' }
  }
  
  return statusMap[status.toLowerCase()] || { text: status, color: 'gray' }
}

/**
 * Calculate remaining trial time
 * @param {string} trialStartedAt - Trial start date
 * @param {number} trialDurationMinutes - Trial duration in minutes
 * @returns {string} Remaining time string
 */
export const calculateTrialRemaining = (trialStartedAt, trialDurationMinutes) => {
  if (!trialStartedAt || !trialDurationMinutes) return 'N/A'
  
  try {
    const startDate = new Date(trialStartedAt)
    const endDate = new Date(startDate.getTime() + trialDurationMinutes * 60000)
    const now = new Date()
    
    if (now > endDate) return 'Expired'
    
    const remainingMs = endDate - now
    const remainingMinutes = Math.floor(remainingMs / 60000)
    const hours = Math.floor(remainingMinutes / 60)
    const minutes = remainingMinutes % 60
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days !== 1 ? 's' : ''} remaining`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  } catch (error) {
    return 'Invalid'
  }
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}
