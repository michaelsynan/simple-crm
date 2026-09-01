<script setup lang="ts">
const appConfig = useAppConfig()
const appName = computed(() => appConfig.name || 'Primo Admin')

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${appName.value}` : appName.value
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const { user, loggedIn, signOut } = useUserSession()
const router = useRouter()
const route = useRoute()

// Check user role
const userRole = computed(() => (user.value as any)?.role || 'frank')
const isAdmin = computed(() => userRole.value === 'admin')
const userName = computed(() => user.value?.name || 'Frank')

const handleSignOut = async () => {
  await signOut()
  await router.push('/login')
}
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased pb-20 sm:pb-8">
      <!-- Top App Bar -->
      <header v-if="loggedIn" class="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg text-emerald-700 dark:text-emerald-400 tracking-tight active:scale-95 transition-transform">
            <UIcon name="i-lucide-wrench" class="w-6 h-6 text-emerald-600" />
            <span>{{ appName }}</span>
          </NuxtLink>

          <!-- User status / Logout -->
          <div class="flex items-center gap-2">
            <UBadge v-if="isAdmin" color="primary" variant="subtle" size="sm" class="hidden xs:inline-flex">
              Admin
            </UBadge>
            <UButton
              icon="i-lucide-log-out"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Log out"
              @click="handleSignOut"
            />
          </div>
        </div>
      </header>

      <!-- Main Content Area (Max width 2xl optimized for mobile screens) -->
      <main class="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6">
        <NuxtPage />
      </main>

      <!-- Bottom Navigation for Mobile & Quick Access -->
      <nav v-if="loggedIn" class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 shadow-lg sm:max-w-2xl sm:mx-auto sm:rounded-t-2xl sm:bottom-0">
        <div class="flex items-center justify-around max-w-md mx-auto">
          <!-- Home -->
          <NuxtLink
            to="/"
            class="flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg transition-colors"
            :class="route.path === '/' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'"
          >
            <UIcon name="i-lucide-home" class="w-6 h-6 mb-0.5" />
            <span>Home</span>
          </NuxtLink>

          <!-- + New Customer (High priority center action for Frank) -->
          <NuxtLink
            to="/customers/new"
            class="flex flex-col items-center py-1 px-4 -mt-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-md transition-all active:scale-95"
          >
            <UIcon name="i-lucide-user-plus" class="w-6 h-6 my-1" />
            <span class="text-[10px] font-bold uppercase tracking-wider mb-1">New</span>
          </NuxtLink>

          <!-- Customers -->
          <NuxtLink
            to="/customers"
            class="flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg transition-colors"
            :class="route.path.startsWith('/customers') && route.path !== '/customers/new' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'"
          >
            <UIcon name="i-lucide-users" class="w-6 h-6 mb-0.5" />
            <span>Customers</span>
          </NuxtLink>

          <!-- Campaigns (Admin only) -->
          <NuxtLink
            v-if="isAdmin"
            to="/campaigns"
            class="flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg transition-colors"
            :class="route.path.startsWith('/campaigns') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'"
          >
            <UIcon name="i-lucide-message-square" class="w-6 h-6 mb-0.5" />
            <span>Campaigns</span>
          </NuxtLink>
        </div>
      </nav>
    </div>
  </UApp>
</template>
