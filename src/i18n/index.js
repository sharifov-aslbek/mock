import { createI18n } from 'vue-i18n'
import messages from './messages'

const fallbackLocale = 'uz'

const getInitialLocale = () => {
  if (typeof window === 'undefined') {
    return fallbackLocale
  }

  const savedLocale = window.localStorage.getItem('locale')

  if (savedLocale && savedLocale in messages) {
    return savedLocale
  }

  return fallbackLocale
}

// Russian agrees the noun with the number ("1 секунду", "2 секунды",
// "5 секунд"), which vue-i18n's default one/other rule can't express. Messages
// that need it carry four forms — zero | one | few | many — in this order.
const russianPluralRule = (choice, choicesLength) => {
  if (choice === 0) return 0

  const isTeen = choice % 100 > 10 && choice % 100 < 20
  const lastDigit = choice % 10

  if (!isTeen && lastDigit === 1) return 1
  if (!isTeen && lastDigit >= 2 && lastDigit <= 4) return 2

  return choicesLength < 4 ? 2 : 3
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale,
  messages,
  pluralRules: {
    ru: russianPluralRule
  }
})

const setLocale = (nextLocale) => {
  if (!(nextLocale in messages)) {
    return
  }

  i18n.global.locale.value = nextLocale

  if (typeof document !== 'undefined') {
    document.documentElement.lang = nextLocale
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('locale', nextLocale)
  }
}

setLocale(i18n.global.locale.value)

export { i18n, setLocale }
