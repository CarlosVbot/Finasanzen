<template>
  <div class="page-wrapper fade-in">
    <header class="dashboard-header">
      <h1>Finansazen</h1>
      <p>Crea tu cuenta gratuita</p>
    </header>

    <main class="container d-flex justify-content-center align-items-center">
      <div class="registro-form-card">
        <h2 class="text-center mb-4">Registro</h2>
        <form @submit.prevent="registrarse">
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre completo</label>
            <input type="text" id="nombre" v-model="nombre" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Correo electrónico</label>
            <input type="email" id="email" v-model="email" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" id="password" v-model="password" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="confirmacion" class="form-label">Confirmar contraseña</label>
            <input type="password" id="confirmacion" v-model="confirmacion" class="form-control" required />
          </div>

          <div class="form-submit">
            <button type="submit" class="btn-submit" :disabled="cargando">
              {{ cargando ? 'Registrando...' : 'Registrarse' }}
            </button>
          </div>

          <p class="text-center mt-3">
            <RouterLink to="/login" class="text-link">
              ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
            </RouterLink>
          </p>
        </form>
      </div>
    </main>

    <footer class="dashboard-footer">
      © 2025 Finansazen. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmacion = ref('')
const cargando = ref(false)
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const registrarse = async () => {
  if (password.value !== confirmacion.value) {
    Swal.fire('Error', 'Las contraseñas no coinciden', 'error')
    return
  }

  cargando.value = true
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: nombre.value,
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (res.ok) {
      Swal.fire('Registro exitoso', 'Ahora puedes iniciar sesión', 'success')
      router.push('/login')
    } else {
      Swal.fire('Error', data.message || 'No se pudo registrar', 'error')
    }
  } catch (error) {
    Swal.fire('Error', 'Hubo un problema de conexión', 'error')
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 70vh;
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registro-form-card {
  max-width: 480px;
  width: 100%;
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 20px rgba(0, 127, 95, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1b4332;
}

.form-control {
  border-radius: 0.5rem;
  border: 1px solid #ced4da;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
}

.form-submit {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-submit {
  background: linear-gradient(to right, #00b37a, #007f5f);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 179, 122, 0.2);
  transition: all 0.3s ease;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 179, 122, 0.3);
}

.text-link {
  color: #007f5f;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}
</style>
