<script setup>
// Feature columns, from `MilliyMock Landing.dc.html`.
// The `platforma`, `essay` and `kurslar` ids are the design's own nav anchors.
//
// Three changes from the design file:
//
//  • Icon tiles are solid ink with white glyphs, not beige-on-cream. At
//    #efebe3 on #f8f6f2 the tiles were a 1.05:1 shape — visible only as a
//    faint smudge behind the icon.
//  • The vertical hairlines are gone in favour of a 48px column gap. They also
//    solved nothing below lg, where the row stacks and a vertical rule between
//    stacked items points the wrong way.
//  • Every description now carries a number. The old copy ("Haqiqiy
//    imtihonlarga mos testlar bilan bilimingizni sinang") would read the same
//    on any competitor's page.
//
// Numbers are the verified ones: 45 questions / 180 minutes per test and 5
// live subjects, from GET /api/test. Kurslar is written as forthcoming
// because it is — /kurslar is still the "tayyorlanmoqda" page.
</script>

<template>
  <section
    id="platforma"
    class="mx-auto box-content max-w-[1280px] px-[20px] pb-[64px] pt-[24px] sm:px-[32px] lg:px-[48px] lg:pb-[96px]"
  >
    <div
      class="grid grid-cols-1 gap-y-[40px] sm:grid-cols-2 sm:gap-x-[48px] lg:grid-cols-4 lg:gap-y-0"
    >
      <div
        class="flex flex-col items-center px-[8px] py-[8px] text-center transition-transform duration-[250ms] hover:-translate-y-[5px] motion-reduce:hover:translate-y-0"
      >
        <span
          class="mb-[22px] inline-flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-ink"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="3" width="14" height="18" rx="3" />
            <path d="M9 8h6" />
            <path d="M9 12h6" />
            <path d="M9 16h4" />
          </svg>
        </span>
        <h3 class="mb-[12px] text-[19px] font-bold">Mock testlar</h3>
        <p class="text-[15px] leading-[1.6] text-muted">
          45 savol, 180 daqiqa — real imtihon vaqti va formati bilan tayyorlaning.
        </p>
      </div>

      <div
        id="essay"
        class="flex flex-col items-center px-[8px] py-[8px] text-center transition-transform duration-[250ms] hover:-translate-y-[5px] motion-reduce:hover:translate-y-0"
      >
        <span
          class="mb-[22px] inline-flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-ink"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5l4 4L7 21H3v-4z" />
          </svg>
        </span>
        <h3 class="mb-[12px] text-[19px] font-bold">Essay tekshirish</h3>
        <p class="text-[15px] leading-[1.6] text-muted">
          Insho va yozma ishingiz AI tahlilidan o'tadi: xatolar, baho va aniq tavsiyalar.
        </p>
      </div>

      <div
        id="kurslar"
        class="flex flex-col items-center px-[8px] py-[8px] text-center transition-transform duration-[250ms] hover:-translate-y-[5px] motion-reduce:hover:translate-y-0"
      >
        <span
          class="mb-[22px] inline-flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-ink"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
            <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
          </svg>
        </span>
        <h3 class="mb-[12px] text-[19px] font-bold">Kurslar</h3>
        <p class="text-[15px] leading-[1.6] text-muted">
          5 fan bo'yicha video darslar va amaliy mashqlar — tayyorlanmoqda.
        </p>
      </div>

      <div
        class="flex flex-col items-center px-[8px] py-[8px] text-center transition-transform duration-[250ms] hover:-translate-y-[5px] motion-reduce:hover:translate-y-0"
      >
        <span
          class="mb-[22px] inline-flex h-[56px] w-[56px] items-center justify-center rounded-[12px] bg-ink"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19l5.5-5.5 4 4L20 11" />
            <path d="M15 11h5v5" />
          </svg>
        </span>
        <h3 class="mb-[12px] text-[19px] font-bold">Natija va tahlil</h3>
        <p class="text-[15px] leading-[1.6] text-muted">
          Har bir xato savol bo'yicha batafsil tahlil va ball dinamikasi.
        </p>
      </div>
    </div>
  </section>
</template>
