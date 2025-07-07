import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: sessionStorage.getItem('token') || '',
        userId: sessionStorage.getItem('userId') || '',
    }),
    actions: {
        login(token, userId) {
            this.token = token
            this.userId = userId
            sessionStorage.setItem('token', token)
            sessionStorage.setItem('userId', userId)
        },
        logout() {
            this.token = ''
            this.userId = ''
            sessionStorage.clear()
        }
    }
})
