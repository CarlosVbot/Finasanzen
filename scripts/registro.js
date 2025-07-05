document.getElementById("formRegistro").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const username = document.getElementById("username").value.trim();
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password , username })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registro exitoso, ahora puedes iniciar sesión");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Error al registrarse");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});