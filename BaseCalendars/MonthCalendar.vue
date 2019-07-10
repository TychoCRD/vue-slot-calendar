<template>
  <div class="month-calendar-container" :style="calendarStyle">
    <section class="calendar-header">
      <div class="arrow" @click="goToPreviousYear">
        <slot name="previous-year-arrow">&laquo;</slot>
      </div>
      <div class="arrow" @click="goToPreviousMonth">
        <slot name="previous-month-arrow">&lsaquo;</slot>
      </div>
      <div class="title" @click="resetMonthToCurrent">{{ headerLabel }}</div>
      <div class="arrow" @click="goToNextMonth">
        <slot name="next-month-arrow">&rsaquo;</slot>
      </div>
      <div class="arrow" @click="goToNextYear">
        <slot name="next-year-arrow">&raquo;</slot>
      </div>
    </section>
    <section class="day-name-header">
      <div class="day-name"
        v-for="weekday in weekdayLabelList"
        :key="weekday.number">
        {{ weekday.label }}
      </div>
    </section>
    <section class="week-container" v-for="(week, index) in weeksList"
      :key="index">
      <div class="day-container" v-for="day in week"
        :style="squareStyle"
        :key="day.dateString">
        <slot name="day-square" :day="day">
          {{ day.label }}
        </slot>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  getCalendarData,
  getDayLabel,
  getDateString,
  CalendarDataT
} from './_calendar'
// Type Imports
import {
  LabelNumberT,
  DayDisplayT,
  WeekDisplayT
} from './_types'

export default Vue.extend({
  name: 'BaseMonthCalendar',
  props: {
    calendarWidth: {
      type: String,
      required: true
    },
    squareHeight: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      displayMonth: 0,
      displayYear: 0
    }
  },
  created () {
    this.resetMonthToCurrent()
  },
  computed: {
    appLanguage (): string {
      return this.$store.getters.language
    },
    calendarStyle (): {[key: string]: string} {
      let width = ''
      if (this.calendarWidth.indexOf('%') > -1) {
        width = this.calendarWidth
      } else {
        width = `${this.calendarWidth}px`
      }
      return {
        'width': width
      }
    },
    squareStyle (): {[key: string]: string} {
      let height = ''
      if (this.squareHeight.indexOf('%') > -1) {
        height = this.squareHeight
      } else {
        height = `${this.squareHeight}px`
      }
      return {
        'height': height
      }
    },
    initialCalendarData (): CalendarDataT {
      return getCalendarData(this.appLanguage)
    },
    monthIndex (): number {
      return (this.displayMonth - 1)
    },
    monthLabelList (): LabelNumberT[] {
      return this.initialCalendarData.monthLabels.map((label: string, index: number) => ({
        label,
        number: index + 1
      }))
    },
    weekdayLabelList (): LabelNumberT[] {
      return this.initialCalendarData.weekdayLabels.map((label: string, index: number) => {
        return {
          label,
          number: index + 1
        }
      })
    },
    headerLabel (): string {
      const monthItem = this.monthLabelList[this.monthIndex]
      const year = String(this.displayYear)
      return `${monthItem.label} ${year}`
    },
    firstWeekdayInMonth (): number {
      // Returns number for first weekday (1-7), starting from Sunday
      const firstDayIndex = new Date(this.displayYear, this.monthIndex, 1).getDay()
      return firstDayIndex + 1
    },
    daysInMonth (): number {
      const isFebruary = this.displayMonth === 2
      const isLeapYear = (this.displayYear % 4 === 0 && this.displayYear % 100 !== 0) || this.displayYear % 400 === 0
      if (isFebruary && isLeapYear) return 29
      const daysNumber = this.initialCalendarData.daysInMonths[this.monthIndex]
      return daysNumber
    },
    initialMonthDay (): number {
      // monthDay counter init value for weeksList
      if (this.firstWeekdayInMonth === 1) return 0
      const emptyDays = this.firstWeekdayInMonth - 1
      return 0 - emptyDays
    },
    weeksList (): WeekDisplayT {
      const thisDay = this.initialCalendarData.day
      const thisMonth = this.initialCalendarData.month
      const thisYear = this.initialCalendarData.year
      let weeks: WeekDisplayT = []
      let monthHasStarted = false
      let monthHasEnded = false
      let monthDay = this.initialMonthDay
      const weekDayIterable = [1, 2, 3, 4, 5, 6, 7]
      for (let w = 1; (w <= 6 && !monthHasEnded); w++) {
        let weekDayDisplayList: DayDisplayT[] = []
        weekDayIterable.forEach((day: number) => {
          // Increment monthDay
          monthDay += 1
          // Trigger start of month
          if (!monthHasStarted && day === this.firstWeekdayInMonth) {
            monthHasStarted = true
          }

          // Build DayDisplayT
          const label = getDayLabel(monthDay, this.displayMonth)
          const isToday = (monthDay === thisDay && this.displayMonth === thisMonth && this.displayYear === thisYear)
          const dateString = getDateString(monthDay, this.displayMonth, this.displayYear, !monthHasStarted, monthHasEnded)
          weekDayDisplayList.push({
            label,
            number: monthDay,
            dateString,
            weekdayNumber: day,
            weekNumber: w,
            isBeforeMonth: !monthHasStarted,
            isAfterMonth: monthHasEnded,
            inMonth: monthHasStarted && !monthHasEnded,
            isToday,
            isFirstDay: monthDay === 1,
            isLastDay: monthDay === this.daysInMonth
          })
          // Trigger end of month on the last day
          if (monthHasStarted && !monthHasEnded && monthDay >= this.daysInMonth) {
            monthHasEnded = true
          }
        })

        weeks.push(weekDayDisplayList)
      }
      return weeks
    }
  },
  methods: {
    resetMonthToCurrent (): void {
      this.displayMonth = this.initialCalendarData.month
      this.displayYear = this.initialCalendarData.year
    },
    goToNextMonth (): void {
      if (this.displayMonth < 12) {
        this.displayMonth++
      } else {
        this.displayMonth = 1
        this.displayYear++
      }
      this.announceNewCalendarTime()
    },
    goToPreviousMonth (): void {
      if (this.displayMonth > 1) {
        this.displayMonth--
      } else {
        this.displayMonth = 12
        this.displayYear--
      }
      this.announceNewCalendarTime()
    },
    goToNextYear (): void {
      this.displayYear++
      this.announceNewCalendarTime()
    },
    goToPreviousYear (): void {
      this.displayYear--
      this.announceNewCalendarTime()
    },
    announceNewCalendarTime (): void {
      const mmMonth = String(this.displayMonth).length < 2 ? `0${this.displayMonth}` : this.displayMonth
      const monthString = `${this.displayYear}-${mmMonth}`
      this.$emit('setNewCalendar', monthString)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~uikit';
.month-calendar-container {
  width: 100%;
  flex: 1 1 auto;
  margin: 0 auto;
}
.calendar-header {
  flex-shrink: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  .title {
    width: 150px;
    font-size: 18px;
    font-weight: 700;
  }
  .arrow {
    cursor: pointer;
    margin: 0 1rem;
  }
}
.day-name-header {
  width: 100%;
  display: flex;
  .day-name {
    width: 14.3%;
  }
}
.week-container {
  width: 100%;
  display: flex;
  .day-container {
    width: 14.3%;
  }
}
</style>
