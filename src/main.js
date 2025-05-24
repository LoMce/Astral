// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import Pinia

import App from './App.vue'
import router from './router' // Import router
import './assets/main.css'

const app = createApp(App)

app.use(createPinia()) // Use Pinia
app.use(router) // Use router

app.mount('#app')
