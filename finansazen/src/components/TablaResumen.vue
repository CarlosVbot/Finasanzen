<template>
  <div class="row mb-5">
    <!-- Ingresos -->
    <div class="col-md-6">
      <h5 class="fw-semibold mb-2">Ingresos recientes</h5>
      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead class="table-light">
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Periodo</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in ingresos.slice(0, 10)" :key="item.id">
            <td>{{ item.descripcion }}</td>
            <td class="text-success">+ ${{ parseFloat(item.monto).toFixed(2) }}</td>
            <td>{{ mostrarPeriodo(item.periodo) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-1" @click="$emit('editar', item, 'ingreso')">✏️</button>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('eliminar', item.id, 'ingreso')">🗑</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Gastos -->
    <div class="col-md-6">
      <h5 class="fw-semibold mb-2">Gastos recientes</h5>
      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead class="table-light">
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Periodo</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in gastos.slice(0, 10)" :key="item.id">
            <td>{{ item.descripcion }}</td>
            <td class="text-danger">- ${{ parseFloat(item.monto).toFixed(2) }}</td>
            <td>{{ mostrarPeriodo(item.periodo) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-1" @click="$emit('editar', item, 'gasto')">✏️</button>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('eliminar', item.id, 'gasto')">🗑</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ingresos: Array,
  gastos: Array
})

const mostrarPeriodo = (periodo) => {
  const map = {
    1: 'Único',
    2: 'Diario',
    3: 'Quincenal',
    4: 'Mensual',
    5: 'Anual'
  }
  return map[periodo] || 'N/D'
}
</script>

