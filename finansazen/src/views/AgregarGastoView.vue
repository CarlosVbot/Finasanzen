<template>
  <div class="page-wrapper fade-in">
    <header class="dashboard-header">
      <h1>Editar Gasto</h1>
      <p>Modifica los detalles de tu gasto</p>
    </header>

    <main class="container d-flex justify-content-center align-items-center">
      <div class="gasto-form-card">
        <form @submit.prevent="editarGasto">
          <div class="form-group">
            <label for="descripcion" class="form-label">Descripción</label>
            <input type="text" v-model="descripcion" id="descripcion" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="monto" class="form-label">Monto</label>
            <input type="number" v-model.number="monto" id="monto" class="form-control" required />
          </div>

          <div class="form-group">
            <label for="categoria" class="form-label">Categoría</label>
            <select v-model.number="categoria" id="categoria" class="form-select" required>
              <option disabled value="">Selecciona una opción</option>
              <option :value="1">Gasto fijo</option>
              <option :value="2">Ocio</option>
              <option :value="3">Crédito</option>
            </select>
          </div>

          <div class="form-group">
            <label for="periodo" class="form-label">Periodo</label>
            <select v-model.number="periodo" id="periodo" class="form-select" required>
              <option :value="1">Diario</option>
              <option :value="2">Semanal</option>
              <option :value="3">Quincenal</option>
              <option :value="4">Mensual</option>
              <option :value="5">Anual</option>
            </select>
          </div>

          <div class="form-submit">
            <button type="submit" class="btn-submit">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </main>

    <footer class="dashboard-footer">
      © 2025 Finansazen. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const descripcion = ref('')
const monto = ref(0)
const categoria = ref('')
const periodo = ref('')
const router = useRouter()
const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL
const id = route.params.id

const obtenerGasto = async () => {
  const token = sessionStorage.getItem('token')
  const res = await fetch(`${API_URL}/api/gastos/consultone`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: Number(route.params.id) })
  })
  const respuesta = await res.json()

  if (respuesta.data) {
    descripcion.value =  respuesta.data.descripcion
    monto.value =  respuesta.data.monto
    categoria.value =  respuesta.data.categoria
    periodo.value =  respuesta.data.periodo
  } else {
    Swal.fire('Error', 'No se pudo cargar el gasto', 'error')
    router.push('/dashboard')
  }
}

const editarGasto = async () => {
  if(id) {
    const token = sessionStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/gastos/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: Number(route.params.id),
        descripcion: descripcion.value,
        monto: monto.value,
        categoria: categoria.value,
        periodo: periodo.value
      })
    })

    const data = await res.json()
    if (res.ok) {
      Swal.fire('Gasto actualizado', '', 'success')
      router.push('/dashboard')
    } else {
      Swal.fire('Error', data.message || 'No se pudo actualizar', 'error')
    }
  }else{
    const token = sessionStorage.getItem('token')
    const res = await fetch(`${API_URL}/api/gastos/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descripcion: descripcion.value,
        monto: monto.value,
        categoria: categoria.value,
        periodo: periodo.value
      })
    })

    const data = await res.json()
    if (res.ok) {
      Swal.fire('Gasto creado', '', 'success')
      router.push('/dashboard')
    } else {
      Swal.fire('Error', data.message || 'No se pudo crear', 'error')
    }
  }
}
if(id) {
  onMounted(obtenerGasto)
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

.gasto-form-card {
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

.form-control,
.form-select {
  border-radius: 0.5rem;
  border: 1px solid #ced4da;
  padding: 0.6rem 0.75rem;
  font-size: 1rem;
}

.form-submit {
  display: flex;
  justify-content: center;
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
</style>