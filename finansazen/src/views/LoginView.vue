<template>
  <div  ref="wrapper" class="page-wrapper">
    <header>
      <h1>Finansazen</h1>
      <p>Accede a tu espacio financiero</p>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </header>

    <main class="container login-container">
      <div class="login-card">
        <h2>Iniciar sesión</h2>

        <form @submit.prevent="iniciarSesion">
          <div class="mb-3">
            <label for="email" class="form-label">Correo electrónico</label>
            <input type="email" id="email" v-model="email" class="form-control" required />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" id="password" v-model="password" class="form-control" required />
          </div>

          <button type="submit" class="btn-green" :disabled="cargando">
            {{ cargando ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <div class="text-links">
            <RouterLink to="/recuperar">¿Olvidaste tu contraseña?</RouterLink><br />
            <RouterLink to="/registro">¿No tienes cuenta? <strong>Regístrate</strong></RouterLink>
          </div>
        </form>
      </div>
    </main>

    <footer>
      © 2025 Finansazen. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const email = ref('')
const password = ref('')
const cargando = ref(false)

const wrapper = ref(null)
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

onMounted(() => {
  wrapper.value.classList.add('fade-in')
})

const iniciarSesion = async () => {
  if (!email.value || !password.value) {
    Swal.fire('Error', 'Por favor, completa todos los campos.', 'error')
    return
  }

  cargando.value = true

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await res.json()

    if (res.ok) {
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('userId', data.userID)

      wrapper.value.classList.remove('fade-in')
      wrapper.value.classList.add('fade-out')

      setTimeout(() => {
        router.push('/dashboard')
      }, 400)
    } else {
      Swal.fire('Credenciales incorrectas', data.message || '', 'error')
    }
  } catch (err) {
    console.error(err)
    Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error')
  } finally {
    cargando.value = false
  }
}
</script>
