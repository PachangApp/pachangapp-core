import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../apiConfig";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [campos, setCampos] = useState([]);
  const [activeTab, setActiveTab] = useState("campos");
  const [newCampo, setNewCampo] = useState({
    nombre: "",
    zona: "Granada Centro",
    deporte: "Fútbol 7",
    precioPorHora: 25.0,
    disponible: true,
    parentCampoId: ""
  });
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storedUser.token;

  const handleDownload = async (endpoint, fileName) => {
    try {
      const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Error en la descarga");
      
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert("No se pudo descargar el archivo: " + error.message);
    }
  };

  const fetchData = React.useCallback(async () => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      const usersResp = await fetch(`${API_BASE_URL}/admin/users`, { headers });
      const usersData = await usersResp.json();
      setUsers(usersData);

      const camposResp = await fetch(`${API_BASE_URL}/campos`); 
      const camposData = await camposResp.json();
      setCampos(camposData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCampo = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/campos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newCampo,
          parentCampoId: newCampo.parentCampoId === "" ? null : parseInt(newCampo.parentCampoId)
        })
      });
      if (resp.ok) {
        alert("Campo creado con éxito");
        setNewCampo({ nombre: "", zona: "Granada Centro", deporte: "Fútbol 7", precioPorHora: 25.0, disponible: true, parentCampoId: "" });
        fetchData();
      }
    } catch {
      alert("Error al crear campo");
    }
  };

  const handleDeleteCampo = async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este campo? Borrarás también su disponibilidad.")) return;
    try {
      await fetch(`${API_BASE_URL}/admin/campos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchData();
    } catch {
      alert("Error al borrar");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await fetch(`${API_BASE_URL}/admin/users/${userId}/role?role=${newRole}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchData();
    } catch {
      alert("Error al cambiar rol");
    }
  };

  if (storedUser.role !== 'ROLE_ADMIN') {
    return <div className="p-20 text-center font-bold text-red-600">Acceso Denegado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Panel de Administración</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-gray-200 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("campos")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'campos' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Gestionar Campos
          </button>
          <button 
            onClick={() => setActiveTab("usuarios")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'usuarios' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Gestionar Usuarios
          </button>
          <button 
            onClick={() => setActiveTab("archivos")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'archivos' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Gestionar Archivos
          </button>
        </div>

        {activeTab === 'campos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-6">Nuevo Campo</h2>
              <form onSubmit={handleCreateCampo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newCampo.nombre}
                    onChange={e => setNewCampo({...newCampo, nombre: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Deporte</label>
                    <select 
                      className="w-full p-3 bg-gray-50 rounded-xl outline-none"
                      value={newCampo.deporte}
                      onChange={e => setNewCampo({...newCampo, deporte: e.target.value})}
                    >
                      <option value="Fútbol 11">Fútbol 11</option>
                      <option value="Fútbol 7">Fútbol 7</option>
                      <option value="Fútbol Sala">Fútbol Sala</option>
                      <option value="Pádel">Pádel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Precio/h</label>
                    <input 
                      type="number" step="0.01" required
                      className="w-full p-3 bg-gray-50 rounded-xl outline-none"
                      value={newCampo.precioPorHora}
                      onChange={e => setNewCampo({...newCampo, precioPorHora: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Campo Padre (Opcional)</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl outline-none"
                    value={newCampo.parentCampoId}
                    onChange={e => setNewCampo({...newCampo, parentCampoId: e.target.value})}
                  >
                    <option value="">Ninguno</option>
                    {campos.filter(c => c.deporte === 'Fútbol 11').map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100">Crear Campo</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {campos.map(campo => (
                <div key={campo.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{campo.nombre}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase">{campo.deporte}</span>
                      <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-emerald-600 tracking-tight">{campo.precioPorHora}€/h</span>
                      {campo.parentCampoId && (
                        <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full font-bold text-blue-600">Hijo de ID: {campo.parentCampoId}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCampo(campo.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-bold text-gray-900">{u.username}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-black ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'USER' ? (
                        <button onClick={() => handleChangeRole(u.id, 'ADMIN')} className="text-emerald-600 font-bold text-sm hover:underline">Hacer Admin</button>
                      ) : (
                        <button onClick={() => handleChangeRole(u.id, 'USER')} className="text-gray-400 font-bold text-sm hover:underline">Hacer User</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'archivos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Exportar Datos</h3>
                <p className="text-gray-500 text-sm mb-6">Descarga un volcado completo de las reservas actuales en formato CSV para auditoría externa.</p>
                <button 
                  onClick={() => handleDownload("/admin/reservas/export", "reservas.csv")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                >
                  Descargar Reservas (CSV)
                </button>
              </div>

              <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm text-white bg-linear-to-br from-emerald-600 to-teal-700">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-black mb-2">Informe de Actividad</h3>
                <p className="text-emerald-50/80 text-sm mb-6">Genera un documento PDF profesional con el resumen de actividad y métricas de uso de la plataforma.</p>
                <button 
                  onClick={() => handleDownload("/admin/reservas/report", "informe_pachangapp.pdf")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20"
                >
                  Generar Reporte PDF
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm h-fit">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Importación Masiva</h3>
              <p className="text-gray-500 text-sm mb-8">Carga nuevos campos deportivos mediante un archivo CSV. El archivo debe seguir la estructura: Nombre, Deporte, Zona, Precio.</p>
              
              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${importFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50'}`}>
                    <span className="text-sm font-bold text-gray-500">
                      {importFile ? importFile.name : "Seleccionar archivo CSV"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Haz clic o arrastra</span>
                  </div>
                </div>

                <button 
                  disabled={!importFile || importLoading}
                  onClick={async () => {
                    setImportLoading(true);
                    const formData = new FormData();
                    formData.append("file", importFile);
                    try {
                      const resp = await fetch(`${API_BASE_URL}/admin/campos/import`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData
                      });
                      if (resp.ok) {
                        alert("Importación completada con éxito");
                        setImportFile(null);
                        fetchData();
                      } else {
                        alert("Error al importar el archivo");
                      }
                    } catch {
                      alert("Error de red");
                    } finally {
                      setImportLoading(false);
                    }
                  }}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {importLoading ? "Importando..." : "Subir e Importar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
