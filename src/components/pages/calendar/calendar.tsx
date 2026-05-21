"use client";
import React from 'react'
import Header from '../../common/header'
import TradingCalendar from './components/tradingCalendar'

function CalendarView() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Calendar" />
      <div className="flex-1 p-3">
        <TradingCalendar />
      </div>
    </div>
  )
}

export default CalendarView