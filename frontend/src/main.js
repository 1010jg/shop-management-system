import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// โหลด Tailwind CSS และ Custom Styles
import './assets/main.css'

const app = createApp(App)

// ติดตั้ง Pinia สำหรับ State Management (Auth, User Data)
app.use(createPinia())

// ติดตั้ง Vue Router สำหรับ Navigation และ Route Guards
app.use(router)

app.mount('#app')