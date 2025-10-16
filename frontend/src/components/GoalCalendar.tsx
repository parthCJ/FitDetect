'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface Goal {
  date: string
  exercise_type: 'pushup' | 'squat'
  target_count: number
  completed_count?: number
  status?: string
}

interface GoalCalendarProps {
  onSaveGoals?: (goals: Goal[], month: string) => void
  existingGoals?: Goal[]
  readonly?: boolean
}

export default function GoalCalendar({ onSaveGoals, existingGoals = [], readonly = false }: GoalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>(existingGoals)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [formData, setFormData] = useState({
    exercise_type: 'pushup' as 'pushup' | 'squat',
    target_count: 20
  })

  useEffect(() => {
    setGoals(existingGoals)
  }, [existingGoals])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getGoalsForDate = (dateString: string) => {
    return goals.filter(g => g.date === dateString)
  }

  const handleDateClick = (dateString: string) => {
    if (readonly) return
    
    const clickedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Only allow setting goals for today and future dates
    if (clickedDate >= today) {
      setSelectedDate(dateString)
      setShowGoalForm(true)
    }
  }

  const handleAddGoal = () => {
    if (!selectedDate) return

    const newGoal: Goal = {
      date: selectedDate,
      exercise_type: formData.exercise_type,
      target_count: formData.target_count
    }

    // Check if goal already exists for this date and exercise
    const existingGoalIndex = goals.findIndex(
      g => g.date === selectedDate && g.exercise_type === formData.exercise_type
    )

    let updatedGoals
    if (existingGoalIndex !== -1) {
      // Update existing goal
      updatedGoals = [...goals]
      updatedGoals[existingGoalIndex] = newGoal
    } else {
      // Add new goal
      updatedGoals = [...goals, newGoal]
    }

    setGoals(updatedGoals)
    setShowGoalForm(false)
    setFormData({ exercise_type: 'pushup', target_count: 20 })
  }

  const handleDeleteGoal = (dateString: string, exerciseType: string) => {
    const updatedGoals = goals.filter(
      g => !(g.date === dateString && g.exercise_type === exerciseType)
    )
    setGoals(updatedGoals)
  }

  const handleSaveAllGoals = () => {
    if (onSaveGoals) {
      // Format month as "YYYY-MM"
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const monthString = `${year}-${month}`
      onSaveGoals(goals, monthString)
    }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const renderCalendar = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-900/20 rounded-lg" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(year, month, day)
      const dateGoals = getGoalsForDate(dateString)
      const currentDateObj = new Date(year, month, day)
      const isPast = currentDateObj < today
      const isToday = currentDateObj.getTime() === today.getTime()

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateString)}
          className={`h-24 rounded-lg p-2 border transition-all ${
            isPast
              ? 'bg-gray-900/20 border-gray-700/30 cursor-not-allowed opacity-50'
              : readonly
              ? 'bg-gray-800/40 border-gray-700/50 cursor-default'
              : 'bg-gray-800/60 border-gray-700 hover:border-primary-500/50 cursor-pointer hover:bg-gray-800/80'
          } ${isToday ? 'ring-2 ring-primary-500/50' : ''}`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary-400' : 'text-gray-300'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dateGoals.map((goal, idx) => {
              const progress = goal.completed_count && goal.target_count 
                ? (goal.completed_count / goal.target_count) * 100 
                : 0
              
              return (
                <div
                  key={idx}
                  className={`text-xs px-1.5 py-0.5 rounded group relative ${
                    goal.exercise_type === 'pushup'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                      : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                  } ${!readonly ? 'cursor-pointer transition-all' : ''}`}
                  onClick={(e) => {
                    if (!readonly) {
                      e.stopPropagation()
                      handleDeleteGoal(dateString, goal.exercise_type)
                    }
                  }}
                  title={readonly ? '' : 'Click to remove this goal'}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">
                      {goal.exercise_type === 'pushup' ? '💪' : '🦵'} {goal.target_count}
                    </span>
                    <span className="flex items-center gap-1">
                      {goal.status === 'completed' && <span>✓</span>}
                      {!readonly && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-[10px]">
                          ✕
                        </span>
                      )}
                    </span>
                  </div>
                  {goal.completed_count !== undefined && (
                    <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${goal.exercise_type === 'pushup' ? 'bg-blue-400' : 'bg-green-400'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded" />
          <span className="text-gray-300">Push-ups</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded" />
          <span className="text-gray-300">Squats</span>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {renderCalendar()}
      </div>

      {/* Save Button */}
      {!readonly && onSaveGoals && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} set this month
          </p>
          <button
            onClick={handleSaveAllGoals}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
          >
            Save Goals
          </button>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Set Goal for {selectedDate}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exercise Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, exercise_type: 'pushup' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.exercise_type === 'pushup'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">💪</div>
                    <div className="font-semibold">Push-ups</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, exercise_type: 'squat' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.exercise_type === 'squat'
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🦵</div>
                    <div className="font-semibold">Squats</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.target_count}
                  onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGoalForm(false)
                  setFormData({ exercise_type: 'pushup', target_count: 20 })
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
