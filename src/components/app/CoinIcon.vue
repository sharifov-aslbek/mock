<script setup>
// The tanga coin — the single deliberate exception to the platform's
// monochrome-stroke icon rule. Yellow appears here and nowhere else.
defineProps({
  size: { type: [Number, String], default: 20 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <ellipse cx="12" cy="17.2" rx="7.4" ry="3.1" fill="currentColor" opacity=".55" />
    <ellipse cx="12" cy="13.6" rx="7.4" ry="3.1" fill="currentColor" opacity=".78" />
    <ellipse cx="12" cy="10" rx="7.4" ry="3.1" fill="currentColor" />
    <ellipse cx="12" cy="10" rx="4.1" ry="1.55" fill="#0a0a0a" opacity=".14" />
  </svg>
</template>
