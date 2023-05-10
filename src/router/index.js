import { createRouter, createWebHistory } from 'vue-router'
import FaucetView from '../views/FaucetView.vue'
import ManageView from '../views/ManageView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: FaucetView
    }
  ]
})

export default router
