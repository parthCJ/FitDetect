'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import InitialGoalSetup from '@/components/InitialGoalSetup'
import GoalCalendar from '@/components/GoalCalendar'

interface Exercise {
  exercise_id: string
  name: string
  type: string
  description?: string
}

interface Session {
  session_id: string
  exercise_name: string
  reps: number
  timestamp: string
}

interface Goal {
  id: string
  date: string
  exercise_type: 'pushup' | 'squat'
  target_count: number
  completed_count: number
  status: string
  progress_percentage: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [stats, setStats] = useState({ total_sessions: 0, total_reps: 0 })
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [currentDemoVideo, setCurrentDemoVideo] = useState<'pushup' | 'squat' | null>(null)
  const [showInitialGoalSetup, setShowInitialGoalSetup] = useState(false)
  const [showGoalCalendar, setShowGoalCalendar] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [todayGoals, setTodayGoals] = useState<Goal[]>([])
  const [goalStats, setGoalStats] = useState({
    total_goals: 0,
    completed_goals: 0,
    pending_goals: 0,
    in_progress_goals: 0,
    completion_rate: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchExercises()
      fetchRecentSessions()
      fetchStats()
      fetchGoals()
      fetchTodayGoals()
      fetchGoalStats()
      checkInitialGoalSetup()
    }
  }, [session])

  const checkInitialGoalSetup = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/stats/summary`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        // Show initial setup if user has never set any goals
        if (data.total_goals_this_month === 0) {
          setShowInitialGoalSetup(true)
        }
      }
    } catch (error) {
      console.error('Error checking goal setup:', error)
    }
  }

  const fetchGoals = async () => {
    try {
      // Get current month's goals
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  const fetchTodayGoals = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/today`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setTodayGoals(data)
      }
    } catch (error) {
      console.error('Error fetching today goals:', error)
    }
  }

  const fetchGoalStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/stats/summary`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setGoalStats(data)
      }
    } catch (error) {
      console.error('Error fetching goal stats:', error)
    }
  }

  const handleCompleteGoalSetup = async (newGoals: any[]) => {
    try {
      // Get current month for the initial setup
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify({ goals: newGoals, month }),
        }
      )
      
      if (response.ok) {
        await fetchGoals()
        await fetchGoalStats()
        await fetchTodayGoals()
        setShowInitialGoalSetup(false)
      } else {
        throw new Error('Failed to save goals')
      }
    } catch (error) {
      console.error('Error saving goals:', error)
      throw error
    }
  }

  const handleSaveGoals = async (updatedGoals: any[], month: string) => {
    try {
      console.log('Saving goals:', updatedGoals)
      console.log('Month:', month)
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
      console.log('Session:', session)
      console.log('Access Token:', (session as any)?.accessToken)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify({ goals: updatedGoals, month }),
        }
      )
      
      const data = await response.json()
      console.log('Response:', response.status, data)
      
      if (response.ok) {
        if (data.errors && data.errors.length > 0) {
          console.warn('Some goals had errors:', data.errors)
          alert(`Created ${data.created} goals. Some goals already exist or had errors.`)
        }
        await fetchGoals()
        await fetchGoalStats()
        await fetchTodayGoals()
        setShowGoalCalendar(false)
      } else {
        const errorMsg = data.detail || 'Failed to save goals'
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Error saving goals:', error)
      alert(`Failed to save goals: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercises/`)
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/history?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setRecentSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/stats`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                FitDetect
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-gray-800/60 rounded-full px-4 py-2 border border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-200">
                  {session?.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2 text-sm font-medium border border-red-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="animate-wave">👋</span>
                Welcome back, {session?.user?.name?.split(' ')[0]}!
              </h1>
              <p className="mt-2 text-gray-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Ready to crush your fitness goals?
              </p>
            </div>
            <button
              onClick={() => setShowDemoModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <span className="font-semibold">Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 overflow-hidden shadow-xl rounded-2xl transform hover:scale-105 transition-all duration-200 hover:shadow-2xl border border-blue-500/20 hover:border-blue-500/40">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium uppercase tracking-wide">
                    Total Sessions
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {stats.total_sessions}
                  </p>
                  <p className="mt-1 text-blue-300 text-xs">
                    Workouts completed
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <svg className="h-10 w-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 overflow-hidden shadow-xl rounded-2xl transform hover:scale-105 transition-all duration-200 hover:shadow-2xl border border-green-500/20 hover:border-green-500/40">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium uppercase tracking-wide">
                    Total Reps
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {stats.total_reps}
                  </p>
                  <p className="mt-1 text-green-300 text-xs">
                    Repetitions counted
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <svg className="h-10 w-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 overflow-hidden shadow-xl rounded-2xl transform hover:scale-105 transition-all duration-200 hover:shadow-2xl border border-purple-500/20 hover:border-purple-500/40">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium uppercase tracking-wide">
                    This Week
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {Math.min(stats.total_sessions, 5)}
                  </p>
                  <p className="mt-1 text-purple-300 text-xs">
                    Keep it up! 🔥
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <svg className="h-10 w-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Goals Section */}
        {todayGoals.length > 0 && (
          <div className="mt-10 px-4 sm:px-0">
            <div className="bg-gradient-to-br from-primary-500/20 to-blue-500/10 border border-primary-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">🎯</span>
                  Today's Goals
                </h2>
                <button
                  onClick={() => setShowGoalCalendar(true)}
                  className="text-sm bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Manage Goals
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl border ${
                      goal.exercise_type === 'pushup'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-green-500/10 border-green-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{goal.exercise_type === 'pushup' ? '💪' : '🦵'}</span>
                        <h3 className="font-bold text-white capitalize">{goal.exercise_type}s</h3>
                      </div>
                      {goal.status === 'completed' && (
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold border border-green-500/30">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progress:</span>
                        <span className={`font-semibold ${
                          goal.exercise_type === 'pushup' ? 'text-blue-300' : 'text-green-300'
                        }`}>
                          {goal.completed_count} / {goal.target_count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            goal.exercise_type === 'pushup' ? 'bg-blue-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Goal Calendar & Stats */}
        <div className="mt-10 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-400 to-primary-500 w-1 h-8 rounded-full"></span>
              Monthly Goals
            </h2>
            <div className="flex items-center gap-3">
              {goalStats.total_goals > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">Completion Rate</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                    {goalStats.completion_rate}%
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowGoalCalendar(true)}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Set Goals
              </button>
            </div>
          </div>

          {goalStats.total_goals > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {goalStats.total_goals}
                  </div>
                  <div className="text-blue-300">Total Goals</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {goalStats.completed_goals}
                  </div>
                  <div className="text-green-300">Completed</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {goalStats.total_goals - goalStats.completed_goals}
                  </div>
                  <div className="text-purple-300">Remaining</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center backdrop-blur-sm">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-2">No Goals Set Yet</h3>
              <p className="text-gray-300 mb-4">
                Start tracking your progress by setting monthly exercise goals!
              </p>
              <button
                onClick={() => setShowGoalCalendar(true)}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Set Your First Goals
              </button>
            </div>
          )}
        </div>

        {/* Available Exercises */}
        <div className="mt-10 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-400 to-primary-500 w-1 h-8 rounded-full"></span>
              Available Exercises
            </h2>
            <span className="text-sm text-gray-300 bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700">
              {exercises.length > 0 ? exercises.length : 2} exercises
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {exercises.length > 0 ? (
              exercises.map((exercise) => (
                <Link
                  key={exercise.exercise_id}
                  href={`/exercise/${exercise.type}`}
                  className="group relative bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary-500/20 hover:border-primary-500/50 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {exercise.type === 'pushup' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            )}
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                            {exercise.name}
                          </h3>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                            AI Powered
                          </p>
                        </div>
                      </div>
                      <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {exercise.description || 'Real-time AI detection and counting'}
                    </p>
                    <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-md group-hover:shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Exercise
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Link
                    href="/exercise/pushup"
                    className="group relative bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/50 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                              Push-ups
                            </h3>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                              AI Powered
                            </p>
                          </div>
                        </div>
                        <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold border border-green-500/30">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">
                        Real-time push-up detection with automatic rep counting
                      </p>
                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-md group-hover:shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Exercise
                      </button>
                    </div>
                  </Link>
                  <Link
                    href="/exercise/squat"
                    className="group relative bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-500/20 hover:border-green-500/50 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                              Squats
                            </h3>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                              AI Powered
                            </p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">
                        Track your squats with intelligent form analysis
                      </p>
                      <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-md group-hover:shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Exercise
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mt-10 px-4 sm:px-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-primary-400 to-primary-500 w-1 h-8 rounded-full"></span>
                Recent Sessions
              </h2>
              <span className="text-sm text-gray-300 bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700">
                Last {recentSessions.length}
              </span>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-700">
              <ul className="divide-y divide-gray-700">
                {recentSessions.map((session, index) => (
                  <li 
                    key={session.session_id} 
                    className="px-6 py-5 hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-transparent transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          session.exercise_name.toLowerCase().includes('push') 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-br from-green-500 to-green-600'
                        } shadow-md group-hover:scale-110 transition-transform`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {session.exercise_name.toLowerCase().includes('push') ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            )}
                          </svg>
                        </div>
                        <div>
                          <p className="text-base font-bold text-white group-hover:text-primary-400 transition-colors">
                            {session.exercise_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-400 font-medium">
                              {session.timestamp && !isNaN(new Date(session.timestamp).getTime())
                                ? new Date(session.timestamp).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Recent'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                            {session.reps}
                          </p>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            reps
                          </p>
                        </div>
                        {index === 0 && (
                          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Demo Video Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Exercise Detection Demo
                </h2>
                <button
                  onClick={() => {
                    setShowDemoModal(false)
                    setCurrentDemoVideo(null)
                  }}
                  className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 rounded-lg p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!currentDemoVideo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Push-up Demo */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer hover:border-blue-500/50"
                       onClick={() => setCurrentDemoVideo('pushup')}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-center text-white mb-2">
                      Push-ups Demo
                    </h3>
                    <p className="text-center text-gray-300 mb-4">
                      See how our AI detects and counts push-up repetitions in real-time
                    </p>
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-center">
                      <span className="text-sm text-gray-400">Click to watch demo</span>
                    </div>
                  </div>

                  {/* Squat Demo */}
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer hover:border-green-500/50"
                       onClick={() => setCurrentDemoVideo('squat')}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-center text-white mb-2">
                      Squats Demo
                    </h3>
                    <p className="text-center text-gray-300 mb-4">
                      Watch our AI track squat form and count repetitions automatically
                    </p>
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-center">
                      <span className="text-sm text-gray-400">Click to watch demo</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setCurrentDemoVideo(null)}
                    className="mb-4 text-primary-600 hover:text-primary-700 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to demos
                  </button>

                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      controls
                      autoPlay
                      className="w-full"
                      src={currentDemoVideo === 'pushup' 
                        ? '/demos/pushup-demo.mp4' 
                        : '/demos/squat-demo.mp4'
                      }
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      {currentDemoVideo === 'pushup' ? 'Push-ups' : 'Squats'} Detection Features:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Real-time pose detection using AI</li>
                      <li>✓ Automatic repetition counting</li>
                      <li>✓ Form feedback and guidance</li>
                      <li>✓ Session tracking and history</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-500">
                Start your fitness journey with AI-powered tracking!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial Goal Setup Modal */}
      <InitialGoalSetup
        isOpen={showInitialGoalSetup}
        onClose={() => setShowInitialGoalSetup(false)}
        onComplete={handleCompleteGoalSetup}
      />

      {/* Goal Calendar Modal */}
      {showGoalCalendar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Manage Your Goals</h2>
                  <p className="text-gray-300">Click on dates to add or modify your exercise goals</p>
                </div>
                <button
                  onClick={() => setShowGoalCalendar(false)}
                  className="p-2 text-gray-400 hover:text-gray-300 transition-colors bg-gray-800 hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <GoalCalendar 
                onSaveGoals={handleSaveGoals}
                existingGoals={goals.map(g => ({
                  date: g.date,
                  exercise_type: g.exercise_type,
                  target_count: g.target_count,
                  completed_count: g.completed_count,
                  status: g.status
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
