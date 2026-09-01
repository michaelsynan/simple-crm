<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { user } = useUserSession()
const userRole = computed(() => (user.value as any)?.role || 'frank')

if (userRole.value !== 'admin') {
  navigateTo('/')
}

const name = ref('')
const message = ref('Hi from Primo Sewer Cleaning! Call us today at (555) 123-4567 for 15% off your next drain or sewer cleaning.')
const audienceType = ref((route.query.audience as string) || 'all_opted_in')

const audienceOptions = [
  { value: 'all_opted_in', label: 'All opted-in customers' },
  { value: 'no_job_6_months', label: 'Customers with no job in 6 months' },
  { value: 'no_job_12_months', label: 'Customers with no job in 12 months' },
  { value: 'sewer_cleaning', label: 'Sewer cleaning customers' },
  { value: 'drain_cleaning', label: 'Drain cleaning customers' },
  { value: 'sewer_inspection', label: 'Sewer inspection customers' },
  { value: 'emergency_service', label: 'Emergency service customers' }
]

// Recipient count estimation
const { data: estimate, pending: estimatePending, refresh: refreshEstimate } = await useFetch<any>('/api/campaigns/estimate', {
  query: computed(() => ({ audienceType: audienceType.value }))
})

watch(audienceType, () => {
  refreshEstimate()
})

const showConfirmModal = ref(false)
const sending = ref(false)
const sendError = ref('')

const handleInitiateSend = () => {
  if (!name.value.trim() || !message.value.trim()) {
    sendError.value = 'Campaign name and SMS message are required.'
    return
  }

  if ((estimate.value?.count || 0) === 0) {
    sendError.value = 'There are no eligible opted-in recipients for this audience.'
    return
  }

  sendError.value = ''
  showConfirmModal.value = true
}

const handleConfirmSend = async () => {
  sending.value = true
  sendError.value = ''

  try {
    const res = await $fetch<{ success: boolean; campaignId: string }>('/api/campaigns', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        message: message.value.trim(),
        audienceType: audienceType.value
      }
    })

    showConfirmModal.value = false
    await router.push('/campaigns')
  } catch (err: any) {
    sendError.value = err.data?.message || err.message || 'Failed to send campaign'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="space-y-5 pb-8">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UButton
        to="/campaigns"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        size="md"
        aria-label="Back"
      />
      <h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-white">
        + New SMS Campaign
      </h1>
    </div>

    <UAlert
      v-if="sendError"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="sendError"
    />

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <!-- Campaign Name -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
          Campaign Name <span class="text-rose-500">*</span>
        </label>
        <UInput
          v-model="name"
          placeholder="e.g. Spring Sewer Special 2026"
          size="lg"
          class="w-full"
          required
        />
      </div>

      <!-- Audience Selection -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Audience <span class="text-rose-500">*</span>
        </label>
        <div class="space-y-2">
          <label
            v-for="opt in audienceOptions"
            :key="opt.value"
            class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
            :class="audienceType === opt.value
              ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/60 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
              : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'"
          >
            <div class="flex items-center gap-3">
              <input
                type="radio"
                name="audience"
                :value="opt.value"
                :checked="audienceType === opt.value"
                class="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                @change="audienceType = opt.value"
              >
              <span class="text-sm font-semibold">{{ opt.label }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Recipient Count Banner -->
      <div class="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
        <div>
          <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Target Recipients</div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            <span v-if="estimatePending">...</span>
            <span v-else>{{ estimate?.count || 0 }}</span>
          </div>
        </div>
        <div class="text-xs text-slate-400 text-right max-w-[160px]">
          Only customers with explicit SMS opt-in & not opted-out
        </div>
      </div>

      <!-- SMS Message Content -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            SMS Message <span class="text-rose-500">*</span>
          </label>
          <span class="text-xs font-mono text-slate-400">
            {{ message.length }} chars ({{ Math.ceil(message.length / 160) || 1 }} segment)
          </span>
        </div>
        <UTextarea
          v-model="message"
          :rows="4"
          placeholder="Write your SMS text message..."
          size="lg"
          class="w-full text-base font-sans"
          required
        />
        <p class="text-[11px] text-slate-400 mt-1">
          Standard carrier opt-out terms apply. Customers can reply STOP to unsubscribe.
        </p>
      </div>
    </div>

    <!-- Submit Button (Opens explicit confirmation modal) -->
    <UButton
      color="primary"
      size="xl"
      block
      class="font-black text-lg py-4 shadow-md active:scale-[0.98] transition-transform"
      :disabled="(estimate?.count || 0) === 0 || !name.trim() || !message.trim()"
      @click="handleInitiateSend"
    >
      Review & Send Campaign
    </UButton>

    <!-- Explicit Confirmation Modal -->
    <UModal v-model:open="showConfirmModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <div class="p-2 bg-amber-100 dark:bg-amber-950/80 rounded-xl">
              <UIcon name="i-lucide-alert-triangle" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-black text-lg text-slate-900 dark:text-white">Confirm SMS Broadcast</h3>
              <p class="text-xs text-slate-500">This will immediately send SMS to customers.</p>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 border border-slate-200 dark:border-slate-700 text-sm">
            <div>
              <span class="font-bold text-slate-400 text-xs uppercase block">Audience:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">
                {{ audienceOptions.find(o => o.value === audienceType)?.label }}
              </span>
            </div>

            <div>
              <span class="font-bold text-slate-400 text-xs uppercase block">Recipients:</span>
              <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {{ estimate?.count || 0 }}
              </span>
            </div>

            <div>
              <span class="font-bold text-slate-400 text-xs uppercase block">Message:</span>
              <p class="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                "{{ message }}"
              </p>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <UButton
              color="neutral"
              variant="subtle"
              size="lg"
              class="flex-1 font-bold"
              :disabled="sending"
              @click="showConfirmModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              size="lg"
              class="flex-1 font-bold"
              :loading="sending"
              @click="handleConfirmSend"
            >
              Send Campaign
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
