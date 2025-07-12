<template>
  <div  ref="wrapper" class="page-wrapper">
    <header>
      <img src="../assets/img/logo.png" alt="Finansazen Logo" class="logo"  height="15%" width="15%" />
      <p><b>Accede a tu espacio financiero</b></p>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </header>

    <main class="container login-container">
      <div class="login-card">
        <h2>Registro</h2>

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
      body: JSON.stringify({username: nombre.value, email: email.value, password: password.value})
    })

    const data = await res
    console.log(res)
    if (res.ok) {
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('userId', data.userID)
      router.push('/login')
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
