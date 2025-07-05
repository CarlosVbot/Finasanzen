document.getElementById("formGasto").addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    const descripcion = document.getElementById("descripcion").value.trim();
    const monto = parseFloat(document.getElementById("monto").value);
    const categoria = parseInt(document.getElementById("categoria").value);
    const periodo = parseInt(document.getElementById("periodo").value);

    try {
        const response = await fetch("https://sdr-cone-v1.onrender.com/api/gastos/create", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ descripcion, monto, categoria, periodo })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Gasto guardado exitosamente");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Error al guardar el gasto");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});