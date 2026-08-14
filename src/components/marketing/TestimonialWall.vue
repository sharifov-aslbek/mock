<script setup>
// The Fikrlar wall: three columns of quotes drifting past at different speeds,
// middle column against the outer two, the whole block faded out top and bottom
// so it reads as a pool rather than a list with ends.
//
// Each column renders its cards twice and the track travels exactly one copy's
// height (see .testimonial-track in main.css), which is what makes the loop
// seamless. Hovering a column stops it so a quote can actually be read.
//
// Avatars are initials on a tile, the same device the platform's own sidebar
// uses. Deliberately not photographs: a stock face attached to a named student
// is a fabricated person, whatever the quote says.
const props = defineProps({
  // [{ quote, name, role }]
  items: { type: Array, required: true },
  columns: { type: Number, default: 3 },
})

// Dealt round-robin so the columns stay even however many quotes arrive.
const columnsOf = (items, count) => {
  const out = Array.from({ length: count }, () => [])
  items.forEach((item, index) => out[index % count].push(item))
  return out
}

const initial = (name) => String(name || '?').trim().charAt(0).toUpperCase()

// Different durations per column, so the three never lock into step.
const SPEEDS = ['64s', '52s', '72s']
</script>

<template>
  <div
    class="[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
  >
    <div class="grid h-[620px] grid-cols-1 gap-[16px] sm:grid-cols-2 lg:h-[780px] lg:grid-cols-3">
      <div
        v-for="(column, columnIndex) in columnsOf(items, columns)"
        :key="columnIndex"
        class="testimonial-column relative overflow-hidden"
        :class="[
          // One column on a phone, two at sm, three at lg. Without this the
          // hidden columns still occupied grid rows and the wall became three
          // full-height marquees stacked down the page.
          columnIndex === 1 ? 'hidden sm:block' : '',
          columnIndex === 2 ? 'hidden lg:block' : '',
        ]"
      >
        <div
          class="testimonial-track flex flex-col gap-[16px]"
          :class="columnIndex % 2 === 1 ? 'testimonial-track--down' : 'testimonial-track--up'"
          :style="{ animationDuration: SPEEDS[columnIndex % SPEEDS.length] }"
        >
          <!-- Two copies: the second is what the first scrolls into, and it is
               hidden from assistive tech so the quotes are not read twice. -->
          <div
            v-for="copy in 2"
            :key="copy"
            class="flex flex-col gap-[16px]"
            :aria-hidden="copy === 2 ? 'true' : undefined"
          >
            <figure
              v-for="(item, index) in column"
              :key="`${copy}-${index}`"
              class="rounded-[16px] border border-hairline bg-white p-[22px] shadow-[0_1px_2px_rgba(17,15,14,0.03)] sm:p-[26px]"
            >
              <blockquote class="text-[15px] leading-[1.7] text-navlink">
                “{{ item.quote }}”
              </blockquote>

              <figcaption class="mt-[20px] flex items-center gap-[12px]">
                <span
                  class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-tile text-[15px] font-bold"
                  aria-hidden="true"
                >
                  {{ initial(item.name) }}
                </span>
                <span class="min-w-0">
                  <span class="block truncate text-[15px] font-bold">{{ item.name }}</span>
                  <span class="block truncate text-[13px] text-muted">{{ item.role }}</span>
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
