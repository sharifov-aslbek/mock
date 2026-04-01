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
      class="group flex w-full max-w-[420px] items-center gap-4 text-left"
    >
      <span
        class="font-mono-custom flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-[15px] font-medium transition-all duration-200"
        :class="
          modelValue === option.id
            ? 'bg-black text-white'
            : 'bg-white text-black group-hover:bg-black group-hover:text-white'
        "
      >
        {{ option.letter }}
      </span>

      <span
        class="text-[15px] font-medium leading-[1.7] text-[#1a1814] sm:text-[16px]"
        :class="modelValue === option.id ? 'text-black' : ''"
      >
        {{ option.text }}
      </span>
    </button>
  </div>
</template>
