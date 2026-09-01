<script setup lang="ts">
const appConfig = useAppConfig()
const appName = computed(() => appConfig.name || 'Primo Admin')

const { user } = useUserSession()
const userRole = computed(() => (user.value as any)?.role || 'frank')
const isAdmin = computed(() => userRole.value === 'admin')
const userName = computed(() => user.value?.name || 'Frank')

const { data: stats, pending: statsPending, refresh: refreshStats } = await useFetch<any>('/api/stats')

onMounted(() => {
  refreshStats()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Frank Header Greeting -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {{ appName }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {{ userName }}
        </p>
      </div>
      <UBadge :color="isAdmin ? 'primary' : 'neutral'" variant="subtle" size="md">
        {{ isAdmin ? 'Admin' : 'Field View' }}
      </UBadge>
    </div>

    <!-- PRIMARY ACTION: Big Prominent + New Customer Button for Frank on Mobile -->
    <NuxtLink to="/customers/new" class="block">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all text-white p-5 rounded-2xl shadow-lg flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-white/20 rounded-xl backdrop-blur">
            <UIcon name="i-lucide-user-plus" class="w-8 h-8" />
          </div>
          <div>
            <div class="text-xl font-black tracking-tight">+ New Customer</div>
            <div class="text-xs text-emerald-100 font-medium">Add contact, job & consent in 10s</div>
          </div>
        </div>
        <UIcon name="i-lucide-chevron-right" class="w-6 h-6 text-white/70" />
      </div>
    </NuxtLink>

    <!-- Secondary Action: View All Customers Button -->
    <NuxtLink to="/customers" class="block">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99] transition-all p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl">
            <UIcon name="i-lucide-users" class="w-6 h-6" />
          </div>
          <div>
            <div class="text-base font-bold text-slate-900 dark:text-white">Customers</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Search by name, phone or email</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UBadge color="neutral" variant="outline" size="sm">
            {{ stats?.totalCustomers ?? 0 }}
          </UBadge>
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </NuxtLink>

    <!-- ADMIN EXCLUSIVE SECTION: Simple Admin Dashboard -->
    <div v-if="isAdmin" class="space-y-4 pt-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">Admin SMS Marketing</h2>
        <NuxtLink to="/campaigns" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          View all campaigns →
        </NuxtLink>
      </div>

      <!-- Quick KPI grid -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Opted In</div>
          <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {{ stats?.smsOptedIn ?? 0 }}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Opted Out</div>
          <div class="text-xl font-black text-rose-500 mt-0.5">
            {{ stats?.smsOptedOut ?? 0 }}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
          <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Campaigns</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {{ stats?.totalCampaigns ?? 0 }}
          </div>
        </div>
      </div>

      <!-- Marketing Opportunity Banner -->
      <div v-if="stats?.noJob12Months > 0" class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
            <UIcon name="i-lucide-sparkles" class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-amber-900 dark:text-amber-200">
              {{ stats.noJob12Months }} customers have not had a job in 12+ months
            </div>
            <div class="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              Re-engage past sewer & drain cleaning customers
            </div>
          </div>
        </div>
        <NuxtLink :to="{ path: '/campaigns/new', query: { audience: 'no_job_12_months' } }">
          <UButton color="warning" size="sm" class="font-bold shrink-0 w-full sm:w-auto justify-center">
            Create Campaign
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- RECENT CUSTOMERS (Small & simple section for Frank) -->
    <div class="space-y-3 pt-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">Recent Customers</h2>
        <NuxtLink to="/customers" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          See all
        </NuxtLink>
      </div>

      <div v-if="statsPending" class="space-y-2">
        <div v-for="i in 3" :key="i" class="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
      </div>

      <div v-else-if="!stats?.recentCustomers || stats.recentCustomers.length === 0" class="text-center py-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <p class="text-sm text-slate-500">No customers yet.</p>
        <NuxtLink to="/customers/new" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
          + Add first customer
        </NuxtLink>
      </div>

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="customer in stats.recentCustomers"
          :key="customer.id"
          :to="`/customers/${customer.id}`"
          class="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.99] transition-all p-3.5 rounded-xl shadow-xs"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-bold text-sm text-slate-900 dark:text-white">{{ customer.name }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ customer.phone }}</div>
            </div>
            <div class="text-right">
              <div class="text-[11px] font-medium text-slate-400">Last Job</div>
              <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
                {{ customer.lastJobDate || 'None' }}
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
