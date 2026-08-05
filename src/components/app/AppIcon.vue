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
  arrowLeft: ['M19 12H5', 'm11 18-6-6 6-6'],
  arrowUp: ['M12 19V5', 'm6 11 6-6 6 6'],
  search: ['M11 18.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z', 'm20.5 20.5-4.2-4.2'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M18 6 6 18', 'M6 6l12 12'],

  // Subject icons. Same 24 grid and 1.7 stroke as everything above, so a grid of
  // mixed subjects reads as one system rather than assorted marks. One icon per
  // subject, referenced from components/app/subjects.js — never inline.
  calculator: [
    'M7 3h10a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 7 3Z',
    'M8.7 6.5h6.6v3H8.7Z',
    'M9 13.2h.01',
    'M12 13.2h.01',
    'M15 13.2h.01',
    'M9 16.9h.01',
    'M12 16.9h.01',
    'M15 16.9h.01',
  ],
  // Two orbits at ±45° drawn as rotated-ellipse arcs, nucleus in the middle.
  atom: [
    'M12 13.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
    'M18.7 18.7A9.5 4 45 1 1 5.3 5.3 9.5 4 45 1 1 18.7 18.7Z',
    'M18.7 5.3A9.5 4 -45 1 1 5.3 18.7 9.5 4 -45 1 1 18.7 5.3Z',
  ],
  flask: [
    'M9 3h6',
    'M10 3v6.6a2 2 0 0 1-.28 1.02l-4.4 7.4A1.5 1.5 0 0 0 6.6 20.3h10.8a1.5 1.5 0 0 0 1.28-2.28l-4.4-7.4A2 2 0 0 1 14 9.6V3',
    'M7.7 15.2h8.6',
  ],
  landmark: [
    'M12 3.5 19.6 8.2H4.4Z',
    'M4 10.6h16',
    'M6.4 10.6v6.9',
    'M10.1 10.6v6.9',
    'M13.9 10.6v6.9',
    'M17.6 10.6v6.9',
    'M3.4 20.4h17.2',
  ],
  globe: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    'M3.4 9.2h17.2',
    'M3.4 14.8h17.2',
    'M12 3a14 14 0 0 1 3.6 9 14 14 0 0 1-3.6 9 14 14 0 0 1-3.6-9 14 14 0 0 1 3.6-9Z',
  ],
  languages: [
    'M2.6 6.2h10.8',
    'M8 3.4v2.8',
    'M11.2 6.2c0 4-3.1 7.7-7.4 9.6',
    'M6.1 11.4c1 2 2.9 3.6 5.1 4.4',
    'm21.4 20.8-4.2-8.8-4.2 8.8',
    'M14.3 17.6h5.8',
  ],
  monitor: [
    'M4.2 4.6h15.6a1.7 1.7 0 0 1 1.7 1.7v8.8a1.7 1.7 0 0 1-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7V6.3a1.7 1.7 0 0 1 1.7-1.7Z',
    'M9 20h6',
    'M12 16.8V20',
  ],
  leaf: [
    'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z',
    'M2.5 20.6c0-2.9 1.9-5.2 5-5.8 2.4-.5 4.5-2 5.5-3.3',
  ],
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
