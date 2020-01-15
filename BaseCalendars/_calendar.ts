import moment from 'moment-timezone'
import { CHINA_TIMEZONE } from '@/utils/constants'

moment.tz.setDefault(CHINA_TIMEZONE)

// Calendar data
export function getDaysInMonths (year: number): number[] {
  let daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const isLeapYear = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)
  if (isLeapYear) {
    daysInMonths[1] = 29
  }
  return daysInMonths
}
const enWeekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const cnWeekdayLabels = ['日', '一', '二', '三', '四', '五', '六']
const enMonthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const cnMonthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export interface CalendarDataT {
  year: number
  month: number
  day: number
  daysInMonths: number[]
  weekdayLabels: string[]
  monthLabels: string[]
}
export function getCalendarData (appLanguage: string): CalendarDataT {
  const nowTime = moment()

  const year = nowTime.year()
  const calendarDataObject: CalendarDataT = {
    year,
    month: (nowTime.month() + 1),
    day: nowTime.date(),
    daysInMonths: getDaysInMonths(year),
    weekdayLabels: (appLanguage === 'en-us' ? enWeekdayLabels : cnWeekdayLabels),
    monthLabels: (appLanguage === 'en-us' ? enMonthLabels : cnMonthLabels)
  }
  return calendarDataObject
}

export function getDayLabel (monthDay: number, displayMonth: number, displayYear: number): string {
  const daysInMonthsList = getDaysInMonths(displayYear)
  const daysInThisMonth = daysInMonthsList[displayMonth - 1]
  if (monthDay > 0 && monthDay <= daysInThisMonth) {
    return monthDay.toString()
  } else if (monthDay < 1) {
    const prevMonthIndex = displayMonth >= 2 ? (displayMonth - 2) : (daysInMonthsList.length - 1)
    const prevMonthDays = daysInMonthsList[prevMonthIndex]
    const prevMonthDayDate = prevMonthDays - Math.abs(monthDay)
    return prevMonthDayDate.toString()
  } else {
    const nextMonthDayDate = monthDay - daysInMonthsList[displayMonth - 1]
    return nextMonthDayDate.toString()
  }
}

export function getDateString (monthDay: number, displayMonth: number, displayYear: number, isBeforeMonth: boolean, isAfterMonth: boolean): string {
  if (!isBeforeMonth && !isAfterMonth) {
    const monthString = displayMonth.toString().length < 2 ? `0${displayMonth}` : displayMonth.toString()
    const dateString = monthDay.toString().length < 2 ? `0${monthDay}` : monthDay.toString()
    return `${displayYear}-${monthString}-${dateString}`
  } else if (isBeforeMonth) {
    // Year and Month Numbers
    let dateYearNum: number = displayMonth === 1 ? displayYear - 1 : displayYear
    let dateMonthNum: number = displayMonth === 1 ? 12 : displayMonth - 1
    // Month and Date Strings
    let dateMonthStr: string
    let dateDayStr: string
    // Create Month String
    dateMonthStr = dateMonthNum.toString().length < 2 ? `0${dateMonthNum}` : dateMonthNum.toString()
    // Calculate and create Day String
    const prevMonthDayDate = getDayLabel(monthDay, displayMonth, displayYear)
    dateDayStr = prevMonthDayDate.length < 2 ? `0${prevMonthDayDate}` : prevMonthDayDate
    return `${dateYearNum}-${dateMonthStr}-${dateDayStr}`
  } else {
    // After Month
    // Year and Month Numbers
    let dateYearNum: number = displayMonth === 12 ? displayYear + 1 : displayYear
    let dateMonthNum: number = displayMonth === 12 ? 1 : displayMonth + 1
    // Month and Date Strings
    let dateMonthStr: string
    let dateDayStr: string
    // Create Month String
    dateMonthStr = dateMonthNum.toString().length < 2 ? `0${dateMonthNum}` : dateMonthNum.toString()
    // Calculate and create Day String
    const nextMonthDayDate = getDayLabel(monthDay, displayMonth, displayYear)
    dateDayStr = nextMonthDayDate.length < 2 ? `0${nextMonthDayDate}` : nextMonthDayDate
    return `${dateYearNum}-${dateMonthStr}-${dateDayStr}`
  }
}
