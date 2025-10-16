'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Webcam from 'react-webcam'

export default function ExercisePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const webcamRef = useRef<Webcam>(null)
  
  const exerciseType = params.type as string
  const [isStarted, setIsStarted] = useState(false)
  const [repCount, setRepCount] = useState(0)
  const [feedback, setFeedback] = useState('Ready to start!')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [todayGoal, setTodayGoal] = useState<{
    id: string
    target_count: number
    completed_count: number
    progress_percentage: number
  } | null>(null)
  const [showGoalAchievement, setShowGoalAchievement] = useState(false)

  // Exercise name mapping
  const exerciseNames: { [key: string]: string } = {
    pushup: 'Push-ups',
    squat: 'Squats',
  }

  const exerciseName = exerciseNames[exerciseType] || 'Unknown Exercise'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session) {
      fetchTodayGoal()
    }
  }, [status, router, session])

  const fetchTodayGoal = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/goals/exercise/${exerciseType}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setTodayGoal(data)
        }
      }
    } catch (error) {
      console.error('Error fetching goal:', error)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, startTime])

  const startExercise = async () => {
    try {
      // Create session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({
          exercise_name: exerciseName,
          exercise_type: exerciseType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSessionId(data.session_id)
        setIsStarted(true)
        setStartTime(Date.now())
        setFeedback('Exercise started! Begin your reps!')
      }
    } catch (error) {
      console.error('Error starting session:', error)
      setFeedback('Failed to start session. Using offline mode.')
      setIsStarted(true)
      setStartTime(Date.now())
    }
  }

  const stopExercise = async () => {
    setIsStarted(false)
    
    // Update goal progress if there's a goal for today
    if (todayGoal && sessionId) {
      try {
        const newCompletedCount = todayGoal.completed_count + repCount
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/goals/${todayGoal.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(session as any)?.accessToken}`,
            },
            body: JSON.stringify({
              completed_count: newCompletedCount,
            }),
          }
        )
        
        if (response.ok) {
          // Check if goal is achieved
          if (newCompletedCount >= todayGoal.target_count) {
            setShowGoalAchievement(true)
          }
          // Refresh goal data
          await fetchTodayGoal()
        }
      } catch (error) {
        console.error('Error updating goal:', error)
      }
    }
    
    if (sessionId) {
      try {
        // Update session with final data
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session as any)?.accessToken}`,
          },
          body: JSON.stringify({
            reps: repCount,
            duration: duration,
            completed: true,
          }),
        })
      } catch (error) {
        console.error('Error updating session:', error)
      }
    }

    setFeedback(`Great job! You completed ${repCount} reps!`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Simulate rep detection (in real implementation, this would use OpenCV/Mediapipe)
  const simulateRepDetection = () => {
    setRepCount(prev => prev + 1)
    setFeedback('Rep counted! Keep going!')
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
      <nav className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                FitDetect
              </Link>
              <span className="ml-2 text-gray-400">→ {exerciseName}</span>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-primary-400 px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-white mb-6">
            {exerciseName} Detection
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="aspect-video bg-gray-900 relative">
                  {isStarted ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: 'user',
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        <svg
                          className="mx-auto h-24 w-24 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xl">Camera will activate when you start</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Overlay */}
                  {isStarted && (
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
                        {feedback}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 flex gap-4">
                {!isStarted ? (
                  <button
                    onClick={startExercise}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                  >
                    Start Exercise
                  </button>
                ) : (
                  <>
                    <button
                      onClick={simulateRepDetection}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                    >
                      Simulate Rep (for testing)
                    </button>
                    <button
                      onClick={stopExercise}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                    >
                      Stop Exercise
                    </button>
                  </>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-blue-300 mb-2">Instructions:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Position yourself so your full body is visible in the camera</li>
                  <li>• Ensure good lighting for better detection</li>
                  <li>• Click "Start Exercise" to begin tracking</li>
                  <li>• Perform your {exerciseName.toLowerCase()} with proper form</li>
                  <li>• The system will automatically count your reps</li>
                </ul>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">
                  Session Stats
                </h2>

                {/* Today's Goal */}
                {todayGoal && (
                  <div className="mb-6 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl p-4 border border-primary-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-primary-300">Today's Goal</h3>
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {todayGoal.completed_count} / {todayGoal.target_count}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all"
                        style={{ width: `${Math.min(todayGoal.progress_percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-300">
                      {todayGoal.target_count - todayGoal.completed_count > 0
                        ? `${todayGoal.target_count - todayGoal.completed_count} more to go!`
                        : 'Goal achieved! 🎉'}
                    </div>
                  </div>
                )}

                {/* Rep Counter */}
                <div className="mb-6">
                  <div className="text-center bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-xl p-6 border border-primary-500/30">
                    <div className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent mb-2">
                      {repCount}
                    </div>
                    <div className="text-gray-300 text-lg">Repetitions</div>
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6 text-center bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30">
                  <div className="text-3xl font-semibold text-white mb-1">
                    {formatTime(duration)}
                  </div>
                  <div className="text-gray-300">Duration</div>
                </div>

                {/* Estimated Calories */}
                <div className="mb-6 text-center bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
                  <div className="text-2xl font-semibold text-white mb-1">
                    {Math.floor(repCount * 0.5)} cal
                  </div>
                  <div className="text-gray-300 text-sm">Est. Calories Burned</div>
                </div>

                {/* Exercise Info */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="font-semibold text-white mb-2">
                    Exercise: {exerciseName}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {exerciseType === 'pushup' && 
                      'Keep your back straight and lower your chest to the ground. Push back up to complete one rep.'}
                    {exerciseType === 'squat' && 
                      'Stand with feet shoulder-width apart. Lower your hips until thighs are parallel to ground, then stand back up.'}
                  </p>
                </div>

                {/* Status */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isStarted 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                    }`}>
                      {isStarted ? 'Active' : 'Stopped'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-yellow-300 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Pro Tips
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Maintain steady breathing</li>
                  <li>• Focus on form over speed</li>
                  <li>• Take breaks if needed</li>
                  <li>• Stay hydrated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Goal Achievement Modal */}
      {showGoalAchievement && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 border border-primary-500/50 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Goal Achieved!</h2>
            <p className="text-xl text-primary-300 mb-4">
              You completed today's {exerciseName.toLowerCase()} goal!
            </p>
            <div className="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4 mb-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                {todayGoal?.target_count}
              </div>
              <div className="text-gray-300 mt-1">Reps Completed</div>
            </div>
            <button
              onClick={() => setShowGoalAchievement(false)}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
