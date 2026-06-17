import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
    component: () => import('@/views/PricingPage.vue') // Lazy load the pricing page
  },
  {
    path: '/math',
    name: 'math',
    component: () => import('@/views/SubjectPage.vue'),
    meta: { subjectKey: 'math' }
  },
  {
    path: '/mashq',
    name: 'mashq',
    component: () => import('@/views/MashqPage.vue')
  },
  {
    path: '/tarix',
    name: 'tarix',
    component: () => import('@/views/SubjectPage.vue'),
    meta: { subjectKey: 'history' }
  },
  {
    path: '/ona-tili',
    name: 'ona-tili',
    component: () => import('@/views/SubjectPage.vue'),
    meta: { subjectKey: 'nativeLanguage' }
  },
  {
    path: '/result-exam',
    name: 'result-exam',
    component: () => import('@/views/ResultExamPage.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test-junior',
    name: 'test-junior',
    component: () => import('@/views/TestJuniorLevelPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mashq-junior',
    name: 'mashq-junior',
    component: () => import('@/views/MashqJuniorLevelPage.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/explanation',
    name: 'explanation',
    component: () => import('@/views/ExplanationPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
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

export default router
