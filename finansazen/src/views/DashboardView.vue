<template>
  <div ref="wrapper" class="dashboard-wrapper fade-in">
    <header class="dashboard-header">
      <img src="../assets/img/logo.png" alt="Finansazen Logo" class="logo">
      <p><b>Análisis financiero personal</b></p>
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
            <th>Frecuencia</th>
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
            <td>{{ mapaValores(item.periodo)  }}</td>
            <td>{{ mapaCategoria(item.tipo, item.categoria )  }}</td>
            <td>
              <button class="btn-icono editar" @click="editarRegistro(item)">✏️</button>
              <button class="btn-icono eliminar" @click="eliminarRegistro(item)">🗑️</button>
            </td>
          </tr>
          </tbody>
        </table>
      </section>

      <section class="graficas-section">
        <div class="graficas-container">
          <div class="grafica-item">
            <canvas id="horizontalBarChart"></canvas>
          </div>
          <div class="grafica-item">
            <canvas ref="graficaCanvas"></canvas>
          </div>
          <div class="grafica-item">
            <canvas id="lineChart"></canvas>
          </div>
        </div>
      </section>
      <section class="modelo-financiero">
        <h3>Evaluación del modelo 50/30/20</h3>
        <div class="intro-modelo mb-3">
          <p>
            El modelo <strong>50/30/20</strong> es una guía para distribuir tus ingresos:
            <strong>50%</strong> en necesidades y obligaciones (como renta y servicios),
            <strong>30%</strong> en ocio o estilo de vida (como entretenimiento),
            y <strong>20%</strong> en ahorro o inversión para el futuro.
          </p>
          <p>
            Seguir esta regla te ayuda a mejorar tu salud financiera, evitar deudas innecesarias
            y construir estabilidad a largo plazo.
          </p>
        </div>
        <div class="alert alert-success" v-if="!desbalance">
          {{ comentarioModelo }}
        </div>
        <div class="alert alert-danger" v-else>
          {{ comentarioModelo }}
        </div>
        <div class="barra-financiera mt-3">
          <div class="barra-porcentaje barra-roja" :style="{ width: porcentajeFijos + '%' }" title="Fijos">
            {{ porcentajeFijos.toFixed(0) }}%
          </div>
          <div class="barra-porcentaje barra-amarilla" :style="{ width: porcentajeOcio + '%' }" title="Ocio">
            {{ porcentajeOcio.toFixed(0) }}%
          </div>
          <div class="barra-porcentaje barra-verde" :style="{ width: porcentajeAhorro + '%' }" title="Ahorro">
            {{ porcentajeAhorro.toFixed(0) }}%
          </div>
        </div>
        <div class="resumen-distribucion">
          <p><strong>Fijos y créditos (50%):</strong> {{ porcentajeFijos.toFixed(2) }}%</p>
          <p><strong>Ocio (30%):</strong> {{ porcentajeOcio.toFixed(2) }}%</p>
          <p><strong>Ahorro/Inversión (20%):</strong> {{ porcentajeAhorro.toFixed(2)}}%</p>
        </div>
        <p class="comentario-modelo">{{ comentarioModelo }}</p>
      </section>
      <section class="resumen-diario card-financiera">
        <div class="header-seccion">
          <h3><i class="icono icono-grafico"></i> Análisis Diario</h3>
          <p class="subtitulo">Tu panorama financiero diario</p>
        </div>

        <div class="metricas-container">

          <div class="metrica-card ingreso">
            <div class="metrica-header">
              <i class="icono icono-ingreso"></i>
              <h4>Ingreso Diario</h4>
            </div>
            <p class="valor">${{ ingresoDiario.toFixed(2) }}</p>
            <p class="meta" v-if="ingresoDiario > 0">
        <span :class="{'text-success': porcentajeAhorro >= 20, 'text-warning': porcentajeAhorro < 20}">
          {{ porcentajeAhorro.toFixed(1) }}% destinado a ahorros
        </span>
            </p>
          </div>

          <div class="metrica-card gasto">
            <div class="metrica-header">
              <i class="icono icono-gasto"></i>
              <h4>Gasto Diario</h4>
            </div>
            <p class="valor">${{ gastoDiario.toFixed(2) }}</p>
            <div class="desglose">
              <span class="badge badge-fijo">Fijos: ${{ (gastoDiario * porcentajeFijos/100).toFixed(2) }}</span>
              <span class="badge badge-ocio">Ocio: ${{ (gastoDiario * porcentajeOcio/100).toFixed(2) }}</span>
            </div>
          </div>

          <div class="metrica-card balance" :class="{'positivo': (ingresoDiario - gastoDiario) >= 0, 'negativo': (ingresoDiario - gastoDiario) < 0}">
            <div class="metrica-header">
              <i class="icono" :class="{'icono-mas': (ingresoDiario - gastoDiario) >= 0, 'icono-menos': (ingresoDiario - gastoDiario) < 0}"></i>
              <h4>Balance Diario</h4>
            </div>
            <p class="valor">${{ Math.abs(ingresoDiario - gastoDiario).toFixed(2) }}</p>
            <p class="mensaje-balance">
        <span v-if="(ingresoDiario - gastoDiario) >= 0">
          ¡Buen trabajo! Estás dentro de tu presupuesto.
        </span>
              <span v-else>
          Alerta: Estás gastando ${{ (gastoDiario - ingresoDiario).toFixed(2) }} más de lo que ganas diariamente.
        </span>
            </p>
          </div>
        </div>

        <div class="recomendacion" :class="{'recomendacion-positiva': (ingresoDiario - gastoDiario) >= 0, 'recomendacion-alerta': (ingresoDiario - gastoDiario) < 0}">
          <h5><i class="icono icono-idea"></i> Recomendación</h5>
          <p v-if="(ingresoDiario - gastoDiario) >= 0">
            Puedes ahorrar ${{ ((ingresoDiario - gastoDiario) * 30).toFixed(2) }} este mes.
            Considera invertir el {{ ((ingresoDiario - gastoDiario)/ingresoDiario * 100).toFixed(1) }}% adicional.
          </p>
          <p v-else>
            Para equilibrar tus finanzas, reduce gastos en
            <span v-if="porcentajeOcio > 30">ocio (actual {{ porcentajeOcio.toFixed(1) }}%)</span>
            <span v-if="porcentajeOcio > 30 && porcentajeFijos > 50">y </span>
            <span v-if="porcentajeFijos > 50">necesidades fijas (actual {{ porcentajeFijos.toFixed(1) }}%)</span>.
          </p>
        </div>
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
let sugerencia = ref('')
const gastosUnicos = ref(0)
let desbalance = ref(false)
const grafica = ref(null)
let horizontalBarChart = null
let lineChart = null

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
const porcentajeUnicos = ref(0)
const ingresoDiario = ref(0)
const gastoDiario = ref(0)

