<script setup>
import { NAvatar, NBadge, NButton } from 'naive-ui'
import DashboardIcon from '@/components/DashboardIcon.vue'

defineProps({
  sectionTitle: {
    type: String,
    default: 'Dashboard'
  },
  modeLabel: {
    type: String,
    default: 'Admin'
  },
  userName: {
    type: String,
    default: 'MilliyMock Admin'
  },
  userRole: {
    type: String,
    default: 'Administrator'
  },
  avatarLetter: {
    type: String,
    default: 'M'
  }
})

defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="flex h-20 items-center justify-between border-b border-black/10 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
    <div class="flex items-center gap-3">
      <NButton
        quaternary
        circle
        class="lg:hidden"
        @click="$emit('toggle-sidebar')"
      >
        <template #icon>
          <DashboardIcon name="menu" class-name="h-5 w-5" />
        </template>
      </NButton>

      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{{ modeLabel }} / {{ sectionTitle }}</p>
        <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-900">{{ sectionTitle }}</h1>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <NButton quaternary circle>
        <template #icon>
          <DashboardIcon name="search" class-name="h-5 w-5" />
        </template>
      </NButton>

      <NButton quaternary circle>
        <template #icon>
          <DashboardIcon name="help" class-name="h-5 w-5" />
        </template>
      </NButton>

      <NBadge value="2+" color="#ef4444">
        <NButton quaternary circle>
          <template #icon>
            <DashboardIcon name="bell" class-name="h-5 w-5" />
          </template>
        </NButton>
      </NBadge>

      <div class="hidden items-center gap-3 rounded-full border border-slate-200 px-2 py-1 sm:flex">
        <NAvatar round color="#111111">{{ avatarLetter }}</NAvatar>
        <div class="pr-2">
          <p class="text-sm font-semibold text-slate-900">{{ userName }}</p>
          <p class="text-xs text-slate-500">{{ userRole }}</p>
        </div>
      </div>
    </div>
  </header>
</template>
