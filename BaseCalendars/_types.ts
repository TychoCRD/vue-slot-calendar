export interface LabelNumberT {
  label: string
  number: number
}

export interface DayDisplayT {
  label: string
  number: number
  dateString: string
  weekdayNumber: number
  weekNumber: number
  isBeforeMonth: boolean
  isAfterMonth: boolean
  inMonth: boolean
  isToday: boolean
  isFirstDay: boolean
  isLastDay: boolean
}

export type WeekDisplayT = DayDisplayT[][]
