import { createRouter, createWebHistory } from 'vue-router'
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
    component: () => import('@/views/MathPage.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardPage.vue')
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

export default router
