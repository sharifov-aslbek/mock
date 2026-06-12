<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { NCard, NModal, NSpin } from 'naive-ui'
import referenceImage1 from '@/assets/image1.png'
import referenceImage2 from '@/assets/image2.png'
import referenceImage3 from '@/assets/image3.png'
import TestReferenceWindow from '@/components/TestReferenceWindow.vue'
import TestBottomBar from '@/components/test/TestBottomBar.vue'
import TestErrorState from '@/components/test/TestErrorState.vue'
import TestFloatingTools from '@/components/test/TestFloatingTools.vue'
import TestQuestionBlock from '@/components/test/TestQuestionBlock.vue'
import TestQuestionGroup from '@/components/test/TestQuestionGroup.vue'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'
import { useTestProgressStore } from '@/stores/testProgress'
import { getTestApiBaseUrl } from '@/utils/api'

// framework / store'lardan kelgan hook'lar
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const testProgressStore = useTestProgressStore()

// script ichida saqlanadigan sahifa holati
const answers = reactive({})                  // questionId -> selectedOptionId ko'rinishidagi map
const freeAnswers = reactive({})              // questionId -> erkin javob HTML/matni ko'rinishidagi map
const pageErrorKey = ref('')                  // sahifa ochilmaganda ko'rsatiladigan i18n kalit
const remainingSeconds = ref(0)               // test taymerida qolgan sekundlar
const isReferenceOpen = ref(false)            // algebra/geometriya yordam paneli ochiqmi
const showSubmitModal = ref(false)            // "testni topshirish" tasdiq modali ochiqmi
const showLeaveModal = ref(false)             // navigatsiyani tasdiqlash modali ochiqmi
let pendingNavigationCallback = null          // onBeforeRouteLeave'dan kelgan next() funksiyasini saqlaydi
const isSubmittingTest = ref(false)           // hozir test topshirilyaptimi
const shouldPersistProgress = ref(true)       // jarayonni localStorage ga saqlash kerakmi
const activeAttemptId = ref(null)             // API'dan kelgan user-test-attempt id si

// reactive bo'lmasligi mumkin bo'lgan timer id va flag'lar
let timerIntervalId = null
let isSyncingAnswers = false
let pendingSyncRequested = false
let isStartingAttempt = false
let isCompletingTest = ref(false)
const dirtyQuestionIds = new Set()            // oxirgi sinxronizatsiyadan keyin tahrirlangan savol id'lari
const ANSWER_ACTIONS_STORAGE_KEY = 'test_answer_actions'
const answerActions = ref([])                 // javob create/update so'rovlarining navbati

// tabriklash animatsiyasi uchun konfetti bo'laklari
const confettiPieces = [
  { left: '-22px', top: '22px', color: '#ef4444', delay: '0s', rotate: '18deg' },
  { left: '-34px', top: '118px', color: '#f59e0b', delay: '0.18s', rotate: '-24deg' },
  { left: '-18px', top: '228px', color: '#10b981', delay: '0.32s', rotate: '42deg' },
  { left: '28px', top: '-22px', color: '#3b82f6', delay: '0.08s', rotate: '-12deg' },
  { right: '44px', top: '-26px', color: '#ec4899', delay: '0.24s', rotate: '34deg' },
  { right: '-24px', top: '48px', color: '#8b5cf6', delay: '0.14s', rotate: '-38deg' },
  { right: '-36px', top: '162px', color: '#22c55e', delay: '0.38s', rotate: '16deg' },
  { right: '-16px', top: '282px', color: '#f97316', delay: '0.28s', rotate: '-18deg' },
]

// algebra/geometriya/trigonometriya yordam panelida ko'rsatiladigan varaqlar
const referenceSheets = [
  { id: 1, title: 'Algebra', src: referenceImage1 },
  { id: 2, title: 'Geometry', src: referenceImage2 },
  { id: 3, title: 'Trigonometry', src: referenceImage3 },
]

// URL'dagi ?testId= query string'dan test id ni o'qiymiz
const requestedTestId = computed(() => {
  if (typeof route.query.testId === 'string') {
    return route.query.testId
  }

  return ''
})

// URL'da ?restart=1 bo'lsa true (foydalanuvchi yangi urinish boshlamoqchi)
const shouldRestartTest = computed(() => route.query.restart === '1')

// pinia store'dan kelgan test ma'lumotlari
const currentTest = computed(() => testStore.currentTest)
const testApiBaseUrl = getTestApiBaseUrl()

// locale kodi -> API translations ichida ishlatadigan til nomi
const LANGUAGE_BY_LOCALE = {
  uz: 'Uzbek',
  ru: 'Russian',
}

// guruhli savollar uchun ichki tartib label'lari (a, b, c, ...)
const GROUP_SUBORDER_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

// joriy locale uchun mos tarjimani olamiz, topilmasa uz ga qaytamiz
const getLocalizedTranslation = (entity) => {
  // translations massivini xavfsiz olib chiqamiz
  let translations = []
  if (entity && Array.isArray(entity.translations)) {
    translations = entity.translations
  }

  if (translations.length === 0) {
    return null
  }

  // qaysi til kerakligini aniqlaymiz
  let preferredLanguage = LANGUAGE_BY_LOCALE[locale.value]
  if (!preferredLanguage) {
    preferredLanguage = LANGUAGE_BY_LOCALE.uz
  }

  // tartib: tanlangan til -> uz -> birinchi mavjud bo'lgan
  const preferredMatch = translations.find((item) => item && item.language === preferredLanguage)
  if (preferredMatch) {
    return preferredMatch
  }

  const uzMatch = translations.find((item) => item && item.language === LANGUAGE_BY_LOCALE.uz)
  if (uzMatch) {
    return uzMatch
  }

  if (translations[0]) {
    return translations[0]
  }

  return null
}

// savol/guruh/va h.k. uchun ko'rsatiladigan matnni olamiz
const getEntityText = (entity) => {
  const translation = getLocalizedTranslation(entity)

  if (translation && translation.text) {
    return translation.text
  }

  if (entity && entity.text) {
    return entity.text
  }

  if (entity && entity.title) {
    return entity.title
  }

  return ''
}

// API'dan kelgan rasm yo'lini to'liq URL ga aylantiramiz
const buildEntityImageUrl = (imagePath) => {
  if (!imagePath) {
    return null
  }

  // allaqachon to'liq URL
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  // base URL hali ma'lum emas, yo'lni o'zgartirmasdan qaytaramiz
  if (!testApiBaseUrl) {
    return imagePath
  }

  try {
    const origin = new URL(testApiBaseUrl).origin
    const cleanedPath = String(imagePath).replace(/^\/+/, '')
    return `${origin}/${cleanedPath}`
  } catch {
    return imagePath
  }
}

// savol/guruh/va h.k. uchun to'g'ri rasm URL'ini aniqlaymiz
const getEntityImageUrl = (entity) => {
  const translation = getLocalizedTranslation(entity)

  // avval lokalizatsiya qilingan rasm yo'lini olamiz, bo'lmasa entity'dagisini
  let imagePath = null
  if (translation && translation.imagePath) {
    imagePath = translation.imagePath
  } else if (entity && entity.imagePath) {
    imagePath = entity.imagePath
  }

  // backend ba'zida tayyor imageUrl yuboradi
  if (entity && entity.imageUrl) {
    return entity.imageUrl
  }

  return buildEntityImageUrl(imagePath)
}

// savol guruhlarini id bo'yicha qidirish uchun map
const questionGroupsById = computed(() => {
  const map = new Map()
  let groups = []
  if (currentTest.value && currentTest.value.questionGroups) {
    groups = currentTest.value.questionGroups
  }

  for (const group of groups) {
    map.set(Number(group.id), group)
  }
  return map
})

// render qilingan savollarni id bo'yicha qidirish uchun map
const renderedQuestionsById = computed(() => {
  const map = new Map()
  for (const question of renderedQuestions.value) {
    map.set(Number(question.id), question)
  }
  return map
})

