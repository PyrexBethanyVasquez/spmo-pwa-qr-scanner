import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/HelloWorld.vue'
import Scanner from '../components/Scanner.vue'
import { supabase } from '../clients/supabase.js'

const routes = [
  { path: '/', component: Login },
  { path: '/scanner', component: Scanner, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const response = await supabase.auth.getSession()
      const session = response?.data?.session || null
      if (!session) {
        return next('/') // redirect to login if not authenticated
      }
    } catch (err) {
      console.error('Failed to check session:', err)
      return next('/')
    }
  }
  next()
})

export default router
