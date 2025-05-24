// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
// import CartPage from '../pages/CartPage.vue' // Removed
import CheckoutPage from '../pages/CheckoutPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  // { // Removed CartPage route
  //   path: '/cart',
  //   name: 'Cart',
  //   component: CartPage,
  // },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
