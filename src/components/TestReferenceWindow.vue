<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import interact from 'interactjs'

const props = defineProps({
  dragLabel: {
    type: String,
    default: '',
  },
  shrinkLabel: {
    type: String,
    default: '',
  },
  growLabel: {
    type: String,
    default: '',
  },
  closeLabel: {
    type: String,
    default: '',
  },
  sheets: {
    type: Array,
    default: () => [],
  },
  sheetAltLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const DEFAULT_WINDOW_WIDTH = 760
const MIN_WINDOW_WIDTH = 420
const WINDOW_WIDTH_STEP = 120

const windowRef = ref(null)
const viewportWidth = ref(0)
const windowWidth = ref(DEFAULT_WINDOW_WIDTH)
const position = ref({
  x: 20,
  y: 96,
})

const effectiveWindowWidth = computed(() => {
  const availableWidth = Math.max(viewportWidth.value - 24, 320)
  return Math.min(windowWidth.value, availableWidth)
})

const canShrink = computed(() => effectiveWindowWidth.value > MIN_WINDOW_WIDTH)

const canGrow = computed(() => {
  const availableWidth = Math.max(viewportWidth.value - 24, 320)
  return effectiveWindowWidth.value < availableWidth
})

const windowStyle = computed(() => ({
  transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0)`,
  width: `${effectiveWindowWidth.value}px`,
}))

const updateViewport = () => {
  if (typeof window === 'undefined') {
    return
  }

  viewportWidth.value = window.innerWidth
}

const clampPosition = () => {
  if (typeof window === 'undefined' || !windowRef.value) {
    return
  }

  const element = windowRef.value
  const maxX = Math.max(12, window.innerWidth - element.offsetWidth - 12)
  const maxY = Math.max(12, window.innerHeight - element.offsetHeight - 12)

  position.value = {
    x: Math.min(Math.max(position.value.x, 12), maxX),
    y: Math.min(Math.max(position.value.y, 12), maxY),
  }
}

const closeWindow = () => {
  emit('close')
}

const resizeWindow = async (direction) => {
  if (direction === 'smaller') {
    windowWidth.value = Math.max(windowWidth.value - WINDOW_WIDTH_STEP, MIN_WINDOW_WIDTH)
  } else {
    const availableWidth = Math.max(viewportWidth.value - 24, MIN_WINDOW_WIDTH)
    windowWidth.value = Math.min(windowWidth.value + WINDOW_WIDTH_STEP, availableWidth)
  }

  await nextTick()
  clampPosition()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeWindow()
  }
}

onMounted(async () => {
  updateViewport()
  await nextTick()
  clampPosition()

  if (windowRef.value) {
    interact(windowRef.value).draggable({
      allowFrom: '.drag-handle',
      listeners: {
        move(event) {
          position.value = {
            x: position.value.x + event.dx,
            y: position.value.y + event.dy,
          }

          clampPosition()
        },
      },
    })
  }

  window.addEventListener('resize', updateViewport)
  window.addEventListener('resize', clampPosition)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (windowRef.value) {
    interact(windowRef.value).unset()
  }

  window.removeEventListener('resize', updateViewport)
  window.removeEventListener('resize', clampPosition)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="windowRef"
    class="reference-window fixed left-0 top-0 z-40 overflow-hidden rounded-[22px] border-[3px] border-black bg-white shadow-[0_26px_70px_rgba(15,23,42,0.22)]"
    :style="windowStyle"
  >
    <div class="flex items-center justify-between gap-3 border-b border-black/10 bg-[#f8f4ec] px-4 py-3 sm:px-5">
      <div class="drag-handle flex flex-1 cursor-grab items-center gap-3 text-black/55 active:cursor-grabbing">
        <span class="grid grid-cols-3 gap-1">
          <span
            v-for="dot in 9"
            :key="dot"
            class="h-1.5 w-1.5 rounded-full bg-black/35"
          ></span>
        </span>
        <span class="text-[11px] font-medium uppercase tracking-[0.24em] sm:text-xs">
          {{ dragLabel }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :title="shrinkLabel"
          :aria-label="shrinkLabel"
          :disabled="!canShrink"
          @click="resizeWindow('smaller')"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-lg font-semibold text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          −
        </button>

        <button
          type="button"
          :title="growLabel"
          :aria-label="growLabel"
          :disabled="!canGrow"
          @click="resizeWindow('larger')"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-lg font-semibold text-black transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          +
        </button>

        <button
          type="button"
          @click="closeWindow"
          class="text-sm font-semibold text-black transition hover:opacity-70 sm:text-base"
        >
          {{ closeLabel }}
          <span class="ml-1 text-lg leading-none">×</span>
        </button>
      </div>
    </div>

    <div class="max-h-[72vh] overflow-y-auto bg-[#f8f4ec] p-3 sm:p-4">
      <div class="space-y-4">
        <figure
          v-for="sheet in sheets"
          :key="sheet.id"
          class="overflow-hidden rounded-[18px] border border-black/10 bg-white"
        >
          <img
            :src="sheet.src"
            :alt="`${sheetAltLabel} ${sheet.id}`"
            class="block w-full bg-white"
            loading="lazy"
          />
          <figcaption class="border-t border-black/8 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
            {{ sheet.title }}
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reference-window {
  touch-action: none;
}
</style>