// har bir savol guruhi uchun render modelini quramiz (template ishlatadi)
const groupRenderModels = computed(() => {
  const models = new Map()

  let groups = []
  if (currentTest.value && currentTest.value.questionGroups) {
    groups = currentTest.value.questionGroups
  }

  for (const group of groups) {
    const normalizedGroupId = Number(group.id)
    const groupedQuestions = getGroupedQuestions(normalizedGroupId)

    // shu guruh ichida ko'rsatilgan turli tartib raqamlarini yig'amiz
    const orderStrings = []
    for (const question of groupedQuestions) {
      let raw = ''
      if (question.displayOrder) {
        raw = String(question.displayOrder)
      } else if (question.order) {
        raw = String(question.order)
      }

      const trimmed = raw.trim()
      if (trimmed && !orderStrings.includes(trimmed)) {
        orderStrings.push(trimmed)
      }
    }

    // butun guruh bitta tartib raqamiga ega bo'lsa, bitta label va a/b/c ichki tartiblarni ishlatamiz.
    // sub-savollar har xil order'larga ega bo'lsa, eng kichik order'ni yoki diapazon'ni ko'rsatamiz —
    // shunda guruh sarlavhasida har doim raqam ko'rinadi.
    const useSharedGroupOrder = groupedQuestions.length > 1 && orderStrings.length === 1
    const numericOrders = orderStrings
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((firstOrder, secondOrder) => firstOrder - secondOrder)
    let orderLabel = ''
    if (useSharedGroupOrder) {
      orderLabel = orderStrings[0]
    } else if (numericOrders.length > 1) {
      orderLabel = `${numericOrders[0]}-${numericOrders[numericOrders.length - 1]}`
    } else if (numericOrders.length === 1) {
      orderLabel = String(numericOrders[0])
    }

    // har bir savolga guruh-ga oid qo'shimchalarni biriktiramiz
    const questions = groupedQuestions.map((question, index) => {
      let groupSubLabel = ''
      if (useSharedGroupOrder) {
        if (GROUP_SUBORDER_LETTERS[index]) {
          groupSubLabel = GROUP_SUBORDER_LETTERS[index]
        } else {
          groupSubLabel = String(index + 1)
        }
      } else if (question.showOrder) {
        groupSubLabel = String(question.displayOrder)
      }

      // matching turidagi savollar qaysi variantlar hali bo'sh ekanini bilishi kerak
      let matchingOptions = []
      if (question.type === 'Matching') {
        matchingOptions = getAvailableMatchingOptions(normalizedGroupId, question.id)
      }

      return {
        ...question,
        groupSubLabel,
        shouldSeparate: shouldSeparateGroupedQuestion(normalizedGroupId, question.id),
        matchingOptions,
      }
    })

    models.set(normalizedGroupId, {
      orderLabel,
      optionBank: getAvailableMatchingOptions(normalizedGroupId),
      questions,
    })
  }

  return models
})

// render uchun tayyor savollar massivini quramiz (tartib va guruh flag'lari bilan)
const renderedQuestions = computed(() => {
  const shownGroups = new Set()
  let previousOrderLabel = null

  let sourceQuestions = []
  if (currentTest.value && currentTest.value.questions) {
    sourceQuestions = currentTest.value.questions
  }

  // backend savollarni har xil tartibda qaytarishi mumkin — `order` bo'yicha
  // o'sish tartibida saralaymiz, teng bo'lsa `id` bo'yicha barqaror tartib.
  const sortedQuestions = [...sourceQuestions].sort((firstQuestion, secondQuestion) => {
    const firstOrder = Number(firstQuestion.order)
    const secondOrder = Number(secondQuestion.order)
    const safeFirstOrder = Number.isFinite(firstOrder) ? firstOrder : Number.POSITIVE_INFINITY
    const safeSecondOrder = Number.isFinite(secondOrder) ? secondOrder : Number.POSITIVE_INFINITY
    if (safeFirstOrder !== safeSecondOrder) {
      return safeFirstOrder - safeSecondOrder
    }
    return Number(firstQuestion.id) - Number(secondQuestion.id)
  })

  return sortedQuestions.map((question, index) => {
    // bu savol qaysi guruhga tegishli ekanini topamiz (agar bor bo'lsa)
    let group = null
    if (question.questionGroupId) {
      group = questionGroupsById.value.get(Number(question.questionGroupId))
    }

    // bu savolga qaysi raqam ko'rsatilishini hal qilamiz
    const normalizedOrder = Number(question.order)
    let displayOrder = index + 1
    if (Number.isFinite(normalizedOrder) && normalizedOrder > 0) {
      displayOrder = normalizedOrder
    }
    const orderLabel = String(displayOrder)

    // bu guruhning birinchi uchrashuvi? unda guruh sarlavhasini chiqaramiz
    let showGroupBlock = false
    if (group && !shownGroups.has(Number(group.id))) {
      showGroupBlock = true
    }

    // ketma-ket ikki savol bir xil raqamga ega bo'lsa, ikkinchisida raqamni ko'rsatmaymiz
    const showOrder = orderLabel !== previousOrderLabel

    if (showGroupBlock) {
      shownGroups.add(Number(group.id))
    }

    previousOrderLabel = orderLabel

    return {
      ...question,
      displayOrder,
      showOrder,
      showGroupBlock,
      text: getEntityText(question),
      imageUrl: getEntityImageUrl(question),
      groupTitle: getEntityText(group),
      groupImageUrl: getEntityImageUrl(group),
    }
  })
})

// sahifada ko'rsatiladigan xato matnini tanlaymiz
const resolvedErrorMessage = computed(() => {
  if (pageErrorKey.value) {
    return t(pageErrorKey.value)
  }

  return testStore.errorMessage
})

// testni ko'rsatishimiz mumkinmi? — endi faqat test yuklanganligi yetarli;
// profil tekshiruvi olib tashlangan (login bo'lmasa /login ga yo'naltiriladi).
const canAccessTest = computed(() => Boolean(currentTest.value))

const totalQuestions = computed(() => renderedQuestions.value.length)

// test har doim 60 daqiqa davom etadi
const TEST_DURATION_MINUTES = 60
const TEST_DURATION_SECONDS = TEST_DURATION_MINUTES * 60
const totalDurationMinutes = computed(() => TEST_DURATION_MINUTES)

