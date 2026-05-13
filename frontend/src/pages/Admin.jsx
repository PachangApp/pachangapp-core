import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../apiConfig";
import Dropdown from "../components/Dropdown";
import Counter from "../components/Counter";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/modals/ConfirmModal";
import EditFieldModal from "../components/modals/EditFieldModal";

const Admin = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [campos, setCampos] = useState([]);
  const [activeTab, setActiveTab] = useState("campos");
  const [newCampo, setNewCampo] = useState({
    nombre: "",
    zona: "Granada Centro",
    deporte: "Fútbol 7",
    precioPorHora: 25.0,
    disponible: true,
    parentCampoId: "",
    imagenUrl: "",
    locationUrl: ""
  });
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null });
  const [editingCampo, setEditingCampo] = useState(null);

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      if (resp.ok) {
        const url = await resp.text();
        if (isEdit) {
          setEditingCampo(prev => ({ ...prev, imagenUrl: url }));
        } else {
          setNewCampo(prev => ({ ...prev, imagenUrl: url }));
        }
      } else {
        showToast(t('admin.fields.upload_error') || "Error al subir imagen", "error");
      }
    } catch (error) {
      console.error("Error uploading field image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

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
      showToast(`${t('admin.errors.download_error')}: ${error.message}`, "error");
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
    window.scrollTo(0, 0);
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
        showToast(t('admin.fields.field_created'), "success");
        setNewCampo({ nombre: "", zona: "Granada Centro", deporte: "Fútbol 7", precioPorHora: 25.0, disponible: true, parentCampoId: "", imagenUrl: "", locationUrl: "" });
        fetchData();
      }
    } catch {
      showToast(t('admin.fields.create_error'), "error");
    }
  };

  const handleUpdateCampo = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/campos/${editingCampo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingCampo,
          parentCampoId: editingCampo.parentCampoId === "" ? null : parseInt(editingCampo.parentCampoId)
        })
      });
      if (resp.ok) {
        showToast(t('admin.fields.field_updated') || "Campo actualizado", "success");
        setShowEditModal(false);
        fetchData();
      }
    } catch {
      showToast(t('admin.fields.update_error') || "Error al actualizar", "error");
    }
  };

  const handleDeleteCampo = async (id) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/campos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        showToast(t('admin.fields.delete_success') || "Campo borrado", "success");
        fetchData();
      } else {
        showToast(t('admin.fields.delete_error'), "error");
      }
    } catch {
      showToast(t('admin.errors.network_error'), "error");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        showToast(t('admin.users.delete_success'), "success");
        fetchData();
      } else {
        showToast(t('admin.users.delete_error'), "error");
      }
    } catch {
      showToast(t('admin.errors.network_error'), "error");
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
      showToast(t('admin.users.role_error'), "error");
    }
  };

  if (storedUser.role !== 'ROLE_ADMIN') {
    return <div className="p-20 text-center font-bold text-red-600">{t('admin.errors.access_denied')}</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-0">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8">{t('admin.panel_title')}</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 bg-gray-200 p-1 rounded-2xl w-full md:w-fit">
          <button 
            onClick={() => setActiveTab("campos")}
            className={`flex-1 md:flex-none cursor-pointer px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-sm md:text-base ${activeTab === 'campos' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            {t('admin.tabs.manage_fields')}
          </button>
          <button 
            onClick={() => setActiveTab("usuarios")}
            className={`flex-1 md:flex-none cursor-pointer px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-sm md:text-base ${activeTab === 'usuarios' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            {t('admin.tabs.manage_users')}
          </button>
          <button 
            onClick={() => setActiveTab("archivos")}
            className={`flex-1 md:flex-none cursor-pointer px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-sm md:text-base ${activeTab === 'archivos' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            {t('admin.tabs.manage_files')}
          </button>
        </div>


        {activeTab === 'campos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
              <h2 className="text-xl font-black text-emerald-600 mb-6">{t('admin.fields.new_field')}</h2>
              <form onSubmit={handleCreateCampo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('admin.fields.name')}</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-gray-50 text-gray-900 font-bold rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newCampo.nombre}
                    onChange={e => setNewCampo({...newCampo, nombre: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('admin.fields.image')}</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 hover:border-emerald-400 h-28 md:h-32 rounded-xl flex items-center justify-center transition-all group">
                      <div className="flex flex-col items-center">
                        <svg className="w-6 h-6 text-gray-400 mb-1 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-sm font-bold text-gray-500">
                          {uploadingImage ? t('admin.fields.uploading') : (newCampo.imagenUrl ? t('admin.fields.image_ready') : t('admin.fields.click_to_upload'))}
                        </span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                    </label>
                    {newCampo.imagenUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                        <img src={newCampo.imagenUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Campo de Ubicación */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('admin.fields.location') || "Ubicación"}</label>
                  <input 
                    type="text"
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full p-3 bg-gray-50 text-gray-900 font-bold rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={newCampo.locationUrl}
                    onChange={e => setNewCampo({...newCampo, locationUrl: e.target.value})}
                  />
                </div>

                {/* Campo de Zona */}
                  <Dropdown
                    label={t('admin.fields.zone')}
                    options={[
                      "Granada Centro", "Granada Norte", "Zaidín", "Chana", "Albayzín", "Realejo", "Ronda", "Genil", "Armilla", "Maracena"
                    ]}
                    value={newCampo.zona}
                    onChange={val => setNewCampo({...newCampo, zona: val})}
                  />

                <div className="grid grid-cols-2 gap-4">
                  <Dropdown
                    label={t('admin.fields.sport')}
                    options={[
                      { label: t('sports.futbol_11'), value: "Fútbol 11" },
                      { label: t('sports.futbol_7'), value: "Fútbol 7" },
                      { label: t('sports.futbol_sala'), value: "Fútbol Sala" },
                      { label: "Pádel", value: "Pádel" }
                    ]}
                    value={newCampo.deporte}
                    onChange={val => setNewCampo({...newCampo, deporte: val})}
                  />
                  <Counter
                    label={t('admin.fields.price_per_hour')}
                    value={newCampo.precioPorHora}
                    onChange={val => setNewCampo({...newCampo, precioPorHora: val})}
                    step={1}
                    min={0}
                    className="grow"
                  />
                </div>
                <Dropdown
                  label={t('admin.fields.parent_field')}
                  options={[
                    { label: t('admin.fields.none'), value: "" },
                    ...campos.filter(c => c.deporte === 'Fútbol 11').map(c => ({ 
                      label: c.nombre, 
                      value: c.id.toString() 
                    }))
                  ]}
                  value={newCampo.parentCampoId}
                  onChange={val => setNewCampo({...newCampo, parentCampoId: val})}
                />
                <button 
                  type="submit" 
                  disabled={uploadingImage}
                  className="cursor-pointer w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {t('admin.fields.create_field')}
                </button>
              </form>
            </div>


            <div className="lg:col-span-2 space-y-4">
              {campos.map(campo => (
                <div key={campo.id} className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group/item hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        {campo.imagenUrl ? (
                            <img src={campo.imagenUrl} className="w-full h-full object-cover" alt={campo.nombre} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black text-xl">{campo.nombre.charAt(0)}</div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{campo.nombre}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase tracking-tight">{campo.deporte}</span>
                        <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-emerald-600 tracking-tight">{campo.precioPorHora}€/h</span>
                        {campo.parentCampoId && (
                            <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded-full font-bold text-blue-600 uppercase tracking-tighter">Hijo de ID: {campo.parentCampoId}</span>
                        )}
                        </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            setEditingCampo({...campo, parentCampoId: campo.parentCampoId || ""});
                            setShowEditModal(true);
                        }}
                        className="cursor-pointer p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                        onClick={() => setDeleteConfirm({ show: true, type: 'campo', id: campo.id })}
                        className="cursor-pointer p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{t('admin.users.user')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{t('admin.users.email')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{t('admin.users.role')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">{t('admin.users.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 whitespace-nowrap">
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
                      <div className="flex items-center justify-end gap-3">
                        {u.role === 'USER' ? (
                          <button onClick={() => handleChangeRole(u.id, 'ADMIN')} className="cursor-pointer text-emerald-600 font-bold text-sm hover:underline">{t('admin.users.make_admin')}</button>
                        ) : (
                          <button onClick={() => handleChangeRole(u.id, 'USER')} className="cursor-pointer text-gray-400 font-bold text-sm hover:underline">{t('admin.users.make_user')}</button>
                        )}
                        <button 
                          onClick={() => setDeleteConfirm({ show: true, type: 'user', id: u.id })}
                          className="cursor-pointer p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                          title={t('admin.users.delete_user')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
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
              <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{t('admin.files.export_data')}</h3>
                <p className="text-gray-500 text-sm mb-6">{t('admin.files.export_desc')}</p>
                <button 
                  onClick={() => handleDownload("/admin/reservas/export", "reservas.csv")}
                  className="inline-flex items-center gap-2 px-6 py-3 cursor-pointer bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-800 transition-all shadow-lg shadow-gray-200"
                >
                  {t('admin.files.download_csv')}
                </button>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm text-white bg-linear-to-br from-emerald-600 to-teal-700">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-black mb-2">{t('admin.files.activity_report')}</h3>
                <p className="text-emerald-50/80 text-sm mb-6">{t('admin.files.report_desc')}</p>
                <button 
                  onClick={() => handleDownload("/admin/reservas/report", "informe_pachangapp.pdf")}
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20"
                >
                  {t('admin.files.generate_pdf')}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm h-fit">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{t('admin.files.bulk_import')}</h3>
              <p className="text-gray-500 text-sm mb-8">{t('admin.files.import_desc')}</p>
              
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
                      {importFile ? importFile.name : t('admin.files.select_csv')}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{t('admin.files.drag_drop')}</span>
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
                        showToast(t('admin.files.import_success'), "success");
                        setImportFile(null);
                        fetchData();
                      } else {
                        showToast(t('admin.files.import_error'), "error");
                      }
                    } catch {
                      showToast(t('admin.errors.network_error'), "error");
                    } finally {
                      setImportLoading(false);
                    }
                  }}
                  className="cursor-pointer w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {importLoading ? t('admin.files.importing') : t('admin.files.upload_import')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <EditFieldModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        field={editingCampo}
        setField={setEditingCampo}
        onSubmit={handleUpdateCampo}
        uploadingImage={uploadingImage}
        onImageUpload={handleImageUpload}
        t={t}
      />

      <ConfirmModal 
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, type: null, id: null })}
        onConfirm={() => {
          if (deleteConfirm.type === 'campo') handleDeleteCampo(deleteConfirm.id);
          else handleDeleteUser(deleteConfirm.id);
        }}
        title={deleteConfirm.type === 'campo' ? t('admin.fields.delete_title') || "Eliminar Pista" : t('admin.users.delete_user')}
        message={deleteConfirm.type === 'campo' ? t('admin.fields.delete_confirm') : t('admin.users.delete_confirm')}
        confirmText={t('admin.fields.delete_title') || "Confirmar"}
        cancelText={t('admin.fields.cancel')}
        type="danger"
      />
    </div>
  );
};

export default Admin;
