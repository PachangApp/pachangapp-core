function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <h1 className="text-5xl font-bold text-primary mb-4">PachangApp</h1>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl mb-2">¡Bienvenido!</h2>
          <p className="text-base-content/80 mb-6">
            La base del proyecto está lista. Aquí integraremos el Registro y el Login.
          </p>
          <div className="flex gap-4 w-full">
            <button className="btn btn-primary flex-1">Login</button>
            <button className="btn btn-outline flex-1">Registro</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App