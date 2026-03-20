<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const navItems = [
  { name: 'SAT', href: '#' },
  { name: 'ACT', href: '#' },
  { name: 'Math', to: '/math' },
  { name: 'PSAT', href: '#' },
  { name: 'SHSAT', href: '#' },
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
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
            class="transition hover:text-blue-400"
          >
            {{ item.name }}
          </component>

          <router-link to="/pricing" class="transition hover:text-blue-400">
            Pricing
          </router-link>

          <div class="cursor-pointer items-center space-x-1 transition hover:text-blue-400 flex">
            <span>Resources</span>
            <span class="text-xs">▼</span>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-3">
          <!-- Desktop Button -->
          <router-link to="/login" class="hidden md:block">
            <button
              class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Book a Demo
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
              Pricing
            </router-link>

            <div
              class="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-white/5 hover:text-blue-400"
            >
              <span>Resources</span>
              <span class="text-xs">▼</span>
            </div>

            <router-link to="/login" @click="closeMenu">
              <button
                class="mt-2 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Book a Demo
              </button>
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>
