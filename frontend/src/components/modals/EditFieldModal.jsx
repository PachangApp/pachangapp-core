import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "../Dropdown";
import Counter from "../Counter";

const EditFieldModal = ({ 
    isOpen, 
    onClose, 
    field, 
    setField, 
    onSubmit, 
    uploadingImage, 
    onImageUpload, 
    t 
}) => {
    if (!field) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/40">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-4xl p-5 md:p-8 max-w-xl w-full shadow-2xl relative flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800"
                    >
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                            <h2 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white pr-8">
                                {t('admin.fields.edit_title')} <span className="text-emerald-600 block sm:inline">{field.nombre}</span>
                            </h2>
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-1.5 space-y-3 md:space-y-4">
                            {/* NOMBRE */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('admin.fields.name')}</label>
                                <textarea 
                                    required
                                    rows="1"
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent dark:border-slate-700 resize-none text-sm"
                                    value={field.nombre}
                                    onChange={e => setField({...field, nombre: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Dropdown
                                    label={t('admin.fields.sport')}
                                    options={[
                                        { label: t('sports.futbol_11'), value: "Fútbol 11" },
                                        { label: t('sports.futbol_7'), value: "Fútbol 7" },
                                        { label: t('sports.futbol_sala'), value: "Fútbol Sala" },
                                        { label: "Pádel", value: "Pádel" }
                                    ]}
                                    value={field.deporte}
                                    onChange={val => setField({...field, deporte: val})}
                                />
                                <Counter
                                    label={t('admin.fields.price_per_hour')}
                                    value={field.precioPorHora}
                                    onChange={val => setField({...field, precioPorHora: val})}
                                    step={1}
                                    min={0}
                                />
                            </div>

                            <Dropdown
                                label={t('admin.fields.zone')}
                                options={[
                                    "Granada Centro", "Granada Norte", "Zaidín", "Chana", "Albayzín", "Realejo", "Ronda", "Genil", "Armilla", "Maracena"
                                ]}
                                value={field.zona}
                                onChange={val => setField({...field, zona: val})}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('admin.fields.image')}</label>
                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('edit-file-input').click()}>
                                        <div className="h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 group-hover:border-emerald-500 transition-colors">
                                            {field.imagenUrl ? (
                                                <img src={field.imagenUrl} alt="Field" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-[8px] font-bold uppercase tracking-tighter">{t('admin.fields.click_to_upload')}</span>
                                                </div>
                                            )}
                                            {uploadingImage && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                                                    <span className="text-white text-[10px] font-bold">{t('admin.fields.uploading')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            id="edit-file-input"
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => onImageUpload(e, true)} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('admin.fields.google_maps_link')}</label>
                                    <textarea 
                                        className="w-full h-24 p-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent dark:border-slate-700 text-[10px] resize-none"
                                        value={field.locationUrl}
                                        onChange={e => setField({...field, locationUrl: e.target.value})}
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-gray-100 dark:border-slate-800 text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors uppercase text-[10px] tracking-widest"
                                >
                                    {t('admin.fields.cancel')}
                                </button>
                                <button 
                                    type="submit"
                                    disabled={uploadingImage}
                                    className="flex-[2] py-3 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 uppercase text-[10px] tracking-widest"
                                >
                                    {t('admin.fields.save_changes')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditFieldModal;
