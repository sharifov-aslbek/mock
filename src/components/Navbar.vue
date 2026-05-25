<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { setLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = computed(() => [
  { label: t('navbar.items.math'), to: '/math' },
  { label: t('navbar.items.physics'), to: '/fizika' },
  { label: t('navbar.items.chemistry'), to: '/kimyo' },
  { label: t('navbar.result'), to: '/result-exam' },
  { label: t('navbar.pricing'), to: '/pricing' },
])

const currentUser = computed(
  () => authStore.userInfo as { firstName?: string; fullName?: string } | null,
)

const userName = computed(
  () => currentUser.value?.firstName || currentUser.value?.fullName || 'Foydalanuvchi',
)

const userInitial = computed(() => {
  const source = currentUser.value?.firstName || currentUser.value?.fullName || ''
  const trimmed = source.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?'
})

const localeModel = computed({
  get: () => locale.value,
  set: (value: string) => {
    setLocale(value)
  },
})

const isActiveItem = (item: { to?: string | Record<string, unknown>; label: string }) => {
  if (typeof item.to === 'string') {
    return route.path === item.to
  }

  if (item.label === t('navbar.result')) {
    return route.path === '/result-exam'
  }

  return false
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleLogout = async () => {
  authStore.logout()
  authStore.userInfo = null
  isUserMenuOpen.value = false
  closeMobileMenu()
  await router.push('/login')
}

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.userInfo) {
    authStore.getUserInfo()
  }
})
</script>

<template>
  <header class="sticky top-0 z-[100] h-16 w-full border-b border-[#1a1a1a] bg-[#0a0a0a] text-white">
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <router-link to="/" class="flex shrink-0 items-center gap-2" @click="closeMobileMenu">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1e1e1e]">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.9" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.4" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.4" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.9" />
          </svg>
        </span>
        <span class="text-[17px] font-bold tracking-[-0.025em] text-white">MilliyMock</span>
      </router-link>

      <nav class="hidden h-full items-center lg:flex">
        <component
          v-for="item in navItems"
          :key="item.label"
          :is="item.to ? 'router-link' : 'a'"
          :to="item.to"
          :href="item.href"
          class="flex h-16 items-center gap-1 border-b-2 px-4 text-[14px] transition-colors xl:px-5"
          :class="isActiveItem(item) ? 'border-white font-medium text-white' : 'border-transparent font-normal text-[#888] hover:text-white'"
        >
          {{ item.label }}
          <svg
            v-if="item.hasDropdown"
            class="ml-0.5 h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </component>
      </nav>

      <div class="flex shrink-0 items-center gap-2">
        <select
          v-model="localeModel"
          class="hidden rounded-md border border-transparent bg-transparent px-2.5 py-1.5 text-[13px] text-[#888] outline-none transition hover:bg-white/10 sm:block"
        >
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
        </select>

        <router-link v-if="!authStore.userInfo" to="/login" class="hidden sm:block">
          <button class="rounded-full border border-[#333] bg-[#1e1e1e] px-5 py-2 text-[14px] font-medium text-white transition hover:opacity-90">
            {{ t('navbar.bookDemo') }}
          </button>
        </router-link>

        <div v-else class="relative hidden sm:block">
          <button
            type="button"
            class="flex items-center gap-2.5 rounded-full border border-[#333] bg-[#1e1e1e] px-3.5 py-2 transition hover:opacity-90"
            @click="toggleUserMenu"
          >
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[12px] font-semibold uppercase text-white">
              {{ userInitial }}
            </span>
            <span class="max-w-[180px] truncate text-[14px] font-medium text-white">{{ userName }}</span>
          </button>

          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] py-1 shadow-xl"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2.5 text-[14px] text-[#e0e0e0] transition hover:bg-white/5"
              @click="isUserMenuOpen = false"
            >
              Profil
            </router-link>
            <a href="#" class="block px-4 py-2.5 text-[14px] text-[#e0e0e0] transition hover:bg-white/5">
              Sozlamalar
            </a>
            <div class="my-1 border-t border-[#2a2a2a]"></div>
            <button
              type="button"
              class="block w-full px-4 py-2.5 text-left text-[14px] text-[#f87171] transition hover:bg-white/5"
              @click="handleLogout"
            >
              Chiqish
            </button>
          </div>
        </div>

        <router-link
          v-if="authStore.userInfo"
          to="/profile"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-[14px] font-semibold uppercase text-white sm:hidden"
        >
          {{ userInitial }}
        </router-link>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-[#aaa] transition hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
          @click="isMobileMenuOpen = true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-[200] bg-black/60"
      @click="closeMobileMenu"
    >
      <aside
        class="absolute right-0 top-0 flex h-full w-80 max-w-[86vw] flex-col border-l border-[#1a1a1a] bg-[#0a0a0a]"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-[#1a1a1a] px-5 py-4">
          <router-link to="/" class="flex items-center gap-2" @click="closeMobileMenu">
            <span class="flex h-7 w-7 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#1e1e1e]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.9" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.4" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.4" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="#fff" fill-opacity="0.9" />
              </svg>
            </span>
            <span class="text-base font-bold text-white">MilliyMock</span>
          </router-link>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-full text-[#888] transition hover:bg-white/10"
            aria-label="Close menu"
            @click="closeMobileMenu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="border-b border-[#1a1a1a] px-5 py-4">
          <div v-if="authStore.userInfo" class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-[16px] font-semibold uppercase text-white">
              {{ userInitial }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-[14px] font-semibold text-white">{{ userName }}</p>
              <p class="text-xs uppercase text-[#666]">{{ localeModel }}</p>
            </div>
          </div>

          <router-link v-else to="/login" class="block" @click="closeMobileMenu">
            <button class="w-full rounded-full border border-[#333] bg-[#1e1e1e] px-4 py-2.5 text-[14px] font-medium text-white">
              {{ t('navbar.bookDemo') }}
            </button>
          </router-link>
        </div>

        <nav class="flex-1 overflow-y-auto py-2">
          <component
            v-for="item in navItems"
            :key="item.label"
            :is="item.to ? 'router-link' : 'a'"
            :to="item.to"
            :href="item.href"
            class="flex items-center justify-between border-l-2 px-5 py-3.5 text-[15px] transition"
            :class="isActiveItem(item) ? 'border-white bg-[#1a1a1a] font-semibold text-white' : 'border-transparent font-normal text-[#888] hover:bg-white/5 hover:text-white'"
            @click="closeMobileMenu"
          >
            <span>{{ item.label }}</span>
            <svg
              v-if="item.hasDropdown"
              class="h-4 w-4 text-[#555]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </component>
        </nav>

        <div class="border-t border-[#1a1a1a] px-5 py-4">
          <button
            v-if="authStore.userInfo"
            type="button"
            class="block py-2 text-[14px] text-[#f87171]"
            @click="handleLogout"
          >
            Chiqish
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
