import { createRouter, createWebHistory } from 'vue-router'

import LandingPage from '../views/LandingPage.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AgregarIngresoView from '../views/AgregarIngresoView.vue'
import AgregarGastoView from '../views/AgregarGastoView.vue'
import RegistroView from '../views/RegistroView.vue'
import RecuperarView from '../views/RecuperarView.vue'

const routes = [
    { path: '/', name: 'Landing', component: LandingPage },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
    {
        path: '/ingreso',
        name: 'AgregarIngreso',
        component: () => import('@/views/AgregarIngresoView.vue')
    },
    {
        path: '/ingreso/:id',
        name: 'EditarIngreso',
        component: () => import('@/views/AgregarIngresoView.vue')
    },
    {
        path: '/gasto',
        name: 'AgregarGasto',
        component: () => import('@/views/AgregarGastoView.vue')
    },
    {
        path: '/gasto/:id',
        name: 'EditarGasto',
        component: () => import('@/views/AgregarGastoView.vue')
    },
    { path: '/registro', name: 'Registro', component: RegistroView },
    { path: '/recuperar', name: 'Recuperar', component: RecuperarView }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
