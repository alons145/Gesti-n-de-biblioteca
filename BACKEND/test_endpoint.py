from main import create_app
import json

app = create_app()

# Hacer un request de prueba
with app.test_client() as client:
    # Primero, hacer login
    login_response = client.post('/api/auth/login', 
        json={"email": "admin@biblioteca.local", "password": "admin123"},
        headers={"Content-Type": "application/json"}
    )
    print(f'Login Response: {login_response.status_code}')
    login_data = login_response.get_json()
    print(f'Login Data: {login_data}')
    
    if 'access_token' in login_data:
        token = login_data['access_token']
        print(f'\nToken obtenido: {token[:50]}...')
        
        # Luego, hacer GET /api/prestamos
        prestamos_response = client.get('/api/prestamos',
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f'\nPrestamos Response Status: {prestamos_response.status_code}')
        print(f'Prestamos Response Headers: {dict(prestamos_response.headers)}')
        print(f'Prestamos Response Data: {prestamos_response.get_data(as_text=True)}')
