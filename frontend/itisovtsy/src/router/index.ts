import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/library', name: 'library', component: () => import('../components/LibraryPage.vue') },
    { path: '/questions', name: 'questions', component: () => import('../components/QuestionsPage.vue') },
    { path: '/profile', name: 'profile', component: () => import('../components/StudentProfile.vue'), meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
  ],
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
})

const { account, restoreSession } = useAuth()
router.beforeEach(async to => {
  if (to.meta.requiresAuth) {
    await restoreSession()
    if (!account.value) return { name: 'home' }
  }
})

export default router
