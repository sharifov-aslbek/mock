<script setup>
import { TELEGRAM_BOT_VERIFY_URL } from '@/utils/telegramBot'

// A link into @milliymock_bot, styled like the Telegram sign-in button so it
// reads as "this opens Telegram". Two uses:
//  - `primary` on /register's code screen, pointing at the registration's own
//    `botUrl` (the deep link that carries the ticket);
//  - `outline` under any existing-account code screen, pointing at the generic
//    `?start=verify` link (the default href) so the user can fetch a pending
//    code from the bot when SMS didn't come.
// `target="_blank"`: on a phone the t.me link opens the Telegram app; on desktop
// it opens Telegram Web / the desktop app in a new tab while this page keeps
// its state.
defineProps({
  href: { type: String, default: TELEGRAM_BOT_VERIFY_URL },
  label: { type: String, required: true },
  variant: { type: String, default: 'outline' },
})
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener"
    class="inline-flex w-full items-center justify-center gap-2.5 rounded-full text-sm font-semibold transition active:scale-[0.99]"
    :class="
      variant === 'primary'
        ? 'h-12 bg-[#29a9eb] px-5 text-white shadow-[0_6px_16px_rgba(41,169,235,0.28)] hover:bg-[#1e97d6]'
        : 'h-11 border-[1.5px] border-[#29a9eb] px-5 text-[#1f8fcb] hover:bg-[#29a9eb] hover:text-white'
    "
  >
    <svg class="h-[18px] w-[18px] shrink-0" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
      <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
    </svg>
    {{ label }}
  </a>
</template>
