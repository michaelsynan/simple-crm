export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetchSession } = useUserSession()

  // On SSR or initial page load, ensure session is loaded
  if (import.meta.server) {
    await fetchSession()
  }

  const isAuthPage = to.path === '/login'

  if (!loggedIn.value && !isAuthPage) {
    return navigateTo('/login')
  }

  if (loggedIn.value && isAuthPage) {
    return navigateTo('/')
  }
})