// erkin javob HTML satrida haqiqiy mazmun (matn yoki inline math) borligini tekshiramiz
const hasFreeAnswerContent = (value) => {
  if (typeof value !== 'string') {
    return false
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return false
  }

  // inline-math element matni bo'sh bo'lsa ham mazmun sifatida hisoblanadi
  if (/data-type=["']inline-math["']/i.test(normalizedValue)) {
    return true
  }

  // HTML teglarini olib tashlab, ko'rinadigan matn qolganini tekshiramiz
  let textContent = normalizedValue
  textContent = textContent.replace(/<br\s*\/?>/gi, ' ')
  textContent = textContent.replace(/<\/p>/gi, ' ')
  textContent = textContent.replace(/<[^>]+>/g, '')
  textContent = textContent.replace(/&nbsp;/gi, ' ')
  textContent = textContent.trim()

  if (textContent) {
    return true
  }
  return false
}

// foydalanuvchi nechta savolga javob berganini sanaymiz
const answeredCount = computed(() => {
  let count = 0
  for (const question of renderedQuestions.value) {
    if (question.type === 'FreeAnswer') {
      // erkin javoblar faqat ko'rinadigan mazmun bo'lsa hisoblanadi
      if (hasFreeAnswerContent(getResolvedFreeAnswer(question.id))) {
        count += 1
      }
    } else {
      // multiple-choice / matching turlari biror qiymat tanlangan bo'lsa hisoblanadi
      if (answers[question.id]) {
        count += 1
      }
    }
  }
  return count
})

// barcha javoblarning JSON snapshot'i — saqlash qatlami uchun watch trigger sifatida ishlatiladi
const serializedAnswers = computed(() => {
  const result = {}

  for (const question of renderedQuestions.value) {
    let answer
    if (question.type === 'FreeAnswer') {
      answer = getResolvedFreeAnswer(question.id)
    } else {
      answer = answers[question.id]
    }

    if (typeof answer === 'string') {
      // satrlar uchun bo'shlarni tashlab yuboramiz, erkin javoblar mazmunli ekaniga ishonch hosil qilamiz
      let isMeaningful = false
      if (question.type === 'FreeAnswer') {
        isMeaningful = hasFreeAnswerContent(answer)
      } else {
        isMeaningful = Boolean(answer.trim())
      }

      if (isMeaningful) {
        result[question.id] = answer
      }
    } else if (answer !== undefined && answer !== null && answer !== '') {
      // raqamlar / variant id'lari
      result[question.id] = answer
    }
  }

  return JSON.stringify(result)
})

// savolning erkin javobini xavfsiz olish uchun getter
const getResolvedFreeAnswer = (questionId) => {
  if (typeof freeAnswers[questionId] === 'string') {
    return freeAnswers[questionId]
  }
  return ''
}

// HTML bo'lishi mumkin bo'lgan satrni oddiy matnga aylantiramiz, inline-math'larni LaTeX'iga yoyamiz
const extractTextAnswer = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return ''
  }

  // HTML ham, DOM ham yo'q: boshqa hech narsa qilmaymiz
  if (!normalizedValue.includes('<') || typeof document === 'undefined') {
    return normalizedValue
  }

  // DOM orqali tahlil qilamiz, shunda inline-math span'larini olib tashlay olamiz
  const container = document.createElement('div')
  container.innerHTML = normalizedValue

  const mathNodes = container.querySelectorAll('[data-type="inline-math"]')
  mathNodes.forEach((node) => {
    // editor ishlatishi mumkin bo'lgan turli atributlarni sinab ko'ramiz
    let latexValue = node.getAttribute('data-latex')
    if (!latexValue) {
      latexValue = node.getAttribute('data-math-latex')
    }
    if (!latexValue) {
      latexValue = node.getAttribute('data-math')
    }
    if (!latexValue) {
      latexValue = node.textContent
    }
    if (!latexValue) {
      latexValue = ''
    }

    node.replaceWith(document.createTextNode(` ${latexValue} `))
  })

  let text = container.textContent
  if (!text) {
    text = ''
  }

  return text.replace(/\s+/g, ' ').trim()
}

// guruh ichidagi savollarni qaytaramiz, tartib bo'yicha, keyin id bo'yicha saralangan
const getGroupedQuestions = (groupId) => {
  const normalizedGroupId = Number(groupId)
  const group = questionGroupsById.value.get(normalizedGroupId)

  if (!group) {
    return []
  }

  // avval guruhning o'z savollar massivini olamiz, bo'lmasa umumiy ro'yxatdan filtrlaymiz
  let groupQuestions
  if (Array.isArray(group.questions) && group.questions.length > 0) {
    groupQuestions = group.questions
  } else {
    let allQuestions = []
    if (currentTest.value && currentTest.value.questions) {
      allQuestions = currentTest.value.questions
    }
    groupQuestions = allQuestions.filter(
      (question) => Number(question.questionGroupId) === normalizedGroupId,
    )
  }

  // tartib bo'yicha o'sish tartibida, teng bo'lsa id bo'yicha o'sish tartibida.
  // NaN xavfsiz: order yo'q yoki noto'g'ri bo'lgan savollar ro'yxat oxiriga tushadi.
  const sortedGroup = [...groupQuestions].sort((firstQuestion, secondQuestion) => {
    const firstOrder = Number(firstQuestion.order)
    const secondOrder = Number(secondQuestion.order)
    const safeFirstOrder = Number.isFinite(firstOrder) ? firstOrder : Number.POSITIVE_INFINITY
    const safeSecondOrder = Number.isFinite(secondOrder) ? secondOrder : Number.POSITIVE_INFINITY
    if (safeFirstOrder !== safeSecondOrder) {
      return safeFirstOrder - safeSecondOrder
    }
    return Number(firstQuestion.id) - Number(secondQuestion.id)
  })

  // har birini render qilingan ekvivalentiga aylantiramiz (agar mavjud bo'lsa)
  return sortedGroup.map((question) => {
    const renderedQuestion = renderedQuestionsById.value.get(Number(question.id))
    if (renderedQuestion) {
      return renderedQuestion
    }
    return question
  })
}

// guruh ichida matching savoldan keyin keladigan boshqa turdagi savolga
// vizual ajratish kerak
const shouldSeparateGroupedQuestion = (groupId, questionId) => {
  const groupedQuestions = getGroupedQuestions(groupId)
  const currentIndex = groupedQuestions.findIndex(
    (question) => Number(question.id) === Number(questionId),
  )

  if (currentIndex <= 0) {
    return false
  }

  const previousQuestion = groupedQuestions[currentIndex - 1]
  const currentQuestion = groupedQuestions[currentIndex]

  if (!previousQuestion || !currentQuestion) {
    return false
  }

  if (previousQuestion.type === 'Matching' && currentQuestion.type !== 'Matching') {
    return true
  }
  return false
}

// matching savollar uchun: option-bank'dan qaysi elementlar hali bo'shligini aniqlaymiz
const getAvailableMatchingOptions = (groupId, currentQuestionId = null) => {
  const group = questionGroupsById.value.get(Number(groupId))

  if (!group) {
    return []
  }

  // guruhdagi BOSHQA matching savollar tomonidan tanlangan variant id'larini yig'amiz
  const takenOptionIds = new Set()
  for (const question of getGroupedQuestions(groupId)) {
    if (question.type !== 'Matching') {
      continue
    }
    if (Number(question.id) === Number(currentQuestionId)) {
      continue
    }

    const pickedAnswer = answers[question.id]
    if (pickedAnswer !== undefined && pickedAnswer !== null && pickedAnswer !== '') {
      takenOptionIds.add(pickedAnswer)
    }
  }

  // bo'sh variantlar yoki joriy savolning o'zi tanlagan variantni qoldiramiz
  let options = []
  if (group.options) {
    options = group.options
  }

  return options.filter((option) => {
    if (!takenOptionIds.has(option.id)) {
      return true
    }

    // joriy savolning o'z tanlovi unga ko'rinib turishi kerak
    if (Number(answers[currentQuestionId]) === Number(option.id)) {
      return true
    }

    return false
  })
}

// localStorage'dagi ishonchsiz ma'lumotdan action obyektini qayta quramiz
const normalizeStoredAnswerAction = (action) => {
  let testId = 0
  if (action) {
    testId = Number(action.testId)
  }

  let questionId = 0
  if (action) {
    questionId = Number(action.questionId)
  }

  if (!testId || !questionId) {
    return null
  }

  // attempt id null bo'lishi mumkin
  let attemptId = null
  if (action && action.attemptId) {
    attemptId = Number(action.attemptId)
  }

  let selectedOptionId = 0
  if (action && action.selectedOptionId) {
    selectedOptionId = Number(action.selectedOptionId)
  }

  let textAnswer = null
  if (action && typeof action.textAnswer === 'string') {
    textAnswer = action.textAnswer
  }

  // faqat PUT saqlanib qoladi; qolgan hamma narsa (undefined ham) POST bo'ladi
  let requestMethod = 'POST'
  if (action && action.requestMethod === 'PUT') {
    requestMethod = 'PUT'
  }

  let hasCreatedRemoteRecord = false
  if (action && action.hasCreatedRemoteRecord) {
    hasCreatedRemoteRecord = true
  }

  // isPending default true bo'ladi, faqat aniq false bo'lsagina false
  let isPending = true
  if (action && action.isPending === false) {
    isPending = false
  }

  const now = Date.now()
  let createdAt = now
  if (action && action.createdAt) {
    createdAt = Number(action.createdAt)
  }

  let updatedAt = now
  if (action && action.updatedAt) {
    updatedAt = Number(action.updatedAt)
  }

  return {
    testId,
    attemptId,
    questionId,
    selectedOptionId,
    textAnswer,
    requestMethod,
    hasCreatedRemoteRecord,
    isPending,
    createdAt,
    updatedAt,
  }
}

