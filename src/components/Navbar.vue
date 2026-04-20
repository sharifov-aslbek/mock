<script setup lang="ts">
import { computed, ref , onMounted} from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const isMenuOpen = ref(false)
const { t, locale } = useI18n()
const authStore = useAuthStore()
const navItems = computed(() => [
  { name: t('navbar.items.sat'), href: '#' },
  { name: t('navbar.items.act'), href: '#' },
  { name: t('navbar.items.math'), to: '/math' },
  { name: t('navbar.items.psat'), href: '#' },
  { name: t('navbar.items.shsat'), href: '#' },
])

const localeModel = computed({
  get: () => locale.value,
  set: (value: string) => {
    setLocale(value)
  }
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}


onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.getUserInfo()
  }
})
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center" @click="closeMenu">
          <div class="text-lg font-bold sm:text-xl md:text-2xl">⋮ MilliyMock</div>
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden items-center space-x-8 md:flex">
          <component
            v-for="item in navItems"
            :key="item.name"
            :is="item.to ? 'router-link' : 'a'"
            :to="item.to"
            :href="item.href"
            class="transition cursor-pointer hover:text-blue-400"
          >
            {{ item.name }}
          </component>

          <router-link to="/pricing" class="transition hover:text-blue-400">
            {{ t('navbar.pricing') }}
          </router-link>

          <router-link
            :to="{ path: '/math', query: { tab: 'attempted' } }"
            class="transition hover:text-blue-400"
          >
            {{ t('navbar.result') }}
          </router-link>

          <div class="cursor-pointer items-center space-x-1 transition hover:text-blue-400 flex">
            <span>{{ t('navbar.resources') }}</span>
            <span class="text-xs">▼</span>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-3">
          <select
            v-model="localeModel"
            class="hidden rounded-lg border border-white/10 bg-black px-3 py-2 text-xs font-semibold text-white outline-none transition md:block"
          >
            <option value="uz">{{ t('navbar.languages.uz') }}</option>
            <option value="ru">{{ t('navbar.languages.ru') }}</option>
          </select>

          <!-- Desktop Button -->
          <router-link v-if="!authStore.userInfo" to="/login" class="hidden md:block">
            <button
              class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {{ t('navbar.bookDemo') }}
            </button>
          </router-link>

            <router-link v-else to="/profile">
              <button
                class="hidden md:inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75a17.933 17.933 0 0 1-7.5-1.632Z"
                  />
                </svg>
                {{ authStore.userInfo?.fullName }}
              </button>
            </router-link>

          <!-- Mobile Menu Button -->
          <button
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 md:hidden"
            @click="toggleMenu"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!isMenuOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile / Tablet Menu -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isMenuOpen"
          class="border-t border-white/10 py-4 md:hidden"
        >
          <div class="flex flex-col space-y-4">
            <component
              v-for="item in navItems"
              :key="item.name"
              :is="item.to ? 'router-link' : 'a'"
              :to="item.to"
              :href="item.href"
              class="rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 hover:text-blue-400"
              @click="closeMenu"
            >
              {{ item.name }}
            </component>

            <router-link
              to="/pricing"
              class="rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 hover:text-blue-400"
              @click="closeMenu"
            >
              {{ t('navbar.pricing') }}
            </router-link>

            <router-link
              :to="{ path: '/math', query: { tab: 'attempted' } }"
              class="rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 hover:text-blue-400"
              @click="closeMenu"
            >
              {{ t('navbar.result') }}
            </router-link>

            <div
              class="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 hover:text-blue-400"
            >
              <span>{{ t('navbar.resources') }}</span>
              <span class="text-xs">▼</span>
            </div>

            <select
              v-model="localeModel"
              class="rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none"
            >
              <option value="uz">{{ t('navbar.languages.uz') }}</option>
              <option value="ru">{{ t('navbar.languages.ru') }}</option>
            </select>

            <router-link
              v-if="!authStore.userInfo"
              to="/login"
              @click="closeMenu"
            >
              <button
                class="mt-2 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                {{ t('navbar.bookDemo') }}
              </button>
            </router-link>

            <router-link
              v-else
              to="/profile"
              @click="closeMenu"
            >
              <button
                class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75a17.933 17.933 0 0 1-7.5-1.632Z"
                  />
                </svg>
                {{ authStore.userInfo?.fullName }}
              </button>
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>
