<script setup>
// The platform's only icon style: thin (1.7) dark stroke on a 24 grid, round
// caps and joins. Every platform icon comes from here so a second style cannot
// creep in — see docs/DESIGN.md.
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
})

const paths = {
  home: ['M4 10.5 12 4l8 6.5', 'M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8'],
  tests: ['M8 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z', 'M10 9h4', 'M10 13h4', 'M10 17h2'],
  essay: ['M12 20h8', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z'],
  results: ['M5 20V12', 'M12 20V5', 'M19 20v-5'],
  coins: ['M12 21c4.97 0 9-1.79 9-4V7c0-2.21-4.03-4-9-4S3 4.79 3 7v10c0 2.21 4.03 4 9 4Z', 'M21 12c0 2.21-4.03 4-9 4s-9-1.79-9-4'],
  help: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.7-2.6 2.7', 'M12 17.2h.01'],
  settings: ['M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z', 'M19.1 14.6a1.6 1.6 0 0 0 .32 1.76l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-2.72 1.14v.17a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-2.8-1.1l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.07-.06a1.6 1.6 0 0 0-1.14-2.72h-.17a1.9 1.9 0 1 1 0-3.8h.09a1.6 1.6 0 0 0 1.1-2.8l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.05.06a1.6 1.6 0 0 0 2.72-1.14v-.17a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 2.8 1.1l.05-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.05a1.6 1.6 0 0 0 1.14 2.72h.17a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.47.98Z'],
  community: ['M16.5 20v-1.7a3.4 3.4 0 0 0-3.4-3.4H6.9a3.4 3.4 0 0 0-3.4 3.4V20', 'M10 11.6a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z', 'M20.5 20v-1.7a3.4 3.4 0 0 0-2.6-3.3', 'M15.5 4.9a3.4 3.4 0 0 1 0 6.6'],
  bell: ['M18 8.6a6 6 0 1 0-12 0c0 6-2.4 7.7-2.4 7.7h16.8S18 14.6 18 8.6', 'M13.7 20a2 2 0 0 1-3.4 0'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5.2l3.2 1.9'],
  trend: ['M3 17.5 9.5 11l4 4L21 7.5', 'M15.5 7.5H21v5.5'],
  book: ['M3 4.5h5a3.5 3.5 0 0 1 3.5 3.5v11a2.6 2.6 0 0 0-2.6-2.6H3Z', 'M21 4.5h-5A3.5 3.5 0 0 0 12.5 8v11a2.6 2.6 0 0 1 2.6-2.6H21Z'],
  chevronDown: ['m6 9.5 6 6 6-6'],
  arrowRight: ['M5 12h14', 'm13 6 6 6-6 6'],
  arrowUp: ['M12 19V5', 'm6 11 6-6 6 6'],
  search: ['M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z', 'm20.5 20.5-4.2-4.2'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
}
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(dAttr, i) in paths[props.name] || []" :key="i" :d="dAttr" />
  </svg>
</template>
