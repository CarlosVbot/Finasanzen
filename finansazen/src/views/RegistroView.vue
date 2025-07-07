<template>
  <div>
    <header class="bg-white border-bottom py-4 mb-4">
      <div class="container text-center">
        <h1 class="fw-bold text-success mb-2" style="font-size: 2.5rem;">Finansazen</h1>
        <p class="text-muted fs-5 mb-0">Crea tu cuenta gratuita</p>
      </div>
    </header>

    <main class="container d-flex justify-content-center align-items-center" style="min-height: 70vh;">
      <div class="card shadow-sm p-4" style="max-width: 500px; width: 100%;">
        <h2 class="mb-4 text-center fw-semibold">Registro</h2>
        <form @submit.prevent="registrarse">
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre completo</label>
            <input type="text" id="nombre" v-model="nombre" class="form-control" required />
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">Correo electrónico</label>
            <input type="email" id="email" v-model="email" class="form-control" required />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" id="password" v-model="password" class="form-control" required />
          </div>

          <div class="mb-3">
            <label for="confirmacion" class="form-label">Confirmar contraseña</label>
            <input type="password" id="confirmacion" v-model="confirmacion" class="form-control" required />
          </div>

          <div class="d-grid mb-3">
            <button type="submit" class="btn btn-primary" :disabled="cargando">
              {{ cargando ? 'Registrando...' : 'Registrarse' }}
            </button>
          </div>

          <div class="text-center">
            <RouterLink to="/login" class="text-decoration-none">¿Ya tienes cuenta? <strong>Inicia sesión</strong></RouterLink>
          </div>
        </form>
      </div>
    </main>

    <footer class="bg-white mt-auto py-3 text-center text-muted">
      © 2025 Finansazen. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmacion = ref('')
const cargando = ref(false)

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const registrarse = async () => {
  if (password.value !== confirmacion.value) {
    alert('Las contraseñas no coinciden.')
    return
  }

  cargando.value = true

  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nombre: nombre.value, email: email.value, password: password.value})
    })

    const data = await res.json()

    if (res.ok) {
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('userId', data.userID)
      router.push('/dashboard')
    } else {
      alert(data.message || 'No se pudo registrar')
    }
  } catch (err) {
    console.error(err)
    alert('Error de conexión')
  } finally {
    cargando.value = false
  }
}
</script>
