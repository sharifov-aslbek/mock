// Demo data for the Ona tili results/analysis page design preview
// (/ona-tili-demo-natija). Frontend-only — no backend involved.
//
// Two independent halves:
//   1. onaTiliDemoAnswerKey — grades the 44 objective items of the demo test.
//      ⚠️ DEMO KEY: the official answer key for the "2025 aprel imtihoni"
//      sample was not published with the booklet. These values exist so the
//      analysis page has something real to grade against in the design
//      preview; do NOT treat them as the official answers.
//   2. sampleEssayAnalysis / sampleEssayText — a captured AI (Gemini) grading
//      response and a sample essay containing every quoted error verbatim.
//      In production the student's own essay + the live AI response flow
//      through the same components; the shapes here mirror the AI contract.

// ——— 1. Objective answer key (demo) ————————————————————————————————
// MCQ (1–32): option letter. Matching (33–35): bank letter A–F.
// Free answers (36–44, incl. a/b parts): accepted variants separated by `||`
// (same convention the backend's CorrectAnswer uses).
export const onaTiliDemoAnswerKey = {
  1: 'D', 2: 'C', 3: 'D', 4: 'D', 5: 'B', 6: 'D', 7: 'B', 8: 'C',
  9: 'A', 10: 'C', 11: 'B', 12: 'A', 13: 'D', 14: 'C', 15: 'A', 16: 'B',
  17: 'D', 18: 'C', 19: 'B', 20: 'A', 21: 'D', 22: 'B', 23: 'C', 24: 'A',
  25: 'B', 26: 'D', 27: 'C', 28: 'A', 29: 'B', 30: 'D', 31: 'A', 32: 'C',

  33: 'E', 34: 'C', 35: 'A',

  36: 'yaqin',
  37: ': « , , , » .||: « , , , ».',
  38: "-go'y||go'y",
  39: "hol||o'rin holi||hol (o'rin holi)",
  '40a': 'chorladi',
  '40b': 'chorladi',
  '41a': "-u yuklamasi||-u||yu yuklamasi",
  '41b': "bog'langan qo'shma gap",
  '42a': "mubolag'a||giperbola",
  '42b': "voqelikni bo'rttirib, kuchaytirib tasvirlash||bo'rttirib tasvirlash",
  '43a': 'h',
  '43b': 'mutlaq qofiya',
  '44a': 'tuyuq',
  '44b': "tajnis qo'llanadi||tajnis||shakldosh so'zlar qofiyalanadi",
}

// ——— 2. Sample AI essay analysis ———————————————————————————————————
// The long sentence-level quotes; the essay text below embeds them verbatim
// so the inline highlighter always finds them.
const STRUCTURE_QUOTE_1 =
  "Birinchi fikr tarafdorlari qo'shimcha daromad topish yoki o'zi mustaqil pul mablag' topishni xohlovchilar bu fikrni qoʻllab-quvvatlaydi."
const STRUCTURE_QUOTE_2 =
  "bunday daromad platformalar siyosati, bozor talabi va texnologik o'zgarishlarga kuchli darajada bog'liq, shu sababli qisqa vaqt ichida to'xtashi ham mumkin, chunki to'xtashi ehtimoli, masalan, ayrim onlayn platformalarda algoritm yoki xizmat koʻrsatish qoidalarining oʻzgarishi koʻplab foydalanuvchilarning daromadiga salbiy ta'sir koʻrsatgan."

// A sample student essay on task 45 (studying vs. working). Every `quote` in
// sampleEssayAnalysis.error_criteria appears in this text character-for-character.
export const sampleEssayText = [
  "Zamonaviy texnologiyalar yoshlarning daromad topish imkoniyatlari kengaytirmoqda. Bugungi kunda ko'plab o'quvchilar ta'lim olish bilan birga internet orqali pul ishlashga qiziqmoqda. Bu masala bo'yicha jamiyatda turli qarashlar mavjud.",
  `${STRUCTURE_QUOTE_1} Ularning fikricha, o'qish davrida ishlagan yosh tajriba va erkinlikka ega bo'ladi. Bunday yondashuvning ijobiy taraflari jihatlari mavjud, chunki inson nazariy bilimini amaliyotda sinab ko'radi.`,
  "Biroq, boshqalar ta'lim jarayonida chalg'imasdan faqat bilim olish muhim deb hisoblaydi. Ularning dalillari ham asosli. Bir tomoning fikricha, ishlash o'qishdan chalg'itadi va natijalarga salbiy ta'sir qiladi. Biroq, bu imkoniyatdan to'g'ri foydalanish uchun bilim va tajriba kerak.",
  `Shuni ta'kidlash lozimki, ${STRUCTURE_QUOTE_2}`,
  "Xulosa qilib aytganda, ta'lim davrida mehnat qilish ham imkoniyat, ham mas'uliyatdir. Muvozanatni saqlay olgan o'quvchi ham bilim, ham tajriba orttiradi.",
].join('\n\n')

