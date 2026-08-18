<script setup>
// Footer, expanded from `MilliyMock Landing.dc.html` — the design's version was
// a logo and a copyright line, i.e. a dead end at the bottom of the page.
//
// Every entry below is a route that exists. The brief also asked for Biz
// haqimizda, Aloqa, Ommaviy oferta and Maxfiylik siyosati: none of them are
// built, so they are omitted rather than shipped as href="#" (which is what the
// old platform footer does). The subject links do double duty — they are the
// site-wide internal links into the indexed subject pages.
import logoLockup from '@/assets/landing/logo-lockup.png'

const columns = [
  {
    title: 'Fanlar',
    links: [
      { label: 'Matematika', to: '/math' },
      { label: 'Ona tili', to: '/ona-tili' },
      { label: 'Tarix', to: '/tarix' },
      { label: 'Biologiya', to: '/biologiya' },
      { label: 'Fizika', to: '/fizika' },
    ],
  },
  {
    title: 'Platforma',
    links: [
      { label: 'Platforma', to: '/platforma' },
      { label: 'Essay tekshirish', to: '/essay-tekshirish' },
      { label: 'Kurslar', to: '/kurslar' },
      { label: 'Narxlar', to: '/narxlar' },
    ],
  },
  {
    title: 'Hamjamiyat',
    links: [
      { label: 'Natijalar', to: '/natijalar' },
      { label: 'Fikrlar', to: '/fikrlar' },
    ],
  },
]

// Telegram is the contact channel that actually exists — the channel for
// announcements, the support account for questions and manual payments.
const contacts = [
  { label: 'Telegram kanal', href: 'https://t.me/milliymockuz' },
  { label: 'Yordam: @Milliymocksupport', href: 'https://t.me/Milliymocksupport' },
]
</script>

<template>
  <footer
    class="mx-auto box-content max-w-[1280px] px-[20px] pb-[48px] pt-[80px] sm:px-[32px] lg:px-[48px]"
  >
    <div class="grid grid-cols-2 gap-x-[32px] gap-y-[40px] sm:grid-cols-4 lg:gap-x-[48px]">
      <div class="col-span-2 sm:col-span-1">
        <RouterLink
          to="/"
          class="inline-flex rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <img
            :src="logoLockup"
            alt="Milliy Mock"
            width="95"
            height="24"
            class="block h-[24px] w-auto"
          />
        </RouterLink>
        <p class="mt-[16px] max-w-[240px] text-[14px] leading-[1.6] text-muted">
          Milliy Sertifikat imtihoniga real format bo'yicha tayyorgarlik.
        </p>
      </div>

      <div v-for="column in columns" :key="column.title">
        <h2 class="mb-[16px] text-[13px] font-semibold tracking-[0.08em] text-ink uppercase">
          {{ column.title }}
        </h2>
        <ul class="flex flex-col gap-[12px]">
          <li v-for="link in column.links" :key="link.label">
            <RouterLink
              :to="link.to"
              class="rounded-sm text-[15px] text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="mt-[48px] flex flex-col gap-[16px] border-t border-hairline pt-[24px] sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="text-[14px] text-footer-text">
        © 2026 Milliy Mock. Barcha huquqlar himoyalangan.
      </div>
      <div class="flex flex-wrap gap-x-[24px] gap-y-[8px]">
        <a
          v-for="contact in contacts"
          :key="contact.href"
          :href="contact.href"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-sm text-[14px] text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          {{ contact.label }}
        </a>
      </div>
    </div>
  </footer>
</template>
