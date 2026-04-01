<script setup>
defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="space-y-2.5">
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      @click="$emit('update:modelValue', option.id)"
      class="group flex w-full items-start gap-3 rounded-[16px] border px-3.5 py-3 text-left transition sm:max-w-[420px] sm:items-center sm:gap-4 sm:rounded-none sm:border-transparent sm:px-0 sm:py-0"
      :class="
        modelValue === option.id
          ? 'border-black/90 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:bg-transparent sm:shadow-none'
          : 'border-black/8 bg-[#faf8f4] hover:border-black/20 hover:bg-white sm:bg-transparent sm:hover:border-transparent sm:hover:bg-transparent'
      "
    >
      <span
        class="font-mono-custom flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-[14px] font-medium transition-all duration-200 sm:text-[15px]"
        :class="
          modelValue === option.id
            ? 'bg-black text-white'
            : 'bg-white text-black group-hover:bg-black group-hover:text-white'
        "
      >
        {{ option.letter }}
      </span>

      <span
        class="pt-0.5 text-[15px] font-medium leading-[1.55] text-[#1a1814] sm:pt-0 sm:text-[16px] sm:leading-[1.7]"
        :class="modelValue === option.id ? 'text-black' : ''"
      >
        {{ option.text }}
      </span>
    </button>
  </div>
</template>
