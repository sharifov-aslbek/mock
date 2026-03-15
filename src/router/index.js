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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router