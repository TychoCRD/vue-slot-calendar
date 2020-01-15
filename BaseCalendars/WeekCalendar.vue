<template>
  <div class="week-calendar-container" :style="calendarStyle" :class="{'vertical-display': displayVertical}">
    <section class="calendar-header">
      <!-- <div class="arrow" @click="goToPreviousYear">
        <slot name="previous-year-arrow">&laquo;</slot>
      </div> -->
      <div class="arrow" @click="goToPreviousWeek">
        <slot name="previous-week-arrow">&lsaquo;</slot>
      </div>
      <div class="title" @click="resetWeekToCurrent">{{ headerLabel }}</div>
      <div class="arrow" @click="goToNextWeek">
        <slot name="next-week-arrow">&rsaquo;</slot>
      </div>
      <!-- <div class="arrow" @click="goToNextYear">
        <slot name="next-year-arrow">&raquo;</slot>
      </div> -->
    </section>
    <section class="day-name-header" v-if="!displayVertical">
      <div class="day-name"
        v-for="weekday in weekdayLabelList"
        :key="weekday.number">
        {{ weekday.label }}
      </div>
    </section>
    <section class="week-container">
      <div class="day-container" v-for="day in weeksList[displayWeekIndex]"
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
import moment from 'moment-timezone'
import {
  getCalendarData,
  getDaysInMonths,
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
  name: 'BaseWeekCalendar',
  props: {
    calendarWidth: {
      type: String,
      required: true
    },
    displayVertical: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      displayMonth: 0,
      displayYear: 0,
      displayWeekIndex: 0
    }
  },
  created () {
    this.resetWeekToCurrent()
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
      const displayWeek = this.weeksList[this.displayWeekIndex]
      const startDateString = displayWeek[0].dateString
      const endDateString = displayWeek[(displayWeek.length - 1)].dateString
      const startDate = moment(startDateString).format('MMMM D, YYYY')
      const endDate = moment(endDateString).format('MMMM D, YYYY')

      return `${startDate} - ${endDate}`
    },
    firstWeekdayInMonth (): number {
      // Returns number for first weekday (1-7), starting from Sunday
      const firstDayIndex = new Date(this.displayYear, this.monthIndex, 1).getDay()
      return firstDayIndex + 1
    },
    daysInMonth (): number {
      const daysInMonthsList = getDaysInMonths(this.displayYear)
      const daysNumber = daysInMonthsList[this.monthIndex]
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
      const todayDateString = getDateString(thisDay, thisMonth, thisYear, false, false)
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
          const label = getDayLabel(monthDay, this.displayMonth, this.displayYear)
          const dateString = getDateString(monthDay, this.displayMonth, this.displayYear, !monthHasStarted, monthHasEnded)
          const isToday = dateString === todayDateString
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
    },
    weeksInThisMonth (): number {
      return this.weeksList.length
    }
  },
  methods: {
    resetWeekToCurrent (): void {
      this.displayMonth = this.initialCalendarData.month
      this.displayYear = this.initialCalendarData.year
      this.displayWeekIndex = this.getCurrentWeekIndex()
    },
    getCurrentWeekIndex (): number {
      let todayMatch: DayDisplayT[] = []
      this.weeksList.forEach((week: DayDisplayT[]) => {
        week.forEach((day: DayDisplayT) => {
          if (day.isToday) {
            todayMatch.push(day)
          }
        })
      })
      if (todayMatch.length > 0) {
        return todayMatch[0].weekNumber - 1
      } else {
        return 0
      }

    },
    goToNextWeek (): void {
      if (this.displayWeekIndex === this.weeksInThisMonth - 1) {
        this.goToNextMonth()
        this.displayWeekIndex = 0
      } else {
        this.displayWeekIndex++
      }
    },
    goToPreviousWeek (): void {
      if (this.displayWeekIndex === 0) {
        this.goToPreviousMonth()
        this.displayWeekIndex = this.weeksInThisMonth - 1
      } else {
        this.displayWeekIndex--
      }
    },
    goToNextMonth () {
      if (this.displayMonth < 12) {
        this.displayMonth++
      } else {
        this.displayMonth = 1
        this.displayYear++
      }
      this.announceNewCalendarTime()
    },
    goToPreviousMonth () {
      if (this.displayMonth > 1) {
        this.displayMonth--
      } else {
        this.displayMonth = 12
        this.displayYear--
      }
      this.announceNewCalendarTime()
    },
    goToNextYear () {
      this.displayYear++,
      this.announceNewCalendarTime()
    },
    goToPreviousYear () {
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
.week-calendar-container {
  width: 100%;
  flex: 1 1 auto;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
.calendar-header {
  flex-shrink: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  .title {
    width: 380px;
    font-size: 18px;
    font-weight: 700;
  }
  .arrow {
    cursor: pointer;
    margin: 0 1rem;
  }
}
.day-name-header {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  .day-name {
    width: 14.3%;
  }
}
.week-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  .day-container {
    width: 14.3%;
  }
}
.vertical-display {
  .calendar-header {
    .title {
      font-size: 14px;
    }
  }
  .week-container {
    flex-direction: column;
    .day-container {
      width: 100%;
    }
  }
}
</style>