// navbatdagi action'larni localStorage'ga yozamiz
const persistAnswerActions = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ANSWER_ACTIONS_STORAGE_KEY, JSON.stringify(answerActions.value))
}

// xotiradagi navbatni yangilaymiz HAM saqlaymiz
const setAnswerActions = (nextActions) => {
  answerActions.value = nextActions
  persistAnswerActions()
}

// startup paytida localStorage'dan navbatdagi action'larni yuklaymiz
const hydrateAnswerActions = () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const storedValue = window.localStorage.getItem(ANSWER_ACTIONS_STORAGE_KEY)

    if (!storedValue) {
      answerActions.value = []
      return
    }

    const parsedValue = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      setAnswerActions([])
      return
    }

    // normallashtiramiz va validatsiyadan o'tmagan qatorlarni tashlab yuboramiz
    const normalized = []
    for (const raw of parsedValue) {
      const cleaned = normalizeStoredAnswerAction(raw)
      if (cleaned) {
        normalized.push(cleaned)
      }
    }
    answerActions.value = normalized
  } catch (error) {
    console.error(error)
    setAnswerActions([])
  }
}

// berilgan savol uchun javob payload'ining draft'ini quramiz
const buildAnswerActionDraft = (questionId) => {
  const question = renderedQuestionsById.value.get(Number(questionId))

  if (!question) {
    return null
  }
  if (!currentTest.value || !currentTest.value.id) {
    return null
  }

  // draft bosqichida attempt id majburiy emas
  let attemptId = null
  if (activeAttemptId.value) {
    attemptId = Number(activeAttemptId.value)
  }

  // erkin javoblar matn olib yuradi; qolganlari variant id'sini olib yuradi
  if (question.type === 'FreeAnswer') {
    return {
      testId: Number(currentTest.value.id),
      attemptId,
      questionId: Number(question.id),
      selectedOptionId: 0,
      textAnswer: extractTextAnswer(getResolvedFreeAnswer(question.id)),
    }
  }

  let selectedOptionId = 0
  if (answers[question.id]) {
    selectedOptionId = Number(answers[question.id])
  }

  return {
    testId: Number(currentTest.value.id),
    attemptId,
    questionId: Number(question.id),
    selectedOptionId,
    textAnswer: null,
  }
}

