<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const customerId = route.params.id as string

const { data: customer, pending, refresh, error } = await useFetch<any>(`/api/customers/${customerId}`)

// Add Job state
const isAddingJob = ref(false)
const jobType = ref('Sewer cleaning')
const jobDate = ref(new Date().toISOString().split('T')[0])
const jobNotes = ref('')
const jobLoading = ref(false)
const jobError = ref('')

const jobTypeOptions = [
  'Sewer cleaning',
  'Drain cleaning',
  'Sewer inspection',
  'Sewer repair',
  'Emergency service',
  'Other'
]

// Edit Customer state
const isEditing = ref(false)
const editName = ref('')
const editPhone = ref('')
const editEmail = ref('')
const editAddress = ref('')
const editLoading = ref(false)

const openEditModal = () => {
  if (!customer.value) return
  editName.value = customer.value.name
  editPhone.value = customer.value.phone
  editEmail.value = customer.value.email || ''
  editAddress.value = customer.value.address || ''
  isEditing.value = true
}

const handleUpdateCustomer = async () => {
  editLoading.value = true
  try {
    await $fetch(`/api/customers/${customerId}`, {
      method: 'PUT',
      body: {
        name: editName.value.trim(),
        phone: editPhone.value.trim(),
        email: editEmail.value.trim() || undefined,
        address: editAddress.value.trim() || undefined
      }
    })
    isEditing.value = false
    await refresh()
  } catch (err: any) {
    alert(err.message || 'Failed to update customer')
  } finally {
    editLoading.value = false
  }
}

const handleAddJob = async () => {
  if (!jobType.value || !jobDate.value) {
    jobError.value = 'Job Type and Job Date are required.'
    return
  }

  jobLoading.value = true
  jobError.value = ''

  try {
    await $fetch('/api/jobs', {
      method: 'POST',
      body: {
        customerId,
        jobType: jobType.value,
        jobDate: jobDate.value,
        notes: jobNotes.value.trim() || undefined
      }
    })
    // Reset form
    jobNotes.value = ''
    isAddingJob.value = false
    await refresh()
  } catch (err: any) {
    jobError.value = err.data?.message || err.message || 'Failed to add job'
  } finally {
    jobLoading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split('-').map(Number)
    const y = parts[0] ?? 2026
    const m = parts[1] ?? 1
    const d = parts[2] ?? 1
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div v-if="pending" class="space-y-4">
    <div class="h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg w-1/3" />
    <div class="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
    <div class="h-60 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
  </div>

  <div v-else-if="error || !customer" class="text-center py-12">
    <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-rose-500 mx-auto mb-2" />
    <h2 class="text-lg font-bold">Customer not found</h2>
    <NuxtLink to="/customers" class="mt-4 inline-block">
      <UButton color="neutral" variant="outline" size="sm">
        Back to Customers
      </UButton>
    </NuxtLink>
  </div>

  <div v-else class="space-y-5 pb-8">
    <!-- Top Navigation Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton
          to="/customers"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="md"
          aria-label="Back to customers"
        />
        <h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
          {{ customer.name }}
        </h1>
      </div>

      <UButton
        icon="i-lucide-edit-3"
        color="neutral"
        variant="subtle"
        size="sm"
        class="font-bold"
        @click="openEditModal"
      >
        Edit
      </UButton>
    </div>

    <!-- Customer Details Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5">
      <!-- Phone with Quick Call / SMS links -->
      <div>
        <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Mobile Phone</div>
        <div class="flex items-center justify-between mt-1">
          <a :href="`tel:${customer.phone}`" class="text-lg font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            {{ customer.phone }}
          </a>
          <div class="flex gap-1.5">
            <a :href="`tel:${customer.phone}`" class="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors">
              <UIcon name="i-lucide-phone" class="w-4 h-4" />
            </a>
            <a :href="`sms:${customer.phone}`" class="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors">
              <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div v-if="customer.email">
        <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Email</div>
        <a :href="`mailto:${customer.email}`" class="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:underline">
          {{ customer.email }}
        </a>
      </div>

      <!-- Address -->
      <div v-if="customer.address">
        <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Service Address</div>
        <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ customer.address }}
        </div>
      </div>

      <!-- SMS Marketing Status -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">SMS Marketing</div>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="customer.smsOptedOut"
            color="error"
            variant="subtle"
            size="md"
            icon="i-lucide-x-circle"
          >
            Opted out
          </UBadge>
          <UBadge
            v-else-if="customer.smsMarketingOptIn"
            color="success"
            variant="subtle"
            size="md"
            icon="i-lucide-check-circle-2"
          >
            Opted in ({{ customer.consentSource || 'Direct' }})
          </UBadge>
          <UBadge
            v-else
            color="neutral"
            variant="subtle"
            size="md"
          >
            Not opted in
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Jobs Section -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-400">
          Jobs History ({{ customer.jobs?.length || 0 }})
        </h2>

        <UButton
          v-if="!isAddingJob"
          icon="i-lucide-plus"
          color="primary"
          size="sm"
          class="font-bold"
          @click="isAddingJob = true"
        >
          + Add Job
        </UButton>
      </div>

      <!-- Add Job Inline Box for Frank -->
      <div v-if="isAddingJob" class="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span class="font-black text-sm text-slate-900 dark:text-white">+ Record New Job</span>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Cancel"
            @click="isAddingJob = false"
          />
        </div>

        <UAlert v-if="jobError" color="error" variant="subtle" :title="jobError" />

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
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-300'
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
            placeholder="Details on what was done..."
            :rows="2"
            size="lg"
            class="w-full"
          />
        </div>

        <div class="flex gap-2 pt-1">
          <UButton
            color="primary"
            size="lg"
            block
            :loading="jobLoading"
            class="font-black"
            @click="handleAddJob"
          >
            Save Job
          </UButton>
        </div>
      </div>

      <!-- Chronological Job List -->
      <div v-if="!customer.jobs || customer.jobs.length === 0" class="text-center py-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <p class="text-xs text-slate-500">No jobs recorded for this customer yet.</p>
        <UButton
          color="primary"
          variant="outline"
          size="sm"
          class="mt-2 font-bold"
          @click="isAddingJob = true"
        >
          + Add First Job
        </UButton>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="job in customer.jobs"
          :key="job.id"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {{ formatDate(job.jobDate) }}
            </span>
            <UBadge color="neutral" variant="outline" size="sm">
              {{ job.jobType }}
            </UBadge>
          </div>

          <p v-if="job.notes" class="text-sm text-slate-700 dark:text-slate-300 mt-2 font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            {{ job.notes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Edit Customer Modal / Form Dialog -->
    <UModal v-model:open="isEditing">
      <template #content>
        <div class="p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-base">Edit Customer</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="isEditing = false" />
          </div>

          <form class="space-y-4" @submit.prevent="handleUpdateCustomer">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Name</label>
              <UInput v-model="editName" size="lg" required class="w-full" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Mobile Phone</label>
              <UInput v-model="editPhone" type="tel" size="lg" required class="w-full" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Email</label>
              <UInput v-model="editEmail" type="email" size="lg" class="w-full" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1">Address</label>
              <UInput v-model="editAddress" size="lg" class="w-full" />
            </div>

            <div class="flex gap-2 pt-2">
              <UButton color="neutral" variant="subtle" size="lg" class="flex-1 font-bold" @click="isEditing = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" size="lg" class="flex-1 font-bold" :loading="editLoading">
                Save Changes
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>