const periodoBase = {
  1: 1,
  2: 7,
  3: 15,
  4: 30,
  5: 365,
  6: 1 //unico
}
const calcularModeloFinanciero = () => {
  desbalance.value = false;
  comentarioModelo.value = '';

  const totalIngresosDiarios = ingresos.value.reduce((acc, i) => acc + i.monto / periodoBase[i.periodo], 0);

  let fijos = 0, ocio = 0, unicos = 0;

  gastos.value.forEach(g => {
    const monto = g.monto / periodoBase[g.periodo];
    if (g.periodo === 6) {
      unicos += monto;
    } else {
      if (g.categoria === 1 || g.categoria === 3) fijos += monto;
      if (g.categoria === 2) ocio += monto;
    }
  });

  const totalGastos = fijos + ocio + unicos;
  const ahorroReal = totalIngresosDiarios - totalGastos;

  if (totalIngresosDiarios > 0) {
    porcentajeFijos.value = (fijos / totalIngresosDiarios) * 100;
    porcentajeOcio.value = (ocio / totalIngresosDiarios) * 100;
    porcentajeUnicos.value = (unicos / totalIngresosDiarios) * 100;

    porcentajeAhorro.value = (ahorroReal / totalIngresosDiarios) * 100;
  } else {
    porcentajeFijos.value = 0;
    porcentajeOcio.value = 0;
    porcentajeAhorro.value = 0;
    porcentajeUnicos.value = 0;
  }

  if(porcentajeFijos.value > 50) {
    desbalance.value = true;
    comentarioModelo.value += `Estás gastando ${porcentajeFijos.value.toFixed(2)}% en fijos (recomendado ≤50%). `;
  }

  if(porcentajeOcio.value > 30) {
    desbalance.value = true;
    comentarioModelo.value += `Estás gastando ${porcentajeOcio.value.toFixed(2)}% en ocio (recomendado ≤30%). `;
  }

  if(ahorroReal < 0) {
    desbalance.value = true;
    const deficit = Math.abs(ahorroReal);
    comentarioModelo.value += `Tienes un déficit diario de $${deficit.toFixed(2)} (gastas más de lo que ganas). `;
  } else if(porcentajeAhorro.value < 20) {
    desbalance.value = true;
    const faltante = (totalIngresosDiarios * 0.2) - ahorroReal;
    comentarioModelo.value += `Te faltan $${faltante.toFixed(2)} diarios para alcanzar el 20% de ahorro. `;
  }

  if(!desbalance.value) {
    comentarioModelo.value = '¡Excelente! Estás siguiendo el modelo 50/30/20 correctamente.';
  } else {
    comentarioModelo.value += 'Revisa tus gastos para mejorar tu salud financiera.';
  }

  ingresoDiario.value = totalIngresosDiarios;
  gastoDiario.value = totalGastos;
  gastosUnicos.value = unicos;

  sugerencia.value = `Para el modelo 50/30/20 ideal:
    - Máximo $${(totalIngresosDiarios * 0.5).toFixed(2)} diarios en fijos
    - Máximo $${(totalIngresosDiarios * 0.3).toFixed(2)} diarios en ocio
    - Mínimo $${(totalIngresosDiarios * 0.2).toFixed(2)} diarios en ahorro`;
}
const calcularTotales = () => {
  const factor = factores[vistaSeleccionada.value]
  let ingresosUnicos = ingresos.value.filter(i => i.periodo === 6)
  let ingresosFiltradosUnicos = ingresos.value.filter(i => i.periodo !== 6)
  totalIngresos.value = ingresosFiltradosUnicos.reduce((s, i) => s + parseFloat(i.monto) / periodoBase[i.periodo] * factor, 0).toFixed(2)
  if (ingresosUnicos.length > 0) {
    totalIngresos.value = (parseFloat(totalIngresos.value) + ingresosUnicos.reduce((s, i) => s + parseFloat(i.monto), 0)).toFixed(2)
  }
  let gastosFiltradosUnicos = gastos.value.filter(g => g.periodo !== 6)
  let gastosUnicos = gastos.value.filter(g => g.periodo === 6)
  totalGastos.value = gastosFiltradosUnicos.reduce((s, g) => s + parseFloat(g.monto) / periodoBase[g.periodo] * factor, 0).toFixed(2)
  if (gastosUnicos.length > 0) {
    totalGastos.value = (parseFloat(totalGastos.value) + gastosUnicos.reduce((s, g) => s + parseFloat(g.monto), 0)).toFixed(2)
  }
  balance.value = (totalIngresos.value - totalGastos.value).toFixed(2)
  calcularModeloFinanciero()
  renderGrafica()
}

