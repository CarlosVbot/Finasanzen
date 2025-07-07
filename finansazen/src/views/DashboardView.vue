<template>
  <div ref="wrapper" class="dashboard-wrapper fade-in">
    <header class="dashboard-header">
      <h1>Finansazen</h1>
      <p>Análisis financiero personal</p>
    </header>

    <main class="dashboard-main container">
      <section class="dashboard-summary">
        <div class="summary-card ingresos">
          <p class="label">Ingresos</p>
          <p class="valor">+${{ totalIngresos }}</p>
        </div>
        <div class="summary-card gastos">
          <p class="label">Gastos</p>
          <p class="valor">-${{ totalGastos }}</p>
        </div>
        <div class="summary-card balance">
          <p class="label">Balance neto</p>
          <p class="valor">${{ balance }}</p>
        </div>
      </section>

      <section class="dashboard-toolbar">
        <select class="select-personalizado" v-model="vistaSeleccionada" @change="calcularTotales">
          <option value="diario">Vista diaria</option>
          <option value="semanal">Vista semanal</option>
          <option value="quincenal">Vista quincenal</option>
          <option value="mensual">Vista mensual</option>
          <option value="anual">Vista anual</option>
        </select>
        <div class="botones-toolbar">
          <RouterLink to="/ingreso" class="btn-green">+ Ingreso</RouterLink>
          <RouterLink to="/gasto" class="btn-green">+ Gasto</RouterLink>
          <button class="btn-grey" @click="cerrarSesion">Cerrar sesión</button>
        </div>
      </section>

      <section class="dashboard-tabla">
        <table class="tabla-dashboard">
          <thead>
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in ingresos.concat(gastos)" :key="item.id">
            <td>{{ item.descripcion }}</td>
            <td :class="item.tipo === 'ingreso' ? 'text-success' : 'text-danger'">
              {{ item.tipo === 'ingreso' ? '+' : '-' }}${{ item.monto }}
            </td>
            <td>{{ item.categoria }}</td>
            <td>
              <button class="btn-icono editar" @click="editarRegistro(item)">✏️</button>
              <button class="btn-icono eliminar" @click="eliminarRegistro(item)">🗑️</button>
            </td>
          </tr>
          </tbody>
        </table>
      </section>

      <section class="dashboard-grafico">
        <canvas   ref="graficaCanvas"></canvas>
      </section>
      <section class="modelo-financiero">
        <h3>Evaluación del modelo 50/30/20</h3>
        <div class="resumen-distribucion">
          <p><strong>Fijos y créditos (50%):</strong> {{ porcentajeFijos.toFixed(2) }}%</p>
          <p><strong>Ocio (30%):</strong> {{ porcentajeOcio.toFixed(2) }}%</p>
          <p><strong>Ahorro/Inversión (20%):</strong> {{ porcentajeAhorro.toFixed(2)}}%</p>
        </div>
        <p class="comentario-modelo">{{ comentarioModelo }}</p>
      </section>
      <section class="resumen-diario">
        <h3>Ingreso Diario vs Gasto Diario</h3>
        <p><strong>Ingreso diario:</strong> ${{ ingresoDiario.toFixed(2) }}</p>
        <p><strong>Gasto diario (fijo + ocio):</strong> ${{ gastoDiario.toFixed(2) }}</p>
        <p><strong>Diferencia disponible:</strong> ${{ (ingresoDiario - gastoDiario).toFixed(2) }}</p>
      </section>
    </main>

    <footer class="dashboard-footer">
      © 2025 Finansazen. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import Chart from 'chart.js/auto'


const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL
const wrapper = ref(null)
const ingresos = ref([])
const gastos = ref([])
const vistaSeleccionada = ref('mensual')
const totalIngresos = ref(0)
const totalGastos = ref(0)
const balance = ref(0)
const graficaCanvas = ref(null)
const grafica = ref(null)

const factores = { diario: 1, quincenal: 15, mensual: 30, anual: 365, semanal: 7 }

