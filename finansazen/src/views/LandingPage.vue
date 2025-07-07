<template>
  <div :class="{ 'fade-out': isFading }">
    <header>
      <h1>Finansazen</h1>
      <p>La tranquilidad financiera comienza con claridad</p>
    </header>

    <main class="container hero">
      <div class="text-center text-lg-start mb-4 mb-lg-0">
        <h2>Toma mejores decisiones analizando tus finanzas</h2>
        <p class="lead mt-3">
          Con Finansazen podrás registrar y visualizar tus ingresos y gastos fácilmente, dándote el poder de decidir con base en datos reales.
        </p>
        <button @click="navigateToLogin" class="btn-green mt-3 d-inline-block">Comenzar</button>
      </div>
      <div class="illustration ms-lg-5 text-center">
        <img src="../assets/img/undraw_data-analysis_b7cp.png" alt="Análisis financiero ilustración" />
      </div>
    </main>

    <footer>
      © 2025 Finansazen. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isFading: false
    };
  },
  methods: {
    navigateToLogin() {
      this.isFading = true;
      setTimeout(() => {
        this.$router.push('/login');
      }, 500);
    }
  }
};
</script>