// savol uchun navbatdagi action'ni qo'shamiz yoki almashtiramiz
const upsertAnswerAction = (questionId) => {
  const draft = buildAnswerActionDraft(questionId)

  if (!draft) {
    return
  }

  const nextActions = [...answerActions.value]
  const existingActionIndex = nextActions.findIndex(
    (action) =>
      Number(action.testId) === Number(draft.testId) &&
      Number(action.questionId) === Number(draft.questionId),
  )
  const timestamp = Date.now()

  // qator hali yo'q — yangi POST action qo'shamiz
  if (existingActionIndex < 0) {
    nextActions.push({
      ...draft,
      requestMethod: 'POST',
      hasCreatedRemoteRecord: false,
      isPending: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    setAnswerActions(nextActions)
    return
  }

  const existingAction = nextActions[existingActionIndex]

  // eng aniq ma'lum attempt id'ni tanlaymiz (avval draft, keyin mavjudi, keyin null)
  let nextAttemptId = null
  if (draft.attemptId !== null && draft.attemptId !== undefined) {
    nextAttemptId = draft.attemptId
  } else if (existingAction.attemptId !== null && existingAction.attemptId !== undefined) {
    nextAttemptId = existingAction.attemptId
  }

  // serverda qator yaratilgach, keyingi yangilashlar uchun PUT'ga o'tamiz
  let requestMethod = 'POST'
  if (existingAction.hasCreatedRemoteRecord) {
    requestMethod = 'PUT'
  }

  nextActions[existingActionIndex] = {
    ...existingAction,
    ...draft,
    attemptId: nextAttemptId,
    requestMethod,
    isPending: true,
    updatedAt: timestamp,
  }

  setAnswerActions(nextActions)
}

// haqiqiy attempt id ma'lum bo'lgach, uni bu testning barcha navbatdagi action'lariga yozamiz
const syncAnswerActionAttemptIds = () => {
  if (!currentTest.value || !currentTest.value.id) {
    return
  }
  if (!activeAttemptId.value) {
    return
  }

  const normalizedTestId = Number(currentTest.value.id)
  const normalizedAttemptId = Number(activeAttemptId.value)
  let hasChanges = false

  const nextActions = answerActions.value.map((action) => {
    if (Number(action.testId) !== normalizedTestId) {
      return action
    }

    let currentAttempt = 0
    if (action.attemptId) {
      currentAttempt = Number(action.attemptId)
    }

    if (currentAttempt === normalizedAttemptId) {
      return action
    }

    hasChanges = true

    return {
      ...action,
      attemptId: normalizedAttemptId,
    }
  })

  if (hasChanges) {
    setAnswerActions(nextActions)
  }
}

// berilgan testga tegishli barcha navbatdagi action'larni o'chiramiz (restart paytida)
const clearAnswerActionsForTest = (testId) => {
  if (!testId) {
    return
  }

  const normalizedTestId = Number(testId)

  setAnswerActions(
    answerActions.value.filter((action) => Number(action.testId) !== normalizedTestId),
  )
}

// matching savol variant tanladi
const updateMatchingAnswer = (questionId, value) => {
  if (value) {
    answers[questionId] = Number(value)
  } else {
    answers[questionId] = ''
  }
  dirtyQuestionIds.add(String(questionId))
  upsertAnswerAction(questionId)
  void syncDirtyAnswers()
}

// multiple-choice savol variant tanladi
const updateOptionAnswer = (questionId, value) => {
  answers[questionId] = value
  dirtyQuestionIds.add(String(questionId))
  upsertAnswerAction(questionId)
  void syncDirtyAnswers()
}

// xotiradagi barcha javoblarni tozalaymiz (test o'zgarsa yoki restart bo'lsa)
const clearAnswers = () => {
  for (const answerKey of Object.keys(answers)) {
    delete answers[answerKey]
  }

  for (const answerKey of Object.keys(freeAnswers)) {
    delete freeAnswers[answerKey]
  }
}

// erkin javob input'i o'zgardi
const updateFreeAnswer = (questionId, value) => {
  freeAnswers[questionId] = value
  dirtyQuestionIds.add(String(questionId))
  upsertAnswerAction(questionId)
  void syncDirtyAnswers()
}

// yordam oynasini ochish/yopish
const toggleReferenceWindow = () => {
  isReferenceOpen.value = !isReferenceOpen.value
}

const closeReferenceWindow = () => {
  isReferenceOpen.value = false
}

// test yuklangach, URL'dan ?restart=1 flag'ini olib tashlaymiz
const clearRestartQuery = async () => {
  if (!shouldRestartTest.value) {
    return
  }

  const nextQuery = { ...route.query }
  delete nextQuery.restart
  await router.replace({ query: nextQuery })
}

// sanoq taymerni to'xtatamiz
const stopTimer = () => {
  if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
}

// sanoq taymerni ishga tushiramiz; istasak saqlangan qolgan sekundlardan davom etamiz
const startTimer = (_questionCount, initialRemainingSeconds = null) => {
  stopTimer()

  const resumeSeconds = Number(initialRemainingSeconds)
  // saqlangan jarayonni davom ettiryapmizmi?
  let canResume = false
  if (Number.isFinite(resumeSeconds) && resumeSeconds > 0) {
    canResume = true
  }

  let durationInSeconds = TEST_DURATION_SECONDS
  if (canResume) {
    durationInSeconds = resumeSeconds
  }

  const durationInMilliseconds = Math.max(durationInSeconds, 0) * 1000
  const startedAt = Date.now()

  remainingSeconds.value = Math.max(Math.ceil(durationInMilliseconds / 1000), 0)

  if (durationInMilliseconds <= 0) {
    return durationInMilliseconds
  }

  // asosiy tick — har sekundda bajariladi, 0 ga yetganda auto-submit'ni ishga tushiradi
  const tick = () => {
    const elapsedMilliseconds = Date.now() - startedAt
    const nextDurationMs = Math.max(durationInMilliseconds - elapsedMilliseconds, 0)

    remainingSeconds.value = Math.max(Math.ceil(nextDurationMs / 1000), 0)

    if (nextDurationMs <= 0) {
      stopTimer()
      void autoSubmitOnTimeUp()
    }
  }

  timerIntervalId = window.setInterval(tick, 1000)
  tick()

  return durationInMilliseconds
}

// localStorage'dan javoblar + scroll holatini qaytaramiz
const restoreProgress = async (testId) => {
  const savedProgress = testProgressStore.getProgress(testId)

  if (!savedProgress) {
    return
  }

  renderedQuestions.value.forEach((question) => {
    const questionId = String(question.id)

    if (question.type === 'FreeAnswer') {
      // erkin javoblar uchun avval bir nechta kalit ishlatgan edik — ularni tartib bilan tekshiramiz
      let savedFreeAnswer = ''
      if (savedProgress.freeAnswers && savedProgress.freeAnswers[questionId]) {
        savedFreeAnswer = savedProgress.freeAnswers[questionId]
      } else if (savedProgress.mathAnswers && savedProgress.mathAnswers[questionId]) {
        savedFreeAnswer = savedProgress.mathAnswers[questionId]
      } else if (savedProgress.textAnswers && savedProgress.textAnswers[questionId]) {
        savedFreeAnswer = savedProgress.textAnswers[questionId]
      } else if (
        savedProgress.answers &&
        typeof savedProgress.answers[questionId] === 'string'
      ) {
        savedFreeAnswer = savedProgress.answers[questionId]
      }

      if (typeof savedFreeAnswer === 'string' && savedFreeAnswer.trim()) {
        freeAnswers[questionId] = savedFreeAnswer
      }

      return
    }

    // multiple choice / matching — saqlangan variant id'ni yuklaymiz
    let savedAnswer
    if (savedProgress.answers) {
      savedAnswer = savedProgress.answers[questionId]
    }

    if (savedAnswer !== undefined && savedAnswer !== null && savedAnswer !== '') {
      answers[questionId] = savedAnswer
    }
  })

  await nextTick()

  // foydalanuvchi to'xtagan joyda paydo bo'lishi uchun scroll holatini qaytaramiz
  if (typeof savedProgress.scrollY === 'number') {
    window.scrollTo({
      top: savedProgress.scrollY,
      behavior: 'auto',
    })
  }
}

// API'dan eng so'nggi javoblar + attempt id'ni olamiz (yangi qurilmada davom ettirilganda)
const restoreProgressFromApi = async (testId) => {
  if (!testId) {
    return
  }

  let progress = null

  try {
    progress = await testStore.fetchTestProgress(testId)
  } catch (error) {
    console.error(error)
    return
  }

  if (!progress || !progress.id) {
    return
  }

  activeAttemptId.value = Number(progress.id)
  syncAnswerActionAttemptIds()

  let userAnswers = []
  if (Array.isArray(progress.userAnswers)) {
    userAnswers = progress.userAnswers
  }

  for (const userAnswer of userAnswers) {
    let normalizedQuestionId = 0
    if (userAnswer) {
      normalizedQuestionId = Number(userAnswer.questionId)
    }

    if (!normalizedQuestionId) {
      continue
    }

    const questionKey = String(normalizedQuestionId)
    const question = renderedQuestionsById.value.get(normalizedQuestionId)

    // erkin javob matni freeAnswers'ga tushadi
    if (question && question.type === 'FreeAnswer') {
      if (typeof userAnswer.textAnswer === 'string' && userAnswer.textAnswer.trim()) {
        freeAnswers[questionKey] = userAnswer.textAnswer
      }
      continue
    }

    // variant tipidagi javoblar answers map'iga tushadi
    let selectedOptionId = 0
    if (userAnswer && userAnswer.selectedOptionId) {
      selectedOptionId = Number(userAnswer.selectedOptionId)
    }

    if (selectedOptionId > 0) {
      answers[questionKey] = selectedOptionId
    }
  }
}

// joriy sahifa holatini localStorage'ga saqlaymiz, refresh paytida test o'rtasidan davom etish uchun
const persistCurrentProgress = () => {
  if (!shouldPersistProgress.value) {
    return
  }
  if (!currentTest.value) {
    return
  }

  const savedAnswers = JSON.parse(serializedAnswers.value)

  // agar haqiqatan ham hech narsa yo'q bo'lsa, saqlamaymiz
  let hasMeaningfulProgress = false
  if (activeAttemptId.value) {
    hasMeaningfulProgress = true
  } else if (Object.keys(savedAnswers).length > 0) {
    hasMeaningfulProgress = true
  } else if (remainingSeconds.value > 0) {
    hasMeaningfulProgress = true
  }

  if (!hasMeaningfulProgress) {
    testProgressStore.clearProgress(currentTest.value.id)
    return
  }

  testProgressStore.saveProgress({
    testId: currentTest.value.id,
    attemptId: activeAttemptId.value,
    title: currentTest.value.title,
    subject: t('math.subjectValue'),
    questionCount: totalQuestions.value,
    answeredCount: answeredCount.value,
    answers: savedAnswers,
    freeAnswers: { ...freeAnswers },
    remainingSeconds: remainingSeconds.value,
    completed: false,
  })
}

// create-answer POST so'rovi uchun body quramiz
const buildCreateAnswerPayload = (action) => {
  if (!action || !action.attemptId) {
    return null
  }

  let selectedOptionId = 0
  if (action.selectedOptionId) {
    selectedOptionId = Number(action.selectedOptionId)
  }

  let textAnswer = null
  if (typeof action.textAnswer === 'string') {
    textAnswer = action.textAnswer
  }

  return {
    userTestAttemptId: Number(action.attemptId),
    questionId: Number(action.questionId),
    selectedOptionId,
    textAnswer,
  }
}

// update-answer PUT so'rovi uchun body quramiz
const buildUpdateAnswerPayload = (action) => {
  let attemptId = 0
  if (action.attemptId) {
    attemptId = Number(action.attemptId)
  }

  let selectedOptionId = 0
  if (action.selectedOptionId) {
    selectedOptionId = Number(action.selectedOptionId)
  }

  let textAnswer = null
  if (typeof action.textAnswer === 'string') {
    textAnswer = action.textAnswer
  }

  return {
    userTestAttemptId: attemptId,
    questionId: Number(action.questionId),
    selectedOptionId,
    textAnswer,
  }
}

// action'ni pending->synced'ga o'tkazamiz; sync paytida foydalanuvchi tahrir qilgan bo'lsa, pending qoldiramiz
const markAnswerActionAsSynced = (syncedAction, syncedUpdatedAt) => {
  const nextActions = answerActions.value.map((action) => {
    if (
      Number(action.testId) !== Number(syncedAction.testId) ||
      Number(action.questionId) !== Number(syncedAction.questionId)
    ) {
      return action
    }

    const wasEditedDuringSync = Number(action.updatedAt) !== Number(syncedUpdatedAt)

    // qaysi attempt id'ni saqlab qolishni aniqlaymiz
    let attemptId = null
    if (syncedAction.attemptId !== null && syncedAction.attemptId !== undefined) {
      attemptId = syncedAction.attemptId
    } else if (action.attemptId !== null && action.attemptId !== undefined) {
      attemptId = action.attemptId
    }

    return {
      ...action,
      attemptId,
      hasCreatedRemoteRecord: true,
      requestMethod: 'PUT',
      isPending: wasEditedDuringSync,
    }
  })

  setAnswerActions(nextActions)

  // sync paytida hech narsa o'zgarmagan bo'lsa, bu savolni dirty deb kuzatishni to'xtatamiz
  const latestAction = nextActions.find(
    (action) =>
      Number(action.testId) === Number(syncedAction.testId) &&
      Number(action.questionId) === Number(syncedAction.questionId),
  )

  if (latestAction && !latestAction.isPending) {
    dirtyQuestionIds.delete(String(syncedAction.questionId))
  }
}

// navbatdagi barcha action'larni serverga jo'natamiz, tartib bilan, bittadan
const syncDirtyAnswers = async () => {
  if (!activeAttemptId.value) {
    return
  }
  if (!currentTest.value || !currentTest.value.id) {
    return
  }

  // Sync allaqachon ishlayapti; oxirgi tahrirning yuborilishi uchun yana bir o'tishni navbatga qo'yamiz.
  if (isSyncingAnswers) {
    pendingSyncRequested = true
    return
  }

  syncAnswerActionAttemptIds()

  // shu testga tegishli pending action'larni yig'amiz
  const pendingActions = []
  for (const action of answerActions.value) {
    if (Number(action.testId) === Number(currentTest.value.id) && action.isPending) {
      pendingActions.push(action)
    }
  }

  if (pendingActions.length === 0) {
    return
  }

  isSyncingAnswers = true

  try {
    for (const action of pendingActions) {
      try {
        const syncedUpdatedAt = action.updatedAt

        // PUT faqat serverda qator yaratilgandan keyin
        let requestMethod = 'POST'
        if (action.hasCreatedRemoteRecord || action.requestMethod === 'PUT') {
          requestMethod = 'PUT'
        }

        let payload
        if (requestMethod === 'PUT') {
          console.log("working put")
          // payload = buildUpdateAnswerPayload(action)
        } else {
          payload = buildCreateAnswerPayload(action)
        }

        if (!payload) {
          continue
        }

        if (requestMethod === 'PUT') {
          console.log("working put")
          // await testStore.updateUserAnswer(payload)
        } else {
          await testStore.createUserAnswer(payload)
        }

        markAnswerActionAsSynced(action, syncedUpdatedAt)
      } catch (error) {
        // muvaffaqiyatsiz sync dirty bo'lib qoladi, keyingi safar qayta urinamiz
        dirtyQuestionIds.add(String(action.questionId))
        console.error(error)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSyncingAnswers = false
  }

  // biz band paytimizda yana sync so'ralgan bo'lsa, hozir bajaramiz
  if (pendingSyncRequested) {
    pendingSyncRequested = false
    void syncDirtyAnswers()
  }
}

// bu test uchun user-test-attempt mavjudligini ta'minlaymiz
const ensureAttemptStarted = async (test) => {
  if (!test || !test.id) {
    activeAttemptId.value = null
    return
  }

  if (isStartingAttempt || activeAttemptId.value) {
    return
  }

  const savedProgress = testProgressStore.getProgress(test.id)

  // oldingi sessionda allaqachon attempt boshlagan edik — uni qayta olamiz
  if (savedProgress && savedProgress.attemptId) {
    activeAttemptId.value = Number(savedProgress.attemptId)
    syncAnswerActionAttemptIds()
    persistCurrentProgress()
    void syncDirtyAnswers()
    return
  }

  // API'dan yangi attempt boshlashni so'raymiz
  try {
    isStartingAttempt = true
    const attempt = await testStore.startTestAttempt(test.id)
    activeAttemptId.value = Number(attempt.id)
    syncAnswerActionAttemptIds()
    persistCurrentProgress()
    void syncDirtyAnswers()
  } catch (error) {
    console.error(error)
  } finally {
    isStartingAttempt = false
  }
}

// asosiy "shu testni ochish" oqimi
const loadTest = async (testId) => {
  shouldPersistProgress.value = true
  pageErrorKey.value = ''
  testStore.clearError()

  // chiqish: id yo'q → missing-id xatosi
  if (!testId) {
    clearAnswers()
    activeAttemptId.value = null
    dirtyQuestionIds.clear()
    closeReferenceWindow()
    testStore.clearCurrentTest()
    pageErrorKey.value = 'testPage.missingId'
    return
  }

  // chiqish: tizimga kirilmagan → /login sahifasiga yo'naltiramiz, login
  // sahifasi `?reason=auth-required` query orqali kichik toast ko'rsatadi.
  if (!authStore.isAuthenticated) {
    clearAnswers()
    activeAttemptId.value = null
    dirtyQuestionIds.clear()
    closeReferenceWindow()
    testStore.clearCurrentTest()
    shouldPersistProgress.value = false
    await router.replace({
      path: '/login',
      query: { reason: 'auth-required', redirect: route.fullPath },
    })
    return
  }

  // kerakli test allaqachon yuklangan — qayta fetch qilmasdan restart / resume holatlarini hal qilamiz
  if (currentTest.value && Number(currentTest.value.id) === Number(testId)) {
    if (shouldRestartTest.value && currentTest.value) {
      // boshidan boshlaymiz
      clearAnswers()
      activeAttemptId.value = null
      dirtyQuestionIds.clear()
      testProgressStore.clearProgress(testId)
      clearAnswerActionsForTest(testId)

      let questionCount = totalQuestions.value
      if (!questionCount) {
        let length = 0
        if (currentTest.value.questions) {
          length = currentTest.value.questions.length
        }
        questionCount = Number(length)
      }

      startTimer(questionCount, null)
      await ensureAttemptStarted(currentTest.value)
      await clearRestartQuery()
      return
    }

    // hali attempt yo'q — agar bo'lsa, saqlangan jarayondan davom etamiz
    if (!activeAttemptId.value && currentTest.value) {
      const savedProgress = testProgressStore.getProgress(testId)
      await ensureAttemptStarted(currentTest.value)

      let questionCount = totalQuestions.value
      if (!questionCount) {
        let length = 0
        if (currentTest.value.questions) {
          length = currentTest.value.questions.length
        }
        questionCount = Number(length)
      }

      let resumeSeconds = null
      if (savedProgress && savedProgress.remainingSeconds !== undefined && savedProgress.remainingSeconds !== null) {
        resumeSeconds = savedProgress.remainingSeconds
      }

      startTimer(questionCount, resumeSeconds)
    }
    return
  }

  // boshqa test — tozalab, yangidan fetch qilamiz
  clearAnswers()
  activeAttemptId.value = null
  dirtyQuestionIds.clear()
  testStore.clearCurrentTest()

  try {
    await testStore.fetchTestById(testId)
  } catch (error) {
    console.error(error)
  }
}

// brauzerdan sahifani fullscreen rejimiga o'tkazishni so'raymiz
const enterFullscreen = async () => {
  if (typeof document === 'undefined' || document.fullscreenElement) {
    return
  }

  const element = document.documentElement
  // brauzerlar uzoq yillar bu metodni har xil nomlab kelgan
  let request = element.requestFullscreen
  if (!request) {
    request = element.webkitRequestFullscreen
  }
  if (!request) {
    request = element.msRequestFullscreen
  }

  if (typeof request !== 'function') {
    return
  }

  try {
    await request.call(element)
  } catch (error) {
    console.error(error)
  }
}

// fullscreen'dan chiqamiz
const exitFullscreen = () => {
  if (typeof document === 'undefined' || !document.fullscreenElement) {
    return
  }

  let exit = document.exitFullscreen
  if (!exit) {
    exit = document.webkitExitFullscreen
  }
  if (!exit) {
    exit = document.msExitFullscreen
  }

  if (typeof exit !== 'function') {
    return
  }

  try {
    void exit.call(document)
  } catch (error) {
    console.error(error)
  }
}

// "birinchi gesture" fullscreen listener'larini olib tashlaymiz
function removeFullscreenGestureListeners() {
  if (typeof window === 'undefined') {
    return
  }

  window.removeEventListener('pointerdown', handleFullscreenGesture)
  window.removeEventListener('keydown', handleFullscreenGesture)
}

// foydalanuvchining birinchi harakati paytida bir marta chaqiriladi, fullscreen so'rashimiz uchun
const handleFullscreenGesture = () => {
  removeFullscreenGestureListeners()
  void enterFullscreen()
}

// yakuniy topshirish oqimi → explanation sahifasiga o'tamiz
const finishTestAndGoToExplanation = async () => {
  await syncDirtyAnswers()
  stopTimer()
  teardownFullscreen()
  showSubmitModal.value = false

  await router.push({
    name: 'explanation',
    query: {
      testId: currentTest.value.id,
      attemptId: activeAttemptId.value,
      readyToSubmit: '1',
    },
  })
}

// Brauzerlar fullscreen'ga faqat foydalanuvchi harakatidan keyin ruxsat beradi, shuning uchun
// darrov urinib ko'ramiz, bo'lmasa foydalanuvchining sahifa bilan birinchi muomalasini kutamiz.
const armFullscreen = () => {
  if (typeof window === 'undefined') {
    return
  }

  void enterFullscreen()
  removeFullscreenGestureListeners()
  window.addEventListener('pointerdown', handleFullscreenGesture)
  window.addEventListener('keydown', handleFullscreenGesture)
}

// foydalanuvchi test o'rtasida fullscreen'dan chiqsa, keyingi harakatda qayta kirish uchun tayyorlaymiz
const handleFullscreenChange = () => {
  if (!currentTest.value || isCompletingTest.value) {
    return
  }

  if (!document.fullscreenElement) {
    armFullscreen()
  }
}

// test yuklangach fullscreen bilan ishlashni o'rnatamiz
const setupFullscreen = () => {
  if (typeof window === 'undefined') {
    return
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  armFullscreen()
}

// fullscreen bilan ishlashni butunlay olib tashlaymiz
const teardownFullscreen = () => {
  if (typeof window === 'undefined') {
    return
  }

  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  removeFullscreenGestureListeners()
  exitFullscreen()
}

// test yuklangan va hali yakunlanmagan har qanday paytda navigatsiyada ogohlantiramiz.
// activeAttemptId'ni shart qilmaymiz — API attempt qaytarmasdan oldin foydalanuvchi
// refresh bossa ham brauzer'ning "Leave site?" dialogi chiqishi kerak.
const shouldBlockNavigation = computed(
  () => Boolean(currentTest.value) && !isCompletingTest.value && !isSubmittingTest.value,
)

// brauzer tab/oyna yopilishi yoki refresh bo'lishidan oldin ogohlantirish
// (zamonaviy brauzerlar maxsus matnni e'tiborsiz qoldiradi va o'z dialogi bilan so'raydi).
const handleBeforeUnload = (event) => {
  if (!shouldBlockNavigation.value) {
    return undefined
  }
  event.preventDefault()
  event.returnValue = ''
  return ''
}

// modaldagi "Chiqish" tugmasi — kechiktirilgan next()'ni davom ettiramiz
const confirmLeave = () => {
  showLeaveModal.value = false
  const callback = pendingNavigationCallback
  pendingNavigationCallback = null
  if (typeof callback === 'function') {
    callback()
  }
}

// modaldagi "Testga qaytish" tugmasi — navigatsiyani bekor qilamiz
const cancelLeave = () => {
  showLeaveModal.value = false
  const callback = pendingNavigationCallback
  pendingNavigationCallback = null
  if (typeof callback === 'function') {
    callback(false)
  }
}

// vue-router'ning ichki navigatsiyasini ushlaymiz — modal chiqaramiz va foydalanuvchi javobini kutamiz
onBeforeRouteLeave((_to, _from, next) => {
  if (!shouldBlockNavigation.value) {
    next()
    return
  }
  pendingNavigationCallback = next
  showLeaveModal.value = true
})

// URL'dagi testId o'zgarishlarini kuzatamiz (mount paytida bir marta ham ishlaydi)
watch(
  requestedTestId,
  (testId) => {
    void loadTest(testId)
  },
  {
    immediate: true,
  },
)

// test ma'lumoti yuklanib bo'lgandagi reaktsiya
watch(
  currentTest,
  async (test) => {
    if (!test) {
      // test yo'q → hammasini tozalaymiz
      closeReferenceWindow()
      stopTimer()
      teardownFullscreen()
      remainingSeconds.value = 0
      activeAttemptId.value = null
      return
    }

    setupFullscreen()
    const savedProgress = testProgressStore.getProgress(test.id)
    const shouldStartFresh = shouldRestartTest.value

    // URL'da restart=1 → bu testning mahalliy holatini butunlay tozalaymiz
    if (shouldStartFresh) {
      clearAnswers()
      activeAttemptId.value = null
      dirtyQuestionIds.clear()
      testProgressStore.clearProgress(test.id)
      clearAnswerActionsForTest(test.id)
    }

    let questionCount = totalQuestions.value
    if (!questionCount) {
      let length = 0
      if (test.questions) {
        length = test.questions.length
      }
      questionCount = Number(length)
    }

    // restart paytida saqlangan vaqtni e'tiborsiz qoldiramiz; aks holda davom ettiramiz
    let resumeSeconds = null
    if (!shouldStartFresh && savedProgress && savedProgress.remainingSeconds !== undefined && savedProgress.remainingSeconds !== null) {
      resumeSeconds = savedProgress.remainingSeconds
    }

    startTimer(questionCount, resumeSeconds)

    if (!shouldStartFresh) {
      await restoreProgress(test.id)
      await restoreProgressFromApi(test.id)
    }

    await ensureAttemptStarted(test)
    await clearRestartQuery()
  },
  {
    immediate: true,
  },
)

// javoblar / taymer / attempt id o'zgarganda, jarayonni localStorage'ga saqlaymiz
watch([serializedAnswers, remainingSeconds, activeAttemptId], () => {
  persistCurrentProgress()
})

// topshirish tasdiq modalini ochamiz
const handleSubmitTest = () => {
  showSubmitModal.value = true
}

// topshirish tasdiq modalini yopamiz (agar topshirilayotgan bo'lmasa)
const closeSubmitModal = () => {
  if (isSubmittingTest.value) {
    return
  }

  showSubmitModal.value = false
}

// foydalanuvchi "Ha, topshirish"ni bosdi
const confirmSubmitTest = async () => {
  if (isSubmittingTest.value) {
    return
  }

  if (!currentTest.value || !currentTest.value.id || !activeAttemptId.value) {
    showSubmitModal.value = false
    return
  }

  isSubmittingTest.value = true
  isCompletingTest.value = true

  try {
    await finishTestAndGoToExplanation()
  } catch (error) {
    console.error(error)
    isCompletingTest.value = false
  } finally {
    isSubmittingTest.value = false
  }
}

// vaqt tugadi → avtomatik tarzda topshiramiz
async function autoSubmitOnTimeUp() {
  if (isSubmittingTest.value) {
    return
  }
  if (isCompletingTest.value) {
    return
  }
  if (!currentTest.value || !currentTest.value.id) {
    return
  }
  if (!activeAttemptId.value) {
    return
  }

  isSubmittingTest.value = true
  isCompletingTest.value = true
  showSubmitModal.value = false

  try {
    await finishTestAndGoToExplanation()
  } catch (error) {
    console.error(error)
    isCompletingTest.value = false
  } finally {
    isSubmittingTest.value = false
  }
}

// lifecycle
onMounted(() => {
  testProgressStore.hydrate()
  hydrateAnswerActions()
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
})

onBeforeUnmount(() => {
  void syncDirtyAnswers()
  persistCurrentProgress()
  stopTimer()
  teardownFullscreen()
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})
</script>

<template>
  <main class="font-sans-custom min-h-screen bg-[#f5f3ef] pb-[190px] pt-2 text-black selection:bg-black selection:text-white sm:pb-[220px] sm:pt-6">

    <TestFloatingTools
      v-if="currentTest"
      :remaining-seconds="remainingSeconds"
    />


    <TestReferenceWindow
      v-if="currentTest && isReferenceOpen"
      :drag-label="t('testPage.dragHere')"
      :shrink-label="t('testPage.referenceShrink')"
      :grow-label="t('testPage.referenceGrow')"
      :close-label="t('testPage.referenceClose')"
      :sheet-alt-label="t('testPage.referenceSheetAlt')"
      :sheets="referenceSheets"
      @close="closeReferenceWindow"
    />

    <NSpin :show="testStore.isLoading">
      <div class="mx-auto max-w-[1280px] px-3 py-2 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
        <TestErrorState
          v-if="resolvedErrorMessage"
          :message="resolvedErrorMessage"
          :retry-label="t('testPage.retry')"
          @retry="loadTest(requestedTestId)"
        />

        <div
          v-else-if="canAccessTest"
          class="mx-auto max-w-[1040px]"
        >
          <button
            type="button"
            @click="toggleReferenceWindow"
            class="mb-3 inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[#e0ddd7] bg-white/95 px-4 text-center shadow-[0_4px_14px_rgba(15,23,42,0.05)] lg:fixed lg:left-2 lg:top-1/2 lg:z-20 lg:mb-0 lg:h-[168px] lg:w-[72px] lg:-translate-y-1/2 lg:flex-col lg:justify-between lg:gap-0 lg:rounded-[20px] lg:px-2.5 lg:py-4 xl:left-3"
          >
            <span class="font-serif-custom text-[20px] font-normal leading-none text-[#1a1814] lg:text-[28px]">
              x²
            </span>
            <span class="font-mono-custom text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a1814] lg:text-[9px] lg:[writing-mode:vertical-rl] lg:[text-orientation:mixed]">
              {{ t('testPage.reference') }}
            </span>
          </button>

          <div
            class="mx-auto min-h-[calc(100vh-11rem)] max-w-[920px] overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white px-4 pb-14 pt-5 shadow-[0_14px_40px_rgba(26,24,20,0.06)] ring-1 ring-[#ebe7e0] sm:min-h-[1056px] sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-16 lg:pb-20 lg:pt-12"
          >
            <div class="border-b border-[#e0ddd7] pb-5 sm:pb-8">
              <h1 class="font-serif-custom text-[2rem] font-normal leading-[0.96] tracking-[0.01em] text-[#1a1814] sm:text-[2.55rem] lg:text-4xl">
                {{ currentTest.title || t('testPage.title') }}
              </h1>
              <p class="font-mono-custom mt-3 text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-sm">
                {{ totalDurationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
              </p>
            </div>

            <div class="my-6 flex items-center gap-3 sm:my-10 sm:gap-4">
              <div class="h-px flex-1 bg-[#e0ddd7]"></div>
              <p class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.22em] text-[#8a857c] sm:text-xs">
                {{ t('testPage.sectionTitle') }}
              </p>
              <div class="h-px flex-1 bg-[#e0ddd7]"></div>
            </div>

            <div class="space-y-8 pb-3 sm:space-y-10 sm:pb-4">
              <div
                v-for="question in renderedQuestions"
                :key="question.id"
                class="question-block"
              >
                <TestQuestionGroup
                  v-if="question.questionGroupId && question.showGroupBlock"
                  :title="question.groupTitle"
                  :image-url="question.groupImageUrl"
                  :order-label="groupRenderModels.get(question.questionGroupId)?.orderLabel || ''"
                  :option-bank="groupRenderModels.get(question.questionGroupId)?.optionBank || []"
                  :questions="groupRenderModels.get(question.questionGroupId)?.questions || []"
                  :selected-answers="answers"
                  :resolve-free-answer="getResolvedFreeAnswer"
                  :image-alt="t('testPage.imageAlt')"
                  :option-bank-label="t('testPage.optionBank')"
                  :select-option-label="t('testPage.selectOption')"
                  :free-answer-label="t('testPage.freeAnswerLabel')"
                  :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
                  :open-math-label="t('testPage.openMathInput')"
                  :close-math-label="t('testPage.closeMathInput')"
                  @update-matching-answer="updateMatchingAnswer"
                  @update-option="updateOptionAnswer"
                  @update-free-answer="updateFreeAnswer"
                />

                <TestQuestionBlock
                  v-else-if="!question.questionGroupId"
                  :question="question"
                  :selected-answer="answers[question.id]"
                  :free-answer-value="getResolvedFreeAnswer(question.id)"
                  :image-alt="t('testPage.imageAlt')"
                  :free-answer-label="t('testPage.freeAnswerLabel')"
                  :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
                  :open-math-label="t('testPage.openMathInput')"
                  :close-math-label="t('testPage.closeMathInput')"
                  @update-option="updateOptionAnswer"
                  @update-free-answer="updateFreeAnswer"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-24"></div>
      </div>

      <TestBottomBar
        v-if="canAccessTest"
        :answered-count="answeredCount"
        :total-questions="totalQuestions"
        :answered-label="t('testPage.answered')"
        :submit-label="t('testPage.finish')"
        @submit="handleSubmitTest"
      />
    </NSpin>

    <NModal
      v-model:show="showSubmitModal"
      :mask-closable="!isSubmittingTest"
      :close-on-esc="!isSubmittingTest"
    >
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div>
              <h4 class="text-xl font-bold tracking-tight text-black">
                {{ t('testPage.submitConfirmTitle') }}
              </h4>
            </div>

            <div class="flex justify-center gap-3">
              <button
                type="button"
                @click="closeSubmitModal"
                :disabled="isSubmittingTest"
                class="inline-flex h-11 items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
              >
                {{ t('testPage.submitConfirmNo') }}
              </button>

              <button
                type="button"
                @click="confirmSubmitTest"
                :disabled="isSubmittingTest"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:bg-black"
              >
                {{ t('testPage.submitConfirmYes') }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>

    <NModal
      v-model:show="showLeaveModal"
      :mask-closable="false"
      :close-on-esc="false"
      @update:show="(value) => { if (!value) cancelLeave() }"
    >
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div class="space-y-2">
              <h4 class="text-xl font-bold tracking-tight text-black">
                {{ t('testPage.leaveConfirmTitle') }}
              </h4>
              <p class="text-sm text-[#6b6760]">
                {{ t('testPage.leaveConfirm') }}
              </p>
            </div>

            <div class="flex justify-center gap-3">
              <button
                type="button"
                @click="cancelLeave"
                class="inline-flex h-11 items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98]"
              >
                {{ t('testPage.leaveConfirmStay') }}
              </button>

              <button
                type="button"
                @click="confirmLeave"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
              >
                {{ t('testPage.leaveConfirmLeave') }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>

  </main>
</template>

<style scoped>
.submit-confetti-piece {
  pointer-events: none;
  position: absolute;
  z-index: 1;
  height: 18px;
  width: 8px;
  border-radius: 999px;
  animation: submit-confetti-float 1.4s ease-in-out infinite alternate;
  box-shadow: 0 8px 18px rgba(26, 24, 20, 0.14);
}

.submit-confetti-pop {
  animation: submit-confetti-pop 1.5s ease-in-out infinite;
}

@keyframes submit-confetti-float {
  from {
    opacity: 0.72;
    translate: 0 0;
  }

  to {
    opacity: 1;
    translate: 0 -16px;
  }
}

@keyframes submit-confetti-pop {
  0%,
  100% {
    opacity: 0.25;
    scale: 0.9;
  }

  50% {
    opacity: 0.55;
    scale: 1.08;
  }
}
</style>
