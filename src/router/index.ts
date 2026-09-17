import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecordView from '../views/RecordView.vue'
import StatsView from '../views/StatsView.vue'
import ProfileView from '../views/ProfileView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/records', name: 'records', component: RecordView },
    { path: '/stats', name: 'stats', component: StatsView },
    { path: '/profile', name: 'profile', component: ProfileView },
  ],
})