// Captured Gemini response (error_criteria + c1 are verbatim from a real run;
// c2–c4 judgment entries are placeholders until the full response schema is
// finalized — swap them out when the complete contract lands).
export const sampleEssayAnalysis = {
  on_topic: true,
  copied_suspected: false,
  global_notes:
    "Insho belgilangan mavzu bo'yicha izchil va mantiqiy ketma-ketlikda yozilgan. Biroq matnda gap qurilishi bilan bog'liq jiddiy sintaktik chalkashliklar, so'zlarning noo'rin takrori va tinish belgilarining noto'g'ri qo'llanishi kabi xatoliklar uchraydi.",
  error_criteria: {
    c5_structure: {
      errors: [
        {
          quote: STRUCTURE_QUOTE_1,
          issue:
            "Gap qurilishi sintaktik jihatdan noto'g'ri shakllantirilgan. Ajratilgan izohlovchi bo'laklar tegishli tinish belgilari (tire yoki vergul) bilan ajratilmagani sababli gap mazmuni chalkashib ketgan.",
          error_type: 'gap_qurilishi_tarafdorlari',
        },
        {
          quote: STRUCTURE_QUOTE_2,
          issue:
            "Ushbu murakkab gapning oxirgi qismida mantiqiy va sintaktik aloqa uzilgan. 'chunki to'xtashi ehtimoli...' deb boshlangan iboraning xabari (kesimi) yo'qligi sababli fikr chala va chalkash bo'lib qolgan.",
          error_type: 'gap_qurilishi_toxtashi_ehtimoli',
        },
      ],
    },
    c6_repetition: { errors: [] },
    c7_spelling: {
      errors: [
        {
          quote: 'tomoning',
          issue:
            "Qaratqich kelishigi qo'shimchasi qatnashgan so'z imlosida xatolikka yo'l qo'yilgan. To'g'ri shakli: 'tomonning' (ikki 'n' harfi bilan).",
          error_type: 'imlo_tomonning',
        },
      ],
    },
    c8_punctuation: {
      errors: [
        {
          quote: 'Biroq, boshqalar',
          issue:
            "Gap boshida kelgan 'Biroq' zidlov bog'lovchisidan keyin noto'g'ri ravishda vergul qo'yilgan.",
          error_type: 'vergul_biroq',
        },
        {
          quote: 'Biroq, bu imkoniyatdan',
          issue:
            "Gap boshidagi zidlov bog'lovchisidan so'ng noo'rin ravishda vergul belgisi qo'llangan.",
          error_type: 'vergul_biroq',
        },
      ],
    },
    c9_affix: {
      errors: [
        {
          quote: 'imkoniyatlari kengaytirmoqda',
          issue:
            "Tushum kelishigi qo'shimchasi (-ni) tushirib qoldirilgan, natijada gap tarkibidagi so'zlararo aloqa buzilgan. To'g'ri shakli: 'imkoniyatlarini kengaytirmoqda'.",
          error_type: 'kelishik_imkoniyatlarini',
        },
        {
          quote: "pul mablag' topishni",
          issue:
            "Egalik va ko'plik qo'shimchalari noto'g'ri qo'llangan. Mazkur birikma 'pul mablag'lari topishni' yoki oddiygina 'pul topishni' shaklida bo'lishi kerak edi.",
          error_type: 'egalik_mablaglari',
        },
      ],
    },
    c10_word_style: {
      errors: [
        {
          quote: 'taraflari jihatlari mavjud',
          issue:
            "Ma'nodosh so'zlarning ketma-ket qo'llanishi natijasida uslubiy g'alizlik va so'z ortiqchaligi yuzaga kelgan. Ulardan faqat bittasini qoldirish lozim edi.",
          error_type: 'soz_ortiqchaligi_taraflari_jihatlari',
        },
        {
          quote: "to'xtashi ham mumkin, chunki to'xtashi ehtimoli",
          issue:
            "Bitta gap tarkibida 'to'xtashi' so'zining asossiz ravishda takrorlanishi uslubiy g'alizlikni keltirib chiqargan.",
          error_type: 'soz_takrori_toxtashi',
        },
      ],
    },
    c12_register: { errors: [] },
  },
  judgment_criteria: {
    c1_style: {
      reasoning:
        "Insho to'liq tahliliy va publitsistik uslubda yozilgan. Muallif jamiyat hayotidagi zamonaviy muammoni jiddiy ohangda tahlil qilgan. Nutq ohangi va qo'llangan leksika belgilangan uslub talablariga mos keladi.",
      band: '2',
    },
    c2_viewpoints: {
      reasoning:
        "Ikki qarama-qarshi qarash ham keltirilgan, biroq muallifning shaxsiy pozitsiyasi yetarlicha asoslanmagan va ayrim dalillar yuzaki qolgan.",
      band: '1',
    },
    c3_content: {
      reasoning:
        "Mavzu ochib berilgan, hayotiy misollar keltirilgan. Ayrim fikrlar oxiriga yetkazilmagan va chala qolgan.",
      band: '2',
    },
    c4_composition: {
      reasoning:
        "Insho kirish, asosiy qism va xulosaga ega; xatboshilar mantiqiy ketma-ketlikda joylashgan va talab qilingan tuzilmaga mos.",
      band: '2',
    },
  },
}

// ——— 3. Demo band total ————————————————————————————————————————————
// Rubric: 12 mezon (c1–c12), har biri 0–2 ball → jami 24 ball (see
// utils/essayAnalysis.js for the production constants + normalizer).
// This total is a DEMO value — in production the backend supplies it
// alongside the AI response (utils/essayAnalysisApi.js).
export const sampleEssayBandTotal = 17
