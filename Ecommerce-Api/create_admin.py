#!/usr/bin/env python3
"""
Script simple para crear un usuario admin directamente
Conecta a PostgreSQL y crea un usuario con rol admin
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime
import sys

# Credenciales de la BD (del .env)
DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "ecommerce_db"
DB_USER = "ecommerce_user"
DB_PASSWORD = "ecommerce_pass"

# Credenciales del admin a crear
ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@ecommerce.com"
ADMIN_PASSWORD = "Admin123!@#"
ADMIN_FULLNAME = "Administrador Principal"

def hash_password(password: str) -> str:
    """Hashea una contraseña con bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_admin_user():
    """Crea un usuario admin en la base de datos"""
    conn = None
    try:
        # Conectar a la base de datos
        print(f"🔗 Conectando a PostgreSQL en {DB_HOST}:{DB_PORT}/{DB_NAME}...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        print("✅ Conexión exitosa\n")
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verificar si el usuario ya existe
        cursor.execute(
            "SELECT id, username, role FROM users WHERE username = %s OR email = %s",
            (ADMIN_USERNAME, ADMIN_EMAIL)
        )
        existing_user = cursor.fetchone()
        
        if existing_user:
            # Actualizar a admin si ya existe
            print(f"⚠️  Usuario '{existing_user['username']}' ya existe")
            cursor.execute(
                "UPDATE users SET role = 'admin' WHERE id = %s",
                (existing_user['id'],)
            )
            conn.commit()
            print(f"✅ Usuario actualizado a rol ADMIN\n")
            print("=" * 50)
            print("📋 CREDENCIALES DEL ADMINISTRADOR")
            print("=" * 50)
            print(f"Username: {ADMIN_USERNAME}")
            print(f"Email:    {ADMIN_EMAIL}")
            print(f"Password: {ADMIN_PASSWORD}")
            print("=" * 50)
        else:
            # Crear nuevo usuario admin
            hashed_pwd = hash_password(ADMIN_PASSWORD)
            
            cursor.execute(
                """
                INSERT INTO users (username, email, password, full_name, is_active, role, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, username, email, role
                """,
                (ADMIN_USERNAME, ADMIN_EMAIL, hashed_pwd, ADMIN_FULLNAME, True, "admin", datetime.now())
            )
            new_user = cursor.fetchone()
            conn.commit()
            
            print(f"✅ Usuario ADMIN creado exitosamente\n")
            print("=" * 50)
            print("📋 CREDENCIALES DEL ADMINISTRADOR")
            print("=" * 50)
            print(f"ID:       {new_user['id']}")
            print(f"Username: {new_user['username']}")
            print(f"Email:    {new_user['email']}")
            print(f"Password: {ADMIN_PASSWORD}")
            print(f"Rol:      {new_user['role']}")
            print("=" * 50)
        
        cursor.close()
        
    except psycopg2.OperationalError as e:
        print(f"❌ Error de conexión: {e}")
        print("Verifica que PostgreSQL esté corriendo y las credenciales sean correctas")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_admin_user()
