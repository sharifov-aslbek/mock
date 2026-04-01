<template>
  <n-space>
    <div class="rounded-[22px] bg-black px-4 py-2.5 text-center text-white shadow-[0_14px_36px_rgba(15,23,42,0.2)]">
      <n-countdown ref="countdown" :duration="86400000" :active="active" />
    </div>
  </n-space>
</template>

<script setup>
import { ref } from "vue";
import { NCountdown, NSpace, NButton, NSwitch } from "naive-ui";

const active = ref(true);
const countdown = ref(null);

function handleReset() {
  countdown.value?.reset();
}
</script>