import { useEffect, useState } from 'react'

function App() {
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    // Aquí es donde el Frontend llama al Backend
    fetch('http://127.0.0.1:8000/')
      .then(response => response.json())
      .then(data => setMensaje(data.mensaje))
      .catch(error => console.error('Error conectando:', error))
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <h1 className="text-5xl font-bold text-primary mb-4">PachangApp</h1>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Estado del Backend:</h2>
          {/* Si aparece el mensaje del backend, funciona */}
          <p className="text-success font-mono text-xl">
            {mensaje || "Cargando..."}
          </p>
          <button className="btn btn-primary mt-4">Botón DaisyUI</button>
        </div>
      </div>
    </div>
  )
}

export default App