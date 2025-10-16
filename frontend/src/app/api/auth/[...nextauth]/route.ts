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
      // Send user data to backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      
      console.log('SignIn callback - Account:', account)
      
      try {
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: account?.id_token,
          }),
        })
        
        console.log('Backend auth response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Backend returned access token:', data.access_token)
          // Store access token in user object
          ;(user as any).accessToken = data.access_token
          return true
        } else {
          const errorData = await response.text()
          console.error('Backend auth failed:', errorData)
        }
      } catch (error) {
        console.error('Backend auth error:', error)
      }
      
      return true
    },
    async jwt({ token, user, account }) {
      // Store access token in JWT
      if (user && (user as any).accessToken) {
        // Backend JWT token takes priority
        console.log('JWT callback - Using backend JWT token')
        token.accessToken = (user as any).accessToken
      } else if (account?.access_token && !token.accessToken) {
        // Only use Google token as fallback if we don't have backend token
        console.log('JWT callback - Fallback to Google OAuth token')
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
