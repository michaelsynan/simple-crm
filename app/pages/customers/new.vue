<script setup lang="ts">
const router = useRouter()

// Customer Fields
const name = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')

// SMS Consent Fields
const smsMarketingOptIn = ref(false) // Required unchecked by default
const consentSource = ref<'In person' | 'Phone' | 'Website' | 'Other'>('In person')

// Job Fields
const jobType = ref('Sewer cleaning')
const jobDate = ref(new Date().toISOString().split('T')[0])
const jobNotes = ref('')

const consentSourceOptions = ['In person', 'Phone', 'Website', 'Other']
const jobTypeOptions = [
  'Sewer cleaning',
  'Drain cleaning',
  'Sewer inspection',
  'Sewer repair',
  'Emergency service',
  'Other'
]

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSaveCustomer = async () => {
  if (!name.value.trim() || !phone.value.trim()) {
    errorMessage.value = 'Name and Mobile Phone are required.'
    return
  }

  if (!jobType.value || !jobDate.value) {
    errorMessage.value = 'Job Type and Job Date are required.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await $fetch<{ success: boolean; customerId: string }>('/api/customers', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim() || undefined,
        address: address.value.trim() || undefined,
        smsMarketingOptIn: smsMarketingOptIn.value,
        consentSource: smsMarketingOptIn.value ? consentSource.value : undefined,
        jobType: jobType.value,
        jobDate: jobDate.value,
        jobNotes: jobNotes.value.trim() || undefined
      }
    })

    successMessage.value = 'Customer saved successfully!'
    setTimeout(() => {
      router.push(`/customers/${res.customerId}`)
    }, 400)
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Failed to save customer.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5 pb-8">
    <!-- Top Bar Navigation -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton
          to="/"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="md"
          aria-label="Back"
        />
        <h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          + New Customer
        </h1>
      </div>
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      :title="errorMessage"
    />

    <UAlert
      v-if="successMessage"
      color="success"
      variant="subtle"
      icon="i-lucide-check-circle-2"
      :title="successMessage"
    />

    <form class="space-y-6" @submit.prevent="handleSaveCustomer">
      <!-- Section 1: Customer Information -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">Customer Info</h2>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Name <span class="text-rose-500">*</span>
          </label>
          <UInput
            v-model="name"
            placeholder="John Doe"
            size="xl"
            class="w-full text-base"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Mobile Phone <span class="text-rose-500">*</span>
          </label>
          <UInput
            v-model="phone"
            type="tel"
            placeholder="(555) 000-0000"
            size="xl"
            class="w-full text-base"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Email <span class="text-slate-400 font-normal">(Optional)</span>
          </label>
          <UInput
            v-model="email"
            type="email"
            placeholder="john@example.com"
            size="lg"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Service Address <span class="text-slate-400 font-normal">(Optional)</span>
          </label>
          <UInput
            v-model="address"
            placeholder="123 Main St, Springfield"
            size="lg"
            class="w-full"
          />
        </div>
      </div>

      <!-- Section 2: SMS Marketing Consent (Required Unchecked by default) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">SMS Marketing Consent</h2>

        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <UCheckbox
              v-model="smsMarketingOptIn"
              class="mt-1"
              size="lg"
            />
            <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              Customer agreed to receive promotional text messages from Primo Sewer Cleaning.
            </span>
          </label>
        </div>

        <div v-if="smsMarketingOptIn" class="space-y-1.5 animate-in fade-in duration-200">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Consent Source
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="source in consentSourceOptions"
              :key="source"
              type="button"
              class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center"
              :class="consentSource === source
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-300 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'"
              @click="consentSource = source as any"
            >
              {{ source }}
            </button>
          </div>
        </div>
      </div>

      <!-- Section 3: Job Information -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">Initial Job</h2>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Job Type <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="jt in jobTypeOptions"
              :key="jt"
              type="button"
              class="py-2.5 px-2 rounded-xl border text-xs font-bold transition-all text-center"
              :class="jobType === jt
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-300 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'"
              @click="jobType = jt"
            >
              {{ jt }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Job Date <span class="text-rose-500">*</span>
          </label>
          <UInput
            v-model="jobDate"
            type="date"
            size="lg"
            class="w-full font-medium"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Notes <span class="text-slate-400 font-normal">(Optional)</span>
          </label>
          <UTextarea
            v-model="jobNotes"
            placeholder="Cleared main sewer line from cleanout..."
            :rows="2"
            size="lg"
            class="w-full"
          />
        </div>
      </div>

      <!-- Save Button -->
      <UButton
        type="submit"
        color="primary"
        size="xl"
        block
        :loading="loading"
        class="font-black text-lg py-4 shadow-md active:scale-[0.98] transition-transform"
      >
        Save Customer
      </UButton>
    </form>
  </div>
</template>
