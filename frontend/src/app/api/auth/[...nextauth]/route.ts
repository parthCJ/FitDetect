import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // ✅ OPTIMIZATION: Don't block sign-in on backend call
      // Sign in the user immediately, fetch backend token asynchronously
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      
      console.log('SignIn callback - Account:', account)
      
      // Store the id_token to fetch backend token later
      if (account?.id_token) {
        ;(user as any).googleIdToken = account.id_token
      }
      
      // ✅ Don't await - let sign-in complete immediately
      // Backend token will be fetched in jwt callback
      return true
    },
    async jwt({ token, user, account }) {
      // ✅ OPTIMIZATION: Fetch backend token asynchronously (non-blocking)
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      
      // If we have a Google ID token from sign-in, fetch backend token
      if (user && (user as any).googleIdToken && !token.backendToken) {
        console.log('JWT callback - Fetching backend token asynchronously')
        
        try {
          // Set a short timeout to avoid blocking
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
          
          const response = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: (user as any).googleIdToken }),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            const data = await response.json()
            console.log('Backend token fetched successfully')
            token.backendToken = data.access_token
            token.userId = data.user?.user_id
          }
        } catch (error) {
          console.error('Backend token fetch failed (will retry):', error)
          // Don't fail auth - user can still access with Google token
        }
      }
      
      // Use backend token if available, otherwise fallback to Google token
      if (token.backendToken) {
        token.accessToken = token.backendToken
      } else if (account?.access_token && !token.accessToken) {
        console.log('JWT callback - Using Google OAuth token as fallback')
        token.accessToken = account.access_token
      }
      
      return token
    },
    async session({ session, token }) {
      // Add access token to session
      console.log('Session callback - Token has accessToken:', !!token.accessToken)
      ;(session as any).accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true, // Enable debug mode to see more logs
})

export { handler as GET, handler as POST }