onMounted(() => {
  wrapper.value?.classList.add('fade-in')
  obtenerDatos()
})

const obtenerDatos = async () => {
  const token = sessionStorage.getItem('token')
  const userId = sessionStorage.getItem('userId')
  if (!token || !userId) return router.push('/login')

  try {
    const [resIn, resG] = await Promise.all([
      fetch(`${API_URL}/api/ingresos/consult`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { id: Number(userId) } })
      }),
      fetch(`${API_URL}/api/gastos/consult`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { id: Number(userId) } })
      })
    ])

    ingresos.value = (await resIn.json()).data?.map(i => ({ ...i, tipo: 'ingreso' })) || []
    gastos.value = (await resG.json()).data?.map(g => ({ ...g, tipo: 'gasto' })) || []

    calcularTotales()
  } catch (err) {
    Swal.fire('Error', 'No se pudo cargar la información.', 'error')
    console.error(err)
  }
}

const porcentajeFijos = ref(0)
const porcentajeOcio = ref(0)
const porcentajeAhorro = ref(0)
const comentarioModelo = ref('')
const ingresoDiario = ref(0)
const gastoDiario = ref(0)
const periodoBase = {
  1: 1,
  2: 7,
  3: 15,
  4: 30,
  5: 365
}
const calcularModeloFinanciero = () => {
  const totalIngresosDiarios = ingresos.value.reduce((acc, i) => acc + i.monto / periodoBase[i.periodo], 0)
  let fijos = 0, ocio = 0, ahorro = 0

  gastos.value.forEach(g => {
    const monto = g.monto / periodoBase[g.periodo]
    if (g.categoria === 1 || g.categoria === 3) fijos += monto
    if (g.categoria === 2) ocio += monto
  })

  ingresos.value.forEach(i => {
    const monto = i.monto / periodoBase[i.periodo]
    ahorro += monto
  })

  const total = fijos + ocio + ahorro || 1
  porcentajeFijos.value = (fijos / totalIngresosDiarios) * 100
  porcentajeOcio.value = (ocio / totalIngresosDiarios) * 100
  porcentajeAhorro.value = (ahorro / totalIngresosDiarios) * 100 - (porcentajeFijos.value + porcentajeOcio.value)

  const desbalance = porcentajeFijos.value + porcentajeOcio.value > 100
  comentarioModelo.value = desbalance
      ? 'Estás gastando más de lo que ingresas. Ajusta tus gastos fijos y de ocio.'
      : `Distribución actual: ${porcentajeFijos.value.toFixed(1)}% fijos, ${porcentajeOcio.value.toFixed(1)}% ocio, ${porcentajeAhorro.value.toFixed(1)}% ahorro.`

  ingresoDiario.value = totalIngresosDiarios
  gastoDiario.value = fijos + ocio
}
const calcularTotales = () => {
  const factor = factores[vistaSeleccionada.value]
  totalIngresos.value = ingresos.value.reduce((s, i) => s + parseFloat(i.monto) / periodoBase[i.periodo] * factor, 0).toFixed(2)
  totalGastos.value = gastos.value.reduce((s, g) => s + parseFloat(g.monto) / periodoBase[g.periodo] * factor, 0).toFixed(2)
  balance.value = (totalIngresos.value - totalGastos.value).toFixed(2)
  calcularModeloFinanciero()
  renderGrafica()
}

