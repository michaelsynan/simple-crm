<script setup lang="ts">
const { user } = useUserSession()
const userRole = computed(() => (user.value as any)?.role || 'frank')

// Restrict to Admin
if (userRole.value !== 'admin') {
  navigateTo('/')
}

const { data: campaigns, pending, refresh } = await useFetch<any[]>('/api/campaigns')

onMounted(() => {
  refresh()
})

const formatAudience = (type: string) => {
  switch (type) {
    case 'all_opted_in': return 'All Opted-In'
    case 'no_job_6_months': return 'No Job (6+ Months)'
    case 'no_job_12_months': return 'No Job (12+ Months)'
    case 'sewer_cleaning': return 'Sewer Cleaning Customers'
    case 'drain_cleaning': return 'Drain Cleaning Customers'
    case 'sewer_inspection': return 'Sewer Inspection Customers'
    case 'emergency_service': return 'Emergency Service Customers'
    default: return type
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-5 pb-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">SMS Campaigns</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">Manage promotional SMS broadcasts</p>
      </div>

      <NuxtLink to="/campaigns/new">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          size="md"
          class="font-bold shadow-xs"
        >
          + New Campaign
        </UButton>
      </NuxtLink>
    </div>

    <!-- Campaigns List -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
    </div>

    <div v-else-if="!campaigns || campaigns.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div class="inline-flex p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-3">
        <UIcon name="i-lucide-message-square" class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">No campaigns yet</h3>
      <p class="text-xs text-slate-500 mt-1">Create your first SMS campaign to engage past customers.</p>
      <NuxtLink to="/campaigns/new" class="mt-4 inline-block">
        <UButton color="primary" size="sm" class="font-bold">
          + Create First Campaign
        </UButton>
      </NuxtLink>
    </div>

    <div v-else class="space-y-3.5">
      <div
        v-for="c in campaigns"
        :key="c.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">{{ c.name }}</h3>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>{{ formatDate(c.createdAt) }}</span>
              <span>•</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ formatAudience(c.audienceType) }}</span>
            </div>
          </div>
          <UBadge
            :color="c.status === 'sent' ? 'success' : c.status === 'sending' ? 'warning' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ c.status.toUpperCase() }}
          </UBadge>
        </div>

        <!-- Message preview -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
          "{{ c.message }}"
        </div>

        <!-- Delivery Stats -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div class="flex gap-4">
            <div>
              <span class="text-slate-400">Recipients: </span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ c.stats?.total || 0 }}</span>
            </div>
            <div>
              <span class="text-slate-400">Sent: </span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ c.stats?.delivered || 0 }}</span>
            </div>
            <div v-if="c.stats?.failed > 0">
              <span class="text-slate-400">Failed: </span>
              <span class="font-bold text-rose-500">{{ c.stats?.failed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
