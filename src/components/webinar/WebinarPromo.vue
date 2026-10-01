<script setup>
// CEFR webinar promo at the bottom of the results page — temporary campaign.
//
// To take it down: delete src/components/webinar/, public/webinar/, and the
// two <Webinar…> tags in views/ExplanationPage.vue.
//
// The video is a static file in public/, not part of the bundle. preload="none"
// means nothing is downloaded until the student presses play; the poster is the
// only thing the page fetches. It was re-encoded to 720p with +faststart, so it
// starts playing after the first few hundred KB instead of the whole file.
import { ref } from 'vue'

const REGISTER_URL = 'https://webinar-lead.vercel.app'
const VIDEO_SRC = '/webinar/cefr-webinar.mp4'
const POSTER_SRC = '/webinar/cefr-webinar-poster.jpg'

const videoEl = ref(null)
// Native controls only after the first play: before that, the poster carries a
// single large play button, which reads as "video" at a glance where a thin
// control bar over a still frame does not.
const hasStarted = ref(false)

function play() {
  hasStarted.value = true
  void videoEl.value?.play().catch(() => {})
}
</script>

<template>
  <!-- WebinarTeaser scrolls to this id. -->
  <section id="webinar" class="mt-12 scroll-mt-6" aria-labelledby="webinar-heading">
    <div
      class="rounded-2xl border border-[#e0ddd7] bg-white px-4 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:px-6 sm:py-10"
    >
      <div class="mx-auto flex max-w-[340px] flex-col items-center text-center">
        <span
          class="font-mono-custom rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
        >
          Bepul vebinar
        </span>
        <h2 id="webinar-heading" class="mt-3 text-xl font-bold tracking-[-0.01em] text-[#1a1814]">
          CEFR vebinari
        </h2>
        <p class="mt-1.5 text-sm leading-relaxed text-[#8a857c]">
          CEFR imtihoniga tayyorlanayotgan bo‘lsangiz, shu videoni ko‘ring.
        </p>

        <div class="relative mt-5 aspect-[9/16] w-full overflow-hidden rounded-[18px] bg-[#1a1814] shadow-[0_10px_30px_rgba(26,24,20,0.12)]">
          <video
            ref="videoEl"
            class="h-full w-full object-cover"
            :src="VIDEO_SRC"
            :poster="POSTER_SRC"
            preload="none"
            playsinline
            :controls="hasStarted"
            @play="hasStarted = true"
          />
          <button
            v-if="!hasStarted"
            type="button"
            class="group absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/20"
            aria-label="Videoni ko‘rish"
            @click="play"
          >
            <span
              class="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#1a1814] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition group-hover:scale-105"
            >
              <svg class="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
              </svg>
            </span>
          </button>
        </div>

        <a
          :href="REGISTER_URL"
          target="_blank"
          rel="noopener"
          class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1814] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2a2722]"
        >
          Vebinarga ro‘yxatdan o‘tish
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 12h14" stroke-linecap="round" />
            <path d="m13 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
        <p class="mt-2.5 text-xs leading-relaxed text-[#a39e94]">
          Ism va telefon raqamingizni qoldiring — o‘zimiz qo‘ng‘iroq qilamiz.
        </p>
      </div>
    </div>
  </section>
</template>
