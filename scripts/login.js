document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('userId', data.userID);
                alert('Credenciales correcta');
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error(error);
            alert('No se pudo conectar con el servidor');
        }
    });
});
