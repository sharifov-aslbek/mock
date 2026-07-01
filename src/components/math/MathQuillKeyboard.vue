<script setup>
import { computed, ref } from 'vue'

defineProps({
  isVisible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['action', 'close'])
const activeKey = ref('')
const isAlphabetMode = ref(false)

let activeKeyTimeoutId = null

const setActiveKey = (keyId) => {
  activeKey.value = keyId

  if (activeKeyTimeoutId) {
    clearTimeout(activeKeyTimeoutId)
  }

  activeKeyTimeoutId = window.setTimeout(() => {
    activeKey.value = ''
    activeKeyTimeoutId = null
  }, 120)
}

const fire = (button) => {
  setActiveKey(button.id)

  if (button.onClick) {
    button.onClick()
    return
  }

  if (button.action) {
    emit('action', button.action)
  }
}

const symbolButtons = computed(() =>
  isAlphabetMode.value
    ? [
        { id: 'neq', content: '≠', action: { type: 'write', arg: '\\ne' } },
        { id: 'int', content: '∫', action: { type: 'typed', arg: '∫' } },
        { id: 'deg', content: '°', action: { type: 'write', arg: '^{\\text{°}}' } },
        {
          id: 'cases',
          content: '{',
          action: {
            type: 'typed',
            arg: '{',
          },
        },
        { id: 'emptyset', content: '∅', action: { type: 'write', arg: '\\emptyset' } },
        { id: 'perp', content: '⊥', action: { type: 'write', arg: '\\perp' } },
        { id: 'in', content: '∈', action: { type: 'write', arg: '\\in' } },
        { id: 'infty', content: '∞', action: { type: 'write', arg: '\\infty' } },
        { id: 'cup', content: '∪', action: { type: 'write', arg: '\\cup' } },
        { id: 'cap', content: '∩', action: { type: 'write', arg: '\\cap' } },
        { id: 'subseteq', content: '⊆', action: { type: 'write', arg: '\\subseteq' } },
        { id: 'nsubseteq', content: '⊈', action: { type: 'write', arg: '\\not\\subseteq' } },
        { id: 'subset', content: '⊂', action: { type: 'write', arg: '\\subset' } },
        { id: 'cdot', content: '·', action: { type: 'write', arg: '\\cdot' } },
        { id: 'alpha', content: 'α', action: { type: 'write', arg: '\\alpha' } },
        { id: 'approx', content: '≈', action: { type: 'write', arg: '\\approx' } },
        { id: 'tilde', content: '~', action: { type: 'write', arg: '\\sim' } },
        { id: 'beta', content: 'β', action: { type: 'write', arg: '\\beta' } },
        { id: 'gamma', content: 'γ', action: { type: 'write', arg: '\\gamma' } },
        {
          id: '123',
          content: '123',
          span: 2,
          variant: 'gray',
          onClick: () => {
            isAlphabetMode.value = false
          },
        },
      ]
    : [
        { id: 'x', content: '<em>x</em>', isHtml: true, action: { type: 'typed', arg: 'x' } },
        { id: 'y', content: '<em>y</em>', isHtml: true, action: { type: 'typed', arg: 'y' } },
        {
          id: 'sq',
          content: '<em>a</em><sup>2</sup>',
          isHtml: true,
          action: { type: 'write', arg: '^{2}' },
        },
        {
          id: 'pow',
          content: '<em>a</em><sup><em>b</em></sup>',
          isHtml: true,
          action: { type: 'cmd', arg: '^' },
        },
        { id: 'lp', content: '(', action: { type: 'typed', arg: '(' } },
        { id: 'rp', content: ')', action: { type: 'typed', arg: ')' } },
        {
          id: 'system',
          content: '{',
          action: {
            type: 'custom',
            fn: 'system',
          },
        },
        { id: 'lt', content: '&lt;', isHtml: true, action: { type: 'typed', arg: '<' } },
        { id: 'gt', content: '&gt;', isHtml: true, action: { type: 'typed', arg: '>' } },
        { id: 'abs', content: '|<em>a</em>|', isHtml: true, action: { type: 'typed', arg: '|' } },
        {
          id: 'sub_script',
          content: '<em>a</em><sub><em>b</em></sub>',
          isHtml: true,
          action: { type: 'cmd', arg: '_' },
        },
        { id: 'le', content: '≤', action: { type: 'write', arg: '\\le' } },
        { id: 'ge', content: '≥', action: { type: 'write', arg: '\\ge' } },
        { id: 'pi', content: 'π', action: { type: 'write', arg: '\\pi' } },
        { id: 'nthroot', content: '<span class="relative inline-block text-lg"><span class="absolute -left-2 -top-1 text-[10px]">n</span><span>√</span></span>', isHtml: true, action: { type: 'cmd', arg: '\\nthroot' } },
        { id: 'sqrt', content: '√', action: { type: 'cmd', arg: '\\sqrt' } },
        {
          id: 'frac',
          content: '<span class="flex flex-col items-center gap-[2px] leading-none"><span class="text-[11px]">a</span><span class="w-4 border-t border-gray-700"></span><span class="text-[11px]">b</span></span>',
          isHtml: true,
          action: { type: 'cmd', arg: '\\frac' },
        },
        { id: 'mul', content: '×', action: { type: 'write', arg: '\\cdot' } },
        { id: 'sub', content: '−', action: { type: 'typed', arg: '-' } },
        { id: 'add', content: '+', action: { type: 'typed', arg: '+' } },
        { id: 'dot', content: '.', variant: 'gray', action: { type: 'typed', arg: '.' } },
        { id: 'eq', content: '=', variant: 'gray', action: { type: 'typed', arg: '=' } },
        {
          id: 'ABC',
          content: 'A B C',
          span: 2,
          variant: 'gray',
          onClick: () => {
            isAlphabetMode.value = true
          },
        },
      ],
)

const controlButtons = [
  // (Removed the dead "functions" key — it had no action and did nothing on tap.)
  { id: 'space', content: 'SPACE', span: 2, variant: 'gray', action: { type: 'key', arg: 'Right' } },
  { id: 'left', content: '←', variant: 'gray', action: { type: 'key', arg: 'Left' } },
  { id: 'right', content: '→', variant: 'gray', action: { type: 'key', arg: 'Right' } },
  { id: 'bs', content: '⌫', span: 2, variant: 'gray', action: { type: 'key', arg: 'Backspace' } },
]

const keyClasses = (button) => {
  const classes = [
    'font-mono-custom',
    'select-none',
    'cursor-pointer',
    'flex',
    'items-center',
    'justify-center',
    'min-w-0',
    'rounded-[10px]',
    'border',
    'px-2',
    'text-center',
    'transition-all',
    'duration-75',
    'whitespace-nowrap',
    'active:scale-95',
    'text-[12px]',
    'leading-none',
    'sm:rounded-[12px]',
    'sm:text-[13px]',
    button.tall ? 'h-16' : 'h-9 sm:h-10',
    button.span === 2 ? 'col-span-2' : '',
    button.span === 4 ? 'col-span-4' : '',
  ]

  if (button.variant === 'blue') {
    classes.push('border-[#1a1814]', 'bg-[#1a1814]', 'text-white', 'hover:bg-[#2d2a25]')
  } else if (button.variant === 'gray') {
    classes.push(
      'border-[#d7d1c7]',
      'bg-[#f0ece4]',
      'text-[#1a1814]',
      'hover:border-[#1a1814]',
      'hover:bg-[#ebe4d8]',
    )
  } else {
    classes.push(
      'border-[#d1cec7]',
      'bg-white',
      'text-[#1a1814]',
      'hover:border-[#1a1814]',
      'hover:bg-[#f2ede4]',
    )
  }

  if (activeKey.value === button.id) {
    classes.push('scale-[0.98]', 'border-[#1a1814]', button.variant === 'blue' ? 'bg-[#2d2a25]' : 'bg-[#efe7db]')
  }

  return classes.join(' ')
}
</script>

<template>
  <div
    v-if="isVisible"
    class="rounded-[14px] border border-[#e3dcd1] bg-[#faf8f4] p-3 shadow-[0_10px_24px_rgba(26,24,20,0.06)] sm:rounded-[16px] sm:p-4"
  >
    <div>
      <div class="mb-3 flex items-center justify-between px-1">
        <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c] sm:text-[11px]">
          Virtual Keyboard
        </span>
        <button
          type="button"
          class="font-mono-custom flex items-center gap-1 rounded-[8px] px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a857c] transition-colors hover:bg-[#efe7db] hover:text-[#1a1814]"
          title="Close Keyboard"
          @click="emit('close')"
        >
          <span class="hidden sm:inline">Close</span>
          <span class="text-xl leading-none">×</span>
        </button>
      </div>

      <div class="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,1fr)]">
        <div class="grid grid-cols-4 gap-2.5 sm:gap-3">
          <button
            v-for="button in symbolButtons"
            :key="button.id"
            type="button"
            :title="button.title"
            :class="keyClasses(button)"
            @mousedown.prevent="fire(button)"
          >
            <span v-if="button.isHtml" v-html="button.content"></span>
            <span v-else>{{ button.content }}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            v-for="button in controlButtons"
            :key="button.id"
            type="button"
            :class="keyClasses(button)"
            @mousedown.prevent="fire(button)"
          >
            <span v-if="button.isHtml" v-html="button.content"></span>
            <span v-else>{{ button.content }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
