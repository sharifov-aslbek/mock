import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { applySeo } from '@/utils/seo'
// Import your page components
import LandingPage from '@/views/marketing/LandingPage.vue'
import MarketingLayout from '@/layouts/MarketingLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import PlatformLayout from '@/layouts/PlatformLayout.vue'
import AppShell from '@/layouts/AppShell.vue'
import BareLayout from '@/layouts/BareLayout.vue'

// The route table is split into four layout groups — the wall between the
// public "shop window" and the registered-users-only "workshop":
//
//   MarketingLayout  the new landing shell. Auth-free: no auth store, no
//                    session request on a logged-out visitor's page load.
//   PublicLayout     the existing public pages (subject pages, narxlar, the
//                    standalone demos). Public and indexed, but they keep the
//                    chrome and auth-aware behaviour they have today.
//   PlatformLayout   everything behind registration. Owns the guard.
//   BareLayout       the auth pages themselves.
//
// `meta.chrome: false` and `meta.support: false` replace the `layoutlessRoutes`
// / `supportlessRoutes` path arrays that used to live in App.vue.
const routes = [
  // ── (marketing) ──────────────────────────────────────────────────────────
  {
    path: '/',
    component: MarketingLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: LandingPage,
        meta: {
          seo: {
            description:
              "Milliy Mock — testlar, essay tekshirish va kurslar orqali o'qish jarayoningizni samarali va qiziqarli qiling.",
          },
        },
      },
      {
        path: 'natijalar',
        name: 'natijalar',
        // Public student success stories — proof for visitors who have never
        // registered. Deliberately NOT /result-exam, which is a logged-in
        // user's own results page.
        component: () => import('@/views/marketing/NatijalarPage.vue'),
        meta: {
          seo: {
            title: 'Natijalar',
            description:
              'MilliyMock o‘quvchilarining milliy sertifikat imtihonlaridagi natijalari va muvaffaqiyat hikoyalari.',
          },
        },
      },
      {
        path: 'platforma',
        name: 'platforma',
        component: () => import('@/views/marketing/PlatformaPage.vue'),
        meta: {
          seo: {
            title: 'Platforma',
            description:
              'MilliyMock platformasi: real test formati, batafsil natijalar va tayyorgarlikni kuzatib borish imkoniyati.',
          },
        },
      },
      {
        path: 'ai-tekshiruv',
        name: 'ai-tekshiruv',
        component: () => import('@/views/marketing/AiTekshiruvPage.vue'),
        meta: {
          seo: {
            title: 'AI tekshiruv',
            description:
              'Insho va yozma ishlaringizni sun’iy intellekt tekshiradi: xatolar, baho va aniq tavsiyalar.',
          },
        },
      },
    ],
  },

  // ── (marketing) — existing public pages, unchanged chrome ────────────────
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: 'narxlar',
        name: 'narxlar',
        component: () => import('@/views/PricingPage.vue'), // Lazy load the pricing page
        meta: {
          seo: {
            title: 'Narxlar',
            description:
              'MilliyMock tariflari va narxlari. O‘zingizga mos rejani tanlang va milliy sertifikat testlariga tayyorgarlikni boshlang.',
          },
        },
      },
      {
        // Old pricing URL. The client-side redirect keeps in-app links and
        // bookmarks working; the real 301 for crawlers is in public/serve.json.
        path: 'pricing',
        redirect: { name: 'narxlar' },
      },
      {
        path: 'math',
        name: 'math',
        component: () => import('@/views/SubjectPage.vue'),
        meta: {
          subjectKey: 'math',
          seo: {
            title: 'Matematika testlari',
            description:
              'Matematikadan milliy sertifikat testlarini real test formatida ishlang. O‘zingizga mos testni tanlang va darhol boshlang.',
          },
        },
      },
      {
        path: 'mashq',
        // Dev-only while the practice backend is built: visible on localhost,
        // production keeps redirecting home until /api/practice/* is live.
        ...(import.meta.env.DEV
          ? { name: 'mashq', component: () => import('@/views/MashqPage.vue') }
          : { redirect: '/' }),
      },
      {
        path: 'tarix',
        name: 'tarix',
        component: () => import('@/views/SubjectPage.vue'),
        meta: {
          subjectKey: 'history',
          seo: {
            title: 'Tarix testlari',
            description:
              'O‘zbekiston va jahon tarixi bo‘yicha milliy sertifikat testlarini ishlang va bilimingizni sinab ko‘ring.',
          },
        },
      },
      {
        path: 'fizika',
        name: 'fizika',
        component: () => import('@/views/SubjectPage.vue'),
        meta: {
          subjectKey: 'physics',
          seo: {
            title: 'Fizika testlari',
            description:
              'Fizikadan milliy sertifikat testlarini real test formatida ishlang. O‘zingizga mos testni tanlang va darhol boshlang.',
          },
        },
      },
      {
        path: 'biologiya',
        name: 'biologiya',
        component: () => import('@/views/BiologySubjectPage.vue'),
        meta: {
          subjectKey: 'biology',
          seo: {
            title: 'Biologiya testlari',
            description:
              'Biologiyadan milliy sertifikat namunaviy testlarini real test formatida ishlang. O‘zingizga mos testni tanlang va darhol boshlang.',
          },
        },
      },
      {
        path: 'biologiya/test',
        name: 'biologiya-test',
        component: () => import('@/views/BiologyDemoPage.vue'),
        meta: {
          chrome: false,
          support: false,
          seo: { title: 'Biologiya testi', robots: 'noindex, nofollow' },
        },
      },
      {
        path: 'ona-tili',
        name: 'ona-tili',
        component: () => import('@/views/OnaTiliPage.vue'),
        meta: {
          subjectKey: 'motherTongue',
          seo: {
            title: 'Ona tili testlari',
            description:
              'Ona tilidan milliy sertifikat testlarini real test formatida ishlang. O‘zingizga mos testni tanlang va darhol boshlang.',
          },
        },
      },
      {
        // The Ona tili exam preview graduated into the real /test flow (essay UI
        // included); old links land on the subject page.
        path: 'ona-tili-demo',
        redirect: '/ona-tili',
      },
      {
        path: 'ona-tili-demo-natija',
        // Results/analysis preview for the Ona tili demo (incl. the AI essay
        // analysis design). DEV-only, mirroring /ona-tili-demo.
        ...(import.meta.env.DEV
          ? {
              name: 'ona-tili-demo-natija',
              component: () => import('@/views/OnaTiliDemoResultPage.vue'),
              meta: { chrome: false, support: false },
            }
          : { redirect: '/ona-tili' }),
      },
    ],
  },

  // ── (app) — redesigned platform, behind registration ─────────────────────
  // The new shell (docs/DESIGN.md). Pre-existing platform pages stay on
  // PlatformLayout below with their current chrome until each one's screen is
  // designed and approved, so nothing that works today changes look early.
  {
    path: '/',
    component: AppShell,
    beforeEnter: (to) => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) return true
      return { name: 'register', query: { redirect: to.fullPath } }
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/app/DashboardPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Bosh sahifa', seo: { title: 'Bosh sahifa', robots: 'noindex, nofollow' } },
      },
      {
        path: 'testlar',
        name: 'testlar',
        component: () => import('@/views/app/TestlarPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Testlar', appIcon: 'tests', seo: { title: 'Testlar', robots: 'noindex, nofollow' } },
      },
      {
        // One subject's mock list — where a card in the Fanlar grid leads.
        path: 'testlar/:subject',
        name: 'testlar-subject',
        component: () => import('@/views/app/SubjectTestsPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Testlar', appIcon: 'tests', seo: { title: 'Testlar', robots: 'noindex, nofollow' } },
      },
      {
        path: 'essay',
        name: 'essay',
        component: () => import('@/views/app/AppPlaceholderPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Essay tekshirish', appIcon: 'essay', seo: { title: 'Essay tekshirish', robots: 'noindex, nofollow' } },
      },
      {
        path: 'yordam',
        name: 'yordam',
        component: () => import('@/views/app/AppPlaceholderPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Yordam', appIcon: 'help', seo: { title: 'Yordam', robots: 'noindex, nofollow' } },
      },
      {
        path: 'sozlamalar',
        name: 'sozlamalar',
        component: () => import('@/views/app/AppPlaceholderPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Sozlamalar', appIcon: 'settings', seo: { title: 'Sozlamalar', robots: 'noindex, nofollow' } },
      },
      {
        path: 'community',
        name: 'community',
        component: () => import('@/views/app/AppPlaceholderPage.vue'),
        meta: { requiresAuth: true, appTitle: 'Community', appIcon: 'community', seo: { title: 'Community', robots: 'noindex, nofollow' } },
      },
    ],
  },

  // ── (app) — existing platform pages, unchanged chrome ────────────────────
  {
    path: '/',
    component: PlatformLayout,
    // First of the two enforcement points. The global `beforeEach` below is the
    // other; the layout itself re-checks on mount and on auth-state changes.
    beforeEnter: (to) => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) return true
      return { name: 'register', query: { redirect: to.fullPath } }
    },
    children: [
      {
        path: 'result-exam',
        name: 'result-exam',
        component: () => import('@/views/ResultExamPage.vue'),
        meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } },
      },
      {
        // A single saved essay checking's analysis (opened from the Insholar tab
        // of the Natijalar page). Persisted client-side — see
        // utils/essayCheckingStorage.js.
        path: 'result-exam/essay/:id',
        name: 'essay-result',
        component: () => import('@/views/EssayResultPage.vue'),
        meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } },
      },
      {
        path: 'test',
        name: 'test',
        component: () => import('@/views/TestPage.vue'),
        meta: { requiresAuth: true, chrome: false, support: false, seo: { robots: 'noindex, nofollow' } },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfilePage.vue'),
        meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } },
      },
      {
        path: 'explanation',
        name: 'explanation',
        component: () => import('@/views/ExplanationPage.vue'),
        meta: { requiresAuth: true, chrome: false, support: false, seo: { robots: 'noindex, nofollow' } },
      },
    ],
  },

  // ── (auth) — the door in the wall ────────────────────────────────────────
  {
    path: '/',
    component: BareLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/Login.vue'),
        meta: { seo: { robots: 'noindex, nofollow' } },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/Register.vue'),
        meta: { seo: { robots: 'noindex, nofollow' } },
      },
      {
        // Forgot password + unconfirmed-phone verification (?reason=unverified),
        // both via the resend-otp → verify-otp drill.
        path: 'verify-phone',
        name: 'verify-phone',
        component: () => import('@/views/VerifyPhonePage.vue'),
        meta: { seo: { robots: 'noindex, nofollow' } },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Without this, SPA navigations inherit the previous page's scroll offset — e.g.
  // tapping "Hisobni to‘ldirish" while scrolled down a test page landed the pricing
  // page mid-list (on an expensive plan) instead of at the top (the cheapest plan).
  // Reset to the top on every fresh navigation, while still honouring back/forward
  // restoration and in-page #anchors, and leaving same-path query updates (e.g. the
  // test page syncing testId/attemptId into the URL) exactly where they are.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.meta?.requiresAuth) {
    return true
  }

  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    return true
  }

  return {
    name: 'register',
    query: { redirect: to.fullPath },
  }
})

// Keep the document <head> in sync with the active route (title, description,
// canonical, Open Graph / Twitter). See src/utils/seo.js.
router.afterEach((to) => {
  applySeo(to.meta?.seo, to)
})

export default router
