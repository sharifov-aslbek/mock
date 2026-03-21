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

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale,
  messages
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
