<script setup>
// Footer, from `MilliyMock Landing.dc.html`.
// TODO(design): same temporary logo stand-in as LandingNavbar.vue.
import logoLockup from '@/assets/logo-black.jpg'
</script>

<template>
  <footer
    class="mx-auto box-content flex max-w-[1280px] flex-col items-center gap-[18px] px-[20px] pb-[64px] pt-[24px] sm:px-[32px] lg:px-[48px]"
  >
    <img :src="logoLockup" alt="Milliy Mock" width="95" height="24" class="block h-[24px] w-auto" />
    <div class="text-center text-[14px] text-footer-text">
      © 2026 Milliy Mock. Barcha huquqlar himoyalangan.
    </div>
  </footer>
</template>
