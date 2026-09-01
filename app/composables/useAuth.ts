import { useUserSession, useAuthClient } from '#imports'

export function useAuth() {
  const { user, session, loggedIn, signOut, fetchSession } = useUserSession()
  const authClient = useAuthClient()

  return {
    user,
    session,
    loggedIn,
    signOut,
    fetchSession,
    client: authClient,
    signIn: authClient?.signIn,
    signUp: authClient?.signUp
  }
}
