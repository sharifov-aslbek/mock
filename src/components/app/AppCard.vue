<script setup>
// The platform's one card: white surface, 20px radius, one shadow depth.
// Everything that needs a raised surface uses this so a second depth cannot
// appear — see docs/DESIGN.md.
defineProps({
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <div class="rounded-[20px] bg-app-surface shadow-app-card" :class="padded ? 'p-7' : ''">
    <slot />
  </div>
</template>
