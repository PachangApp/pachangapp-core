from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración de CORS (Permitir que React hable con Python)
origins = [
    "http://localhost:5173", # El puerto donde corre React
    "http://localhost:3000", # Por si acaso
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensaje": "¡Conexión exitosa entre Front y Back!"}