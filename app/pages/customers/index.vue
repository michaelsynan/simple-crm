<script setup lang="ts">
const searchQuery = ref('')
const debouncedSearch = ref('')

let timeout: NodeJS.Timeout
watch(searchQuery, (val) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    debouncedSearch.value = val
  }, 250)
})

const { data: customers, pending, refresh } = await useFetch<any[]>('/api/customers', {
  query: computed(() => ({
    search: debouncedSearch.value || undefined
  }))
})

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header & Action -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Customers</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ customers?.length || 0 }} total records
        </p>
      </div>

      <NuxtLink to="/customers/new">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          size="md"
          class="font-bold shadow-xs"
        >
          New Customer
        </UButton>
      </NuxtLink>
    </div>

    <!-- Search Box (Instant filter by name, phone, or email) -->
    <div>
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search by name, phone, or email..."
        size="xl"
        class="w-full text-base"
        :trailing="Boolean(searchQuery)"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="link"
            size="xs"
            aria-label="Clear search"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>
    </div>

    <!-- Customer List -->
    <div v-if="pending" class="space-y-2 pt-2">
      <div v-for="i in 5" :key="i" class="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
    </div>

    <div v-else-if="!customers || customers.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <div class="inline-flex p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-3">
        <UIcon name="i-lucide-users" class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">No customers found</h3>
      <p class="text-xs text-slate-500 mt-1">
        {{ searchQuery ? `No results for "${searchQuery}"` : 'Get started by adding your first customer.' }}
      </p>
      <NuxtLink to="/customers/new" class="mt-4 inline-block">
        <UButton color="primary" size="sm" class="font-bold">
          + Add New Customer
        </UButton>
      </NuxtLink>
    </div>

    <div v-else class="space-y-2.5 pt-1">
      <NuxtLink
        v-for="c in customers"
        :key="c.id"
        :to="`/customers/${c.id}`"
        class="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 active:scale-[0.99] transition-all p-4 rounded-2xl shadow-xs"
      >
        <div class="flex items-center justify-between gap-2">
          <!-- Left info: Name & Phone -->
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-bold text-base text-slate-900 dark:text-white truncate">
                {{ c.name }}
              </span>
              <UBadge
                v-if="c.smsOptedOut"
                color="error"
                variant="subtle"
                size="xs"
              >
                Opted Out
              </UBadge>
              <UBadge
                v-else-if="c.smsMarketingOptIn"
                color="success"
                variant="subtle"
                size="xs"
              >
                SMS Opt-in
              </UBadge>
            </div>
            <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {{ c.phone }}
            </div>
          </div>

          <!-- Right info: Last job date & Arrow -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="text-right">
              <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Last Job</div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                {{ c.lastJobDate || 'None' }}
              </div>
            </div>
            <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-slate-400 ml-1" />
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
