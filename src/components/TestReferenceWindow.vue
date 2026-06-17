<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import interact from 'interactjs'
import FormulaReferenceContent from '@/components/test/FormulaReferenceContent.vue'

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
    class="reference-window fixed left-0 top-0 z-40 overflow-hidden rounded-[4px] border-2 border-[#1a1814] bg-white shadow-2xl"
    :style="windowStyle"
  >
    <div class="reference-window__shell">
      <div class="flex items-center justify-between gap-3 border-b border-[#e0ddd7] bg-[#f5f3ef] px-3 py-2 sm:px-4">
        <div class="drag-handle flex flex-1 cursor-grab items-center gap-2 text-[#1a1814]/60 active:cursor-grabbing">
          <span class="grid grid-cols-3 gap-1">
            <span
              v-for="dot in 9"
              :key="dot"
              class="h-1.5 w-1.5 rounded-full bg-[#1a1814]/35"
            ></span>
          </span>
          <span class="font-mono-custom text-xs font-semibold uppercase tracking-[0.18em]">
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
            class="font-mono-custom flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#e0ddd7] bg-white text-base font-semibold text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#e0ddd7] disabled:cursor-not-allowed disabled:opacity-35"
          >
            −
          </button>

          <button
            type="button"
            :title="growLabel"
            :aria-label="growLabel"
            :disabled="!canGrow"
            @click="resizeWindow('larger')"
            class="font-mono-custom flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#e0ddd7] bg-white text-base font-semibold text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#e0ddd7] disabled:cursor-not-allowed disabled:opacity-35"
          >
            +
          </button>

          <button
            type="button"
            @click="closeWindow"
            class="font-mono-custom text-sm font-medium text-[#1a1814] transition hover:bg-[#e0ddd7] hover:px-2 hover:py-1 hover:rounded-[4px]"
          >
            {{ closeLabel }}
            <span class="ml-1 text-lg leading-none">×</span>
          </button>
        </div>
      </div>

      <div class="max-h-[72vh] overflow-y-auto bg-white p-4">
        <FormulaReferenceContent />
      </div>
    </div>
  </div>
</template>

<style scoped>
.reference-window {
  touch-action: none;
}

.reference-window__shell {
  animation: reference-window-enter 220ms cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: top left;
}

@keyframes reference-window-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reference-window__shell {
    animation: none;
  }
}
</style>