const renderGrafica = async () => {
  await nextTick()

  if (grafica.value) grafica.value.destroy()
  if (horizontalBarChart) horizontalBarChart.destroy()
  if (lineChart) lineChart.destroy()
  const chartData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{
      label: 'Distribución',
      data: [totalIngresos.value, totalGastos.value],
      backgroundColor: ['#00a86b', '#e74c3c'],
      borderColor: ['#fff', '#fff'],
      borderWidth: 1
    }]
  }

  grafica.value = new Chart(graficaCanvas.value, {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
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

  horizontalBarChart = new Chart(
      document.getElementById('horizontalBarChart').getContext('2d'),
      {
        type: 'bar',
        data: chartData,
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.label}: $${ctx.parsed.toFixed(2)}`
              }
            },
            legend: { display: false }
          }
        }
      }
  )

  lineChart = new Chart(
      document.getElementById('lineChart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            ...chartData.datasets[0],
            fill: true,
            tension: 0.4
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
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      }
  )
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

const mapaValores = (valor) => {
  const mapa = {
    1: 'Diario',
    2: 'Semanal',
    3: 'Quincenal',
    4: 'Mensual',
    5: 'Anual',
    6: 'Único'
  };
  return mapa[valor] || 'Desconocido';
}

const mapaCategoria = (tipo,valor) => {
  if( tipo === 'ingreso') {
    const mapa = {
      1: 'Ingreso',
      2: 'Ahorro',
      3: 'Inversiones',
      4: 'Otros'
    };
    return mapa[valor] || 'Desconocido';
  }else{
    const mapa = {
      1: 'Gasto fijo',
      2: 'Gastos de ocio'
    };
    return mapa[valor] || 'Desconocido';
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

.barra-roja { background-color: #dc2540; }
.barra-amarilla { background-color: #ffc107; }
.barra-verde { background-color: #28a745; }

.barra-financiera {
  display: flex;
  height: 30px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #676262;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-md-4 {
  flex: 0 0 33.333%;
  max-width: 33.333%;
  padding: 0 15px;
  box-sizing: border-box;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 127, 95, 0.1);
  padding: 15px;
}
.card-financiera {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 127, 95, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.header-seccion {
  margin-bottom: 1.5rem;
  text-align: center;
}

.header-seccion h3 {
  color: #1b4332;
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}

.subtitulo {
  color: #6c757d;
  font-size: 0.9rem;
}

.metricas-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.metrica-card {
  padding: 1.25rem;
  border-radius: 10px;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.metrica-card:hover {
  transform: translateY(-5px);
}

.metrica-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.metrica-header h4 {
  margin-left: 10px;
  font-size: 1.1rem;
  color: #495057;
}

.metrica-card .valor {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.ingreso .valor { color: #00a86b; }
.gasto .valor { color: #e74c3c; }
.balance.positivo .valor { color: #28a745; }
.balance.negativo .valor { color: #dc3545; }

.desglose {
  margin-top: 0.75rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.badge-fijo {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.badge-ocio {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.mensaje-balance {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.recomendacion {
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.recomendacion-positiva {
  background: rgba(40, 167, 69, 0.1);
  border-left-color: #28a745;
}

.recomendacion-alerta {
  background: rgba(220, 53, 69, 0.1);
  border-left-color: #dc3545;
}

.recomendacion h5 {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.recomendacion h5 i {
  margin-right: 8px;
}

.icono {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-size: contain;
}

.icono-grafico { background-image: url('data:image/svg+xml;utf8,<svg ...></svg>'); }
.icono-ingreso { background-image: url('data:image/svg+xml;utf8,<svg ...></svg>'); }
.logo {
  width: auto;
  height: 60px;
  max-width: 100%;
}

.graficas-section {
  margin: 2rem 0;
}

.graficas-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.grafica-item {
  position: relative;
  min-height: 300px;
  width: 100%;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 768px) {
  .graficas-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .grafica-item {
    min-height: 250px;
  }
}

</style>
