document.addEventListener("DOMContentLoaded", () => {
    console.log("init:");
    const vistaSelect = document.getElementById("vistaSelect");
    const totalIngresos = document.getElementById("totalIngresos");
    const totalGastos = document.getElementById("totalGastos");
    const balance = document.getElementById("balance");
    const ctx = document.getElementById("graficaComparativa").getContext("2d");
    const ingresoDiarioEl = document.getElementById("ingresoDiario");
    const gastoDiarioEl = document.getElementById("gastoDiario");
    const disponibleDiarioEl = document.getElementById("disponibleDiario");
    const modeloGastosFijos = document.getElementById("modeloGastosFijos");
    const modeloOcio = document.getElementById("modeloOcio");
    const modeloAhorro = document.getElementById("modeloAhorro");
    const estadoModelo = document.getElementById("estadoModelo");
    const cerrarSesionBtn = document.getElementById("cerrarSesion");

    const token = sessionStorage.getItem('token');
    if(!token) {
        window.location.href = "login.html";
        return;
    }
    const userId = sessionStorage.getItem('userId');

    const factores = {
        diario: 1,
        quincenal: 15,
        mensual: 30,
        anual: 365,
    };

    const periodoBase = {
        1: 1,
        2: 1,
        3: 15,
        4: 30,
        5: 365,
    };

    let ingresos = [];
    let gastos = [];
    let grafica;

    async function obtenerDatos() {
        try {
            console.log("Token:", token);
            const [resIngresos, resGastos] = await Promise.all([
                fetch('https://sdr-cone-v1.onrender.com/api/ingresos/consult', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user: { id: Number(userId) } })
                }),
                fetch('https://sdr-cone-v1.onrender.com/api/gastos/consult', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user: { id: Number(userId) } })
                })
            ]);

            const dataIngresos = await resIngresos.json();
            console.log("dataIngresos:", dataIngresos);
            const dataGastos = await resGastos.json();
            console.log("dataGastos:", dataGastos);

            ingresos = dataIngresos.data || [];
            gastos = dataGastos.data || [];

            calcularTotales(vistaSelect.value);
        } catch (error) {
            console.error("Error al obtener datos:", error);
            alert("No se pudieron cargar los datos financieros.");
        }
    }

    function renderTabla() {
        const tablaContainer = document.createElement("div");
        tablaContainer.className = "row mb-5";

        const tablaHTML = `
      <div class="col-md-6">
        <h5 class="fw-semibold mb-2">Ingresos recientes</h5>
        <div class="table-responsive">
          <table class="table table-striped table-sm">
            <thead class="table-light">
              <tr>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Periodo</th>
              </tr>
            </thead>
            <tbody>
              ${ingresos.slice(0, 10).map(item => `
                <tr>
                  <td>${item.descripcion}</td>
                  <td class="text-success">+$${parseFloat(item.monto).toFixed(2)}</td>
                  <td>${item.periodo}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="col-md-6">
        <h5 class="fw-semibold mb-2">Gastos recientes</h5>
        <div class="table-responsive">
          <table class="table table-striped table-sm">
            <thead class="table-light">
              <tr>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Periodo</th>
              </tr>
            </thead>
            <tbody>
              ${gastos.slice(0, 10).map(item => `
                <tr>
                  <td>${item.descripcion}</td>
                  <td class="text-danger">-$${parseFloat(item.monto).toFixed(2)}</td>
                  <td>${item.periodo}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
        console.log(tablaHTML);
        tablaContainer.innerHTML = tablaHTML;
        document.querySelector("main").appendChild(tablaContainer);
    }
    function calcularTotales(vista) {
        const factor = factores[vista];

        let ingresosDiario = 0;
        let gastosDiario = 0;

        const sumaIngresos = ingresos.reduce((total, item) => {
            const montoDiario = item.monto / periodoBase[item.periodo];
            ingresosDiario += montoDiario;
            return total + montoDiario * factor;
        }, 0);

        const sumaGastos = gastos.reduce((total, item) => {
            const montoDiario = item.monto / periodoBase[item.periodo];
            gastosDiario += montoDiario;
            return total + montoDiario * factor;
        }, 0);

        const balanceTotal = sumaIngresos - sumaGastos;
        const disponibleDiario = ingresosDiario - gastosDiario;

        totalIngresos.textContent = sumaIngresos.toFixed(2);
        totalGastos.textContent = sumaGastos.toFixed(2);
        balance.textContent = balanceTotal.toFixed(2);
        ingresoDiarioEl.textContent = ingresosDiario.toFixed(2);
        gastoDiarioEl.textContent = gastosDiario.toFixed(2);
        disponibleDiarioEl.textContent = disponibleDiario.toFixed(2);

        calcularModelo(ingresosDiario);
        renderGrafica(sumaIngresos, sumaGastos);
        console.log('asdasd')
        renderTabla();
    }

    function calcularModelo(ingresosDiario) {
        let totalGastosFijos = 0;
        let totalGastosVariables = 0;
        let totalAhorro = 0;

        gastos.forEach(item => {
            const montoDiario = item.monto / periodoBase[item.periodo];

            if (item.categoria === 1) {
                totalGastosFijos += montoDiario;
            } else if (item.categoria === 2) {
                totalGastosVariables += montoDiario;
            } else if (item.categoria === 3) {
                totalGastosFijos += montoDiario;
            }
        });

        ingresos.forEach(item => {
            if (item.categoria) {
                totalAhorro += item.monto / periodoBase[item.periodo];
            }
        });

        const pctFijos = (totalGastosFijos / ingresosDiario) * 100;
        const pctVariables = (totalGastosVariables / ingresosDiario) * 100;
        const uso =   pctFijos + pctVariables
        const pctAhorro =( (totalAhorro / ingresosDiario) * 100 ) - uso ;
        const pctTotalUsado = uso;


        modeloGastosFijos.textContent = totalGastosFijos.toFixed(2);
        modeloOcio.textContent = totalGastosVariables.toFixed(2);
        modeloAhorro.textContent = totalAhorro.toFixed(2);

        let mensaje = `Tu distribución: ${pctFijos.toFixed(1)}% fijos, ${pctVariables.toFixed(1)}% variables, ${pctAhorro.toFixed(1)}% ahorro. `;
        mensaje += `Modelo ideal: 50% fijos, 30% variables, 20% ahorro. `;

        if (pctTotalUsado > 100) {
            mensaje += "¡Atención! Estás gastando más de lo que ingresas.";
        } else {
            mensaje += `Estás usando el ${pctTotalUsado.toFixed(1)}% de tus ingresos.`;
        }

        estadoModelo.textContent = mensaje;

    }

    function renderGrafica(ingresosTotal, gastosTotal) {
        if (grafica) grafica.destroy();

        grafica = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Ingresos", "Gastos"],
                datasets: [
                    {
                        label: "Monto",
                        data: [ingresosTotal, gastosTotal],
                        backgroundColor: ["#00a86b", "#e74c3c"],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `$${context.parsed.y.toFixed(2)}`,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    vistaSelect.addEventListener("change", () => {
        calcularTotales(vistaSelect.value);
    });

    cerrarSesionBtn.addEventListener("click", () => {
        alert("Cerrando sesión...");
        sessionStorage.clear();
        window.location.href = "login.html";
    });

    console.log("Token:", token);
    obtenerDatos();
});
