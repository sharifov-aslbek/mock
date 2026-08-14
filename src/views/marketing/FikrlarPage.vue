<script setup>
// /fikrlar — what students say about MilliyMock.
import TestimonialWall from '@/components/marketing/TestimonialWall.vue'
import LandingCta from '@/components/marketing/LandingCta.vue'

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT — NOT REAL TESTIMONIALS. REPLACE BEFORE PUBLISHING.
//
// These quotes and names are invented to build and size the layout. Shipping
// them would put fabricated reviews from people who do not exist on a public
// page, which is a different thing from a staged product screenshot: it invents
// a person, not a number.
//
// Swap in real ones with the student's own permission, keeping the shape
// { quote, name, role }. The wall deals them round-robin across the columns, so
// any number works — twelve or more keeps each column full enough to loop
// without an obvious repeat.
// ─────────────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote:
      'Imtihon rejimi haqiqiy imtihondan farq qilmaydi. Birinchi marta blok imtihoniga kirganimda hech qanday hayajon bo‘lmadi — hammasi tanish edi.',
    name: 'Aziza R.',
    role: 'Matematika · 2025-yil abituriyenti',
  },
  {
    quote:
      'Eng foydalisi — tahlil. Qaysi mavzuni bilmasligimni taxmin qilib emas, ro‘yxat bo‘yicha ko‘rdim va o‘sha mavzularni takrorladim.',
    name: 'Bekzod T.',
    role: 'Tarix · 11-sinf',
  },
  {
    quote:
      'Insholarimni yozib, rasmini yuklardim. AI xatolarni ko‘rsatgani uchun har safar qayerda adashayotganimni tushunardim.',
    name: 'Nilufar Q.',
    role: 'Ona tili va adabiyot',
  },
  {
    quote:
      'Obuna emasligi menga qulay bo‘ldi. Tanga olib qo‘yasan, imtihonga bir oy qolganda ishlatasan — kuyib ketmaydi.',
    name: 'Sardor M.',
    role: 'Fizika · 2025-yil abituriyenti',
  },
  {
    quote:
      'Har hafta bitta variant yechib bordim. Grafikda o‘sish ko‘rinib turgani motivatsiya berdi.',
    name: 'Malika S.',
    role: 'Biologiya · 11-sinf',
  },
  {
    quote:
      'Savollar haqiqiy milliy sertifikat formatida. Boshqa saytlarda topgan testlarim bunchalik mos kelmagan edi.',
    name: 'Javohir N.',
    role: 'Matematika · 10-sinf',
  },
  {
    quote:
      'Testni yarmida uzilib qoldim, internetim o‘chdi. Qaytib kirsam, javoblarim joyida turibdi — vaqt ham to‘xtamagan, xuddi imtihondagidek.',
    name: 'Dilnoza A.',
    role: 'Ona tili · 11-sinf',
  },
  {
    quote:
      'Sertifikat olganimda 62% edi. Bu yerda birinchi urinishim 38% bo‘lgan — orada uch oy va yigirmata variant bor.',
    name: 'Ulug‘bek X.',
    role: 'Tarix · sertifikat egasi',
  },
  {
    quote:
      'O‘qituvchim tavsiya qilgandi. Endi sinfdoshlarim bilan kim ko‘proq ball to‘pladi deb bahslashamiz.',
    name: 'Shahzoda I.',
    role: 'Biologiya · 11-sinf',
  },
  {
    quote:
      'Telefondan ham bemalol yechsa bo‘ladi. Yo‘lda ketayotib bitta variantni tugatgan kunlarim ko‘p.',
    name: 'Otabek Yu.',
    role: 'Fizika · 11-sinf',
  },
  {
    quote:
      'Har bir savolning izohi bor. Javobni yodlab emas, nega shunday ekanini tushunib o‘rgandim.',
    name: 'Kamola D.',
    role: 'Matematika · 2025-yil abituriyenti',
  },
  {
    quote:
      'Natijalar sahifasida hamma urinishlarim saqlanib turadi. Bir oy oldingi natijamga qarab, qancha o‘sganimni ko‘raman.',
    name: 'Islom B.',
    role: 'Ona tili va adabiyot · 11-sinf',
  },
]
</script>

<template>
  <main>
    <header
      class="mx-auto box-content max-w-[1280px] px-[20px] pb-[40px] pt-[40px] text-center sm:px-[32px] lg:px-[48px] lg:pb-[56px] lg:pt-[64px]"
    >
      <p class="mb-[16px] text-[14px] font-medium tracking-[0.04em] text-muted">— Fikrlar</p>

      <h1
        class="mx-auto mb-[20px] max-w-[760px] font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.015em] sm:text-[44px] lg:text-[54px]"
      >
        O‘quvchilar nima deydi
      </h1>

      <p class="mx-auto max-w-[520px] text-[17px] leading-[1.65] text-muted">
        MilliyMock bilan tayyorlangan o‘quvchilarning o‘z so‘zlari.
      </p>
    </header>

    <section
      class="mx-auto box-content max-w-[1280px] px-[20px] pb-[64px] sm:px-[32px] lg:px-[48px] lg:pb-[96px]"
      aria-label="O‘quvchilar fikrlari"
    >
      <TestimonialWall :items="testimonials" />
    </section>

    <LandingCta />
  </main>
</template>
