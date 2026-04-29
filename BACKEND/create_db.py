import os
from dotenv import load_dotenv
import pymysql

load_dotenv()

DB_USER = os.getenv('DATABASE_USER', 'root')
DB_PASS = os.getenv('DATABASE_PASSWORD', 'root')
DB_HOST = os.getenv('DATABASE_HOST', 'localhost')
DB_PORT = int(os.getenv('DATABASE_PORT', 3306))
DB_NAME = os.getenv('DATABASE_NAME', 'biblioteca_db')

SQL_FILE = os.path.join(os.path.dirname(__file__), 'setup_database.sql')

print(f"Intentando conectar a MySQL en {DB_HOST}:{DB_PORT} como {DB_USER}...")

try:
    conn = pymysql.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, autocommit=True)
except Exception as e:
    print("ERROR: No se pudo conectar al servidor MySQL:", e)
    raise SystemExit(1)

try:
    with conn.cursor() as cur:
        print(f"Leyendo archivo SQL: {SQL_FILE}")
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            sql = f.read()
        # Ejecutar el script completo
        for statement in sql.split(';'):
            stmt = statement.strip()
            if not stmt:
                continue
            try:
                cur.execute(stmt + ';')
            except Exception as ex:
                # Mostrar el error pero continuar para statements que ya existan
                print(f"WARN: Error ejecutando statement: {ex}")
        print("Script ejecutado. Comprobando existencia de la base de datos...")
        cur.execute("SHOW DATABASES LIKE %s", (DB_NAME,))
        res = cur.fetchone()
        if res:
            print(f"Base de datos '{DB_NAME}' creada o ya existente.")
        else:
            print(f"No se encontró la base de datos '{DB_NAME}'. Puede que haya ocurrido un error.")
finally:
    conn.close()

print("Hecho.")
