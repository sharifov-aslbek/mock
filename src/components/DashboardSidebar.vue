<script setup>
import { computed, ref } from 'vue'
import DashboardIcon from '@/components/DashboardIcon.vue'
import logoBlack from '@/assets/logo-black.jpg'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  activeSection: {
    type: String,
    default: 'dashboard'
  },
  items: {
    type: Array,
    default: () => []
  },
  brandLabel: {
    type: String,
    default: 'MILLIY'
  },
  roleLabel: {
    type: String,
    default: 'ADMIN'
  }
})

const emit = defineEmits(['select'])

const openGroups = ref({
  payments: false,
  auth: false,
  tests: false,
  profile: false
})

const items = computed(() => props.items)

const toggleGroup = (key) => {
  openGroups.value[key] = !openGroups.value[key]
}

const handleItemClick = (item) => {
  if (item.children) {
    toggleGroup(item.key)
  }

  emit('select', item.key)
}

const handleChildClick = (parentKey, child) => {
  emit('select', `${parentKey}:${child}`)
}
</script>

<template>
  <aside class="flex h-full flex-col border-r border-black/10 bg-white/90 backdrop-blur-xl">
    <div class="border-b border-black/10 px-6 py-7">
      <div class="flex items-center gap-3 text-black">
        <img :src="logoBlack" :alt="brandLabel" class="h-9 w-auto object-contain" />
        <span v-if="!collapsed" class="text-xs font-bold tracking-[0.22em]">{{ roleLabel }}</span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-4">
      <div
        v-for="item in items"
        :key="item.key"
        class="px-2"
      >
        <button
          class="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[15px] font-semibold transition"
          :class="
            props.activeSection === item.key || props.activeSection.startsWith(`${item.key}:`)
              ? 'bg-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]'
              : 'text-slate-700 hover:bg-black/5'
          "
          @click="handleItemClick(item)"
        >
          <DashboardIcon :name="item.icon" class-name="h-6 w-6 shrink-0" />
          <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
          <DashboardIcon
            v-if="item.children && !collapsed"
            name="chevron"
            class-name="h-4 w-4 transition"
            :class="openGroups[item.key] ? 'rotate-180' : ''"
          />
        </button>

        <div
          v-if="item.children && openGroups[item.key] && !collapsed"
          class="ml-14 space-y-2 pb-3 pt-1"
        >
          <button
            v-for="child in item.children"
            :key="child"
            class="w-full rounded-xl px-4 py-2 text-left text-sm transition"
            :class="
              props.activeSection === `${item.key}:${child}`
                ? 'bg-black/[0.06] font-semibold text-black'
                : 'text-slate-500 hover:bg-black/5 hover:text-slate-900'
            "
            @click.stop="handleChildClick(item.key, child)"
          >
            {{ child }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
