<template>
  <div>
    <!-- Header -->
    <header class="bg-white border-bottom py-4 mb-4">
      <div class="container text-center">
        <h1 class="fw-bold text-success mb-2" style="font-size: 2.5rem;">Finansazen</h1>
        <p class="text-muted fs-5 mb-0">Recupera el acceso a tu cuenta</p>
      </div>
    </header>

    <!-- Formulario -->
    <main class="container d-flex justify-content-center align-items-center" style="min-height: 70vh;">
      <div class="card shadow-sm p-4" style="max-width: 400px; width: 100%;">
        <h2 class="mb-4 text-center fw-semibold">Recuperar contraseña</h2>
        <form @submit.prevent="recuperar">
          <div class="mb-3">
            <label for="email" class="form-label">Correo electrónico</label>
            <input type="email" id="email" v-model="email" class="form-control" required placeholder="tucorreo@ejemplo.com" />
          </div>

          <div class="d-grid mb-3">
            <button type="submit" class="btn btn-primary" :disabled="cargando">
              {{ cargando ? 'Enviando...' : 'Enviar instrucciones' }}
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const cargando = ref(false)
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const recuperar = async () => {
  cargando.value = true
  try {
    const res = await fetch(`${API_URL}/api/auth/recuperar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    const data = await res.json()

    if (res.ok) {
      alert(data.message || 'Instrucciones enviadas al correo')
      router.push('/login')
    } else {
      alert(data.message || 'No se pudo enviar el correo')
    }
  } catch (error) {
    alert('Error al conectar con el servidor')
    console.error(error)
  } finally {
    cargando.value = false
  }
}
</script>
