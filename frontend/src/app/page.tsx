import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">FitDetect</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="#features"
                className="text-gray-300 hover:text-primary-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hidden sm:block"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-300 hover:text-primary-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hidden sm:block"
              >
                How It Works
              </Link>
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary-500/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              AI-Powered Fitness Tracking
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Track Your Fitness
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">With Computer Vision</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              Real-time exercise detection and rep counting. Get instant feedback on your form using AI.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl text-base font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
              >
                Get Started Free
              </Link>
              <Link
                href="#how-it-works"
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-white/20 transition-all shadow-md border border-white/20"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Key Features</h2>
            <p className="mt-2 text-lg text-gray-300">
              Everything you need for effective fitness tracking
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="group p-5 bg-gray-900/60 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-blue-400 transition-colors">Real-Time Detection</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered computer vision tracks your movements through your webcam
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-5 bg-gray-900/60 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 border border-green-500/20 hover:border-green-500/50">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-green-400 transition-colors">Auto Rep Counting</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Automatically count repetitions with high accuracy using pose detection
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-5 bg-gray-900/60 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 border border-purple-500/20 hover:border-purple-500/50">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-purple-400 transition-colors">Personal Dashboard</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Track progress, view history, and monitor your fitness journey
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-5 bg-gray-900/60 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 border border-indigo-500/20 hover:border-indigo-500/50">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">Secure Authentication</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Sign in securely with Google OAuth 2.0 to protect your data
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-5 bg-gray-900/60 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 border border-orange-500/20 hover:border-orange-500/50">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-orange-400 transition-colors">Instant Feedback</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Get real-time feedback on your form and technique during exercises
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-5 bg-gray-900/60 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 border border-pink-500/20 hover:border-pink-500/50">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-pink-400 transition-colors">Multiple Exercises</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Support for push-ups, squats, and more exercises coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="mt-2 text-lg text-gray-300">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative text-center bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-blue-500/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-2">Sign In</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Create an account or sign in with Google OAuth 2.0
                </p>
              </div>
            </div>

            <div className="relative text-center bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-green-500/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-2">Choose Exercise</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Select from exercises like push-ups or squats
                </p>
              </div>
            </div>

            <div className="relative text-center bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-purple-500/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-2">Start Training</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Allow camera access and start your workout with real-time tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-950 to-black text-white py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">FitDetect</h2>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              AI-Powered Fitness Tracking with Computer Vision
            </p>
            <p className="text-gray-500 text-xs">
              © 2025 FitDetect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