const renderGrafica = async () => {
  await nextTick()
  if (grafica.value) grafica.value.destroy()
  grafica.value = new Chart(graficaCanvas.value, {
    type: 'pie',
    data: {
      labels: ['Ingresos', 'Gastos'],
      datasets: [{
        label: 'Distribución',
        data: [totalIngresos.value, totalGastos.value],
        backgroundColor: ['#00a86b', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: $${ctx.parsed.toFixed(2)}`
          }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const editarRegistro = (item) => {
  router.push(`/${item.tipo}/${item.id}`)
}

const eliminarRegistro = async (item) => {
  const confirmar = await Swal.fire({
    title: '¿Eliminar?',
    text: `¿Deseas eliminar este ${item.tipo}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (confirmar.isConfirmed) {
    const token = sessionStorage.getItem('token')
    await fetch(`${API_URL}/api/${item.tipo === 'ingreso' ? 'ingresos' : 'gastos'}/delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id })
    })
    obtenerDatos()
    Swal.fire('Eliminado', 'El registro fue eliminado.', 'success')
  }
}

const cerrarSesion = () => {
  Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#007f5f',
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
  }).then(result => {
    if (result.isConfirmed) {
      sessionStorage.clear()
      wrapper.value?.classList.remove('fade-in')
      wrapper.value?.classList.add('fade-out')
      setTimeout(() => router.push('/login'), 400)
    }
  })
}
</script>
<style scoped>
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-header {
  background-color: #ffffff;
  border-bottom: 1px solid #d3f9d8;
  text-align: center;
  padding: 2rem 0;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #007f5f;
}

.dashboard-header p {
  font-size: 1rem;
  color: #6c757d;
}

.dashboard-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: space-between;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: 180px;
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 179, 122, 0.15);
  text-align: center;
}

.summary-card .label {
  font-size: 0.9rem;
  color: #6c757d;
}

.summary-card .valor {
  font-size: 1.5rem;
  font-weight: 700;
}

.ingresos .valor {
  color: #00a86b;
}
.gastos .valor {
  color: #e74c3c;
}
.balance .valor {
  color: #1b4332;
}

.dashboard-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.botones-toolbar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.select-personalizado {
  border-radius: 0.6rem;
  padding: 0.6rem 1rem;
  border: 1px solid #ced4da;
  background-color: #ffffff;
  font-size: 1rem;
  color: #1b4332;
  box-shadow: 0 2px 6px rgba(0, 127, 95, 0.06);
}

.btn-green,
.btn-grey {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.btn-green {
  background: linear-gradient(to right, #00b37a, #007f5f);
  color: #fff;
}

.btn-grey {
  background-color: #e0e0e0;
  color: #333;
}

.dashboard-tabla {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.tabla-dashboard {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 127, 95, 0.1);
}

.tabla-dashboard th,
.tabla-dashboard td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eef1f2;
}

.tabla-dashboard th {
  background-color: #e6f4ee;
  color: #007f5f;
  font-weight: 600;
}

.btn-icono {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-icono.editar {
  color: #007f5f;
}

.btn-icono.eliminar {
  color: #e74c3c;
}

.dashboard-grafico {
  background: #ffffff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 127, 95, 0.08);
  text-align: center;
  font-style: italic;
  color: #6c757d;
  max-width: 400px;
  margin: 0 auto;
}

.dashboard-footer {
  background-color: #ffffff;
  color: #6c757d;
  text-align: center;
  padding: 1rem 0;
  font-size: 0.9rem;
  margin-top: auto;
}.modelo-financiero {
   background: #fff;
   padding: 2rem;
   border-radius: 0.75rem;
   box-shadow: 0 4px 12px rgba(0, 127, 95, 0.1);
   margin: 2rem 0;
 }

.modelo-financiero h3 {
  color: #1b4332;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.resumen-distribucion p {
  margin: 0.25rem 0;
  font-size: 1rem;
  color: #333;
}

.comentario-modelo {
  margin-top: 1rem;
  font-weight: 600;
  color: #007f5f;
  text-align: center;
}.modelo-financiero,
 .resumen-diario {
   background: #fff;
   padding: 2rem;
   border-radius: 0.75rem;
   box-shadow: 0 4px 12px rgba(0, 127, 95, 0.1);
   margin: 2rem 0;
 }

.modelo-financiero h3,
.resumen-diario h3 {
  color: #1b4332;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.resumen-distribucion p,
.resumen-diario p {
  margin: 0.25rem 0;
  font-size: 1rem;
  color: #333;
}

.comentario-modelo {
  margin-top: 1rem;
  font-weight: 600;
  color: #007f5f;
  text-align: center;
}
</style>
