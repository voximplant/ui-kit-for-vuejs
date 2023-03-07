import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import WebPhoneShell from '@/views/WebPhoneShell.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'WebPhoneShell',
    component: WebPhoneShell,
  },
];

const router = createRouter({
  history: createWebHistory(window.location.pathname),
  routes,
});

export default router;
