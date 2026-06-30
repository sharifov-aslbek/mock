import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { applySeo } from '@/utils/seo'
// Import your page components
import HomaPage from '@/views/HomaPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomaPage
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: () => import('@/views/PricingPage.vue'), // Lazy load the pricing page
    meta: {
      seo: {
        title: 'Narxlar',
        description:
          'MilliyMock tariflari va narxlari. O‘zingizga mos rejani tanlang va milliy sertifikat testlariga tayyorgarlikni boshlang.',
      },
    }
  },
  {
    path: '/math',
    name: 'math',
    component: () => import('@/views/SubjectPage.vue'),
    meta: {
      subjectKey: 'math',
      seo: {
        title: 'Matematika testlari',
        description:
          'Matematikadan milliy sertifikat testlarini real test formatida ishlang. O‘zingizga mos testni tanlang va darhol boshlang.',
      },
    }
  },
  {
    path: '/mashq',
    // Mashq page concealed until finished — redirect home. Restore the two lines below when complete.
    redirect: '/'
    // name: 'mashq',
    // component: () => import('@/views/MashqPage.vue')
  },
  {
    path: '/tarix',
    name: 'tarix',
    component: () => import('@/views/SubjectPage.vue'),
    meta: {
      subjectKey: 'history',
      seo: {
        title: 'Tarix testlari',
        description:
          'O‘zbekiston va jahon tarixi bo‘yicha milliy sertifikat testlarini ishlang va bilimingizni sinab ko‘ring.',
      },
    }
  },
  {
    path: '/fizika',
    name: 'fizika',
    component: () => import('@/views/SubjectPage.vue'),
    meta: {
      subjectKey: 'physics',
      seo: {
        title: 'Fizika testlari',
        description:
          'Fizikadan milliy sertifikat testlarini real test formatida ishlang. O‘zingizga mos testni tanlang va darhol boshlang.',
      },
    }
  },
  {
    path: '/result-exam',
    name: 'result-exam',
    component: () => import('@/views/ResultExamPage.vue'),
    meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } }
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestPage.vue'),
    meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } }
  },
  {
    path: '/mashq-junior',
    // Mashq (junior) page concealed until finished — redirect home. Restore the two lines below when complete.
    redirect: '/'
    // name: 'mashq-junior',
    // component: () => import('@/views/MashqJuniorLevelPage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } }
  },
  {
    path: '/explanation',
    name: 'explanation',
    component: () => import('@/views/ExplanationPage.vue'),
    meta: { requiresAuth: true, seo: { robots: 'noindex, nofollow' } }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { seo: { robots: 'noindex, nofollow' } }
  }
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
    name: 'login',
    query: { redirect: to.fullPath },
  }
})

// Keep the document <head> in sync with the active route (title, description,
// canonical, Open Graph / Twitter). See src/utils/seo.js.
router.afterEach((to) => {
  applySeo(to.meta?.seo, to)
})

export default router
