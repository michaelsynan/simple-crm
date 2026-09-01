<script setup lang="ts">
const appConfig = useAppConfig()
const appName = computed(() => appConfig.name || 'Primo Admin')

const { fetchSession } = useUserSession()
const client = useAuthClient()
const router = useRouter()

const email = ref('frank@primosewer.com')
const password = ref('projects2026')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    if (!client) {
      errorMessage.value = 'Auth client is initializing. Please try again.'
      return
    }
    const res = await client.signIn.email({
      email: email.value,
      password: password.value
    })
    if (res.error) {
      errorMessage.value = res.error.message || 'Login failed. Please check credentials.'
    } else {
      await fetchSession({ force: true })
      await router.push('/')
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

const selectQuickUser = (role: 'frank' | 'admin') => {
  if (role === 'frank') {
    email.value = 'frank@primosewer.com'
    password.value = 'projects2026'
  } else {
    email.value = 'admin@primosewer.com'
    password.value = 'projects2026'
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex flex-col justify-center items-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-3 shadow-inner">
          <UIcon name="i-lucide-wrench" class="w-10 h-10" />
        </div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{{ appName }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Primo Sewer Cleaning Dispatch & SMS</p>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form class="space-y-4" @submit.prevent="handleLogin">
          <UAlert
            v-if="errorMessage"
            color="error"
            variant="subtle"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="frank@primosewer.com"
              size="xl"
              class="w-full"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              size="xl"
              class="w-full"
              required
            />
          </div>

          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :loading="loading"
            class="mt-2 font-bold py-3 text-base"
          >
            Log In
          </UButton>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Login (Demo)</p>
          <div class="flex gap-2 justify-center">
            <UButton
              size="sm"
              variant="outline"
              color="neutral"
              icon="i-lucide-user"
              @click="selectQuickUser('frank')"
            >
              Frank (Owner)
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              color="neutral"
              icon="i-lucide-shield-check"
              @click="selectQuickUser('admin')"
            >
              Admin
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
