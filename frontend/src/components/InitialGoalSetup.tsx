'use client'

import { useState } from 'react'
import GoalCalendar from './GoalCalendar'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Goal {
  date: string
  exercise_type: 'pushup' | 'squat'
  target_count: number
}

interface InitialGoalSetupProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (goals: Goal[]) => Promise<void>
}

export default function InitialGoalSetup({ isOpen, onClose, onComplete }: InitialGoalSetupProps) {
  const [step, setStep] = useState(1)
  const [goals, setGoals] = useState<Goal[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSaveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals)
  }

  const handleComplete = async () => {
    if (goals.length === 0) {
      alert('Please set at least one goal to continue')
      return
    }

    setIsSubmitting(true)
    try {
      await onComplete(goals)
      onClose()
    } catch (error) {
      console.error('Failed to save goals:', error)
      alert('Failed to save goals. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (confirm('Are you sure you want to skip setting goals? You can always set them later from the dashboard.')) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {step === 1 ? 'Welcome to FitDetect! 🎯' : 'Set Your Monthly Goals'}
              </h2>
              <p className="text-gray-300">
                {step === 1 
                  ? 'Let\'s set up your exercise goals to track your progress'
                  : 'Click on any date to add an exercise goal'}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Welcome Content */}
              <div className="bg-gradient-to-br from-primary-500/20 to-blue-500/10 border border-primary-500/30 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4">Why Set Goals?</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <strong className="text-white">Stay Motivated:</strong> Having clear targets keeps you committed to your fitness journey
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <strong className="text-white">Track Progress:</strong> See your improvements over time with detailed analytics
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <strong className="text-white">Achieve More:</strong> Structured goals help you push your limits safely
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <strong className="text-white">Build Habits:</strong> Consistent daily targets create lasting fitness habits
                    </div>
                  </li>
                </ul>
              </div>

              {/* Quick Tips */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <h4 className="font-semibold text-blue-300 mb-2">💪 Push-ups</h4>
                  <p className="text-sm text-gray-300">
                    Great for upper body strength. Start with 10-20 reps if you're a beginner, 30-50 for intermediate.
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <h4 className="font-semibold text-green-300 mb-2">🦵 Squats</h4>
                  <p className="text-sm text-gray-300">
                    Perfect for leg strength. Aim for 15-25 reps as a beginner, 40-60 for intermediate level.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Skip for Now
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
                >
                  Set My Goals →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  How to Set Goals
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Click on any future date in the calendar</li>
                  <li>• Choose your exercise type (Push-ups or Squats)</li>
                  <li>• Set your target count for that day</li>
                  <li>• You can set multiple exercises for the same day</li>
                  <li>• Click on a goal to remove it</li>
                </ul>
              </div>

              {/* Calendar */}
              <GoalCalendar onSaveGoals={handleSaveGoals} existingGoals={goals} />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleComplete}
                  disabled={goals.length === 0 || isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : `Complete Setup (${goals.length} goals)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
