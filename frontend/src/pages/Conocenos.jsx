import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import BottomNav from "../components/home/BottomNav"; // Reuse bottom nav for mobile consistency

const Conocenos = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24 md:pb-0">
      <Navbar />

      <main className="grow">
        {/* 1. HERO SECTION */}
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-gray-900 text-white">
          <div className="absolute inset-0 z-0">
            {/* Background decorativo abstracto */}
            <div className="absolute top-1/4 -right-10 w-96 h-96 bg-emerald-600/30 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 -left-10 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 block">{t('about.label')}</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              {t('about.title_start')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">{t('about.title_highlight')}</span> {t('about.title_end')}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
            <Link to="/buscar-partidos" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black py-4 px-10 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-lg tracking-wide">
              {t('about.cta_btn')}
            </Link>
          </div>
        </section>

        {/* 2. HISTORIA & 3. EQUIPO (Two columns on desktop) */}
        <section className="py-20 bg-gray-50 border-y border-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              
              {/* Historia */}
              <div className="animate-in fade-in duration-700">
                <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">{t('about.origin_label')}</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6">{t('about.origin_title')}</h2>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    {t('about.p1')} 
                    <strong> Ibrahim</strong> {t('about.p1_end')}
                  </p>
                  <p>
                    {t('about.p2_start')} <strong> Pablo</strong> {t('about.p2_end')}
                  </p>
                  <p className="font-semibold text-gray-800">
                    {t('about.p3')}
                  </p>
                </div>
              </div>

              {/* Equipo */}
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-50 -z-10 transform translate-y-10"></div>
                
                {/* Ibrahim Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">I</div>
                  <h3 className="font-bold text-gray-900 text-lg">Ibrahim</h3>
                  <p className="text-emerald-600 text-sm font-semibold mb-3">{t('about.role_cofounder')}</p>
                  <p className="text-gray-500 text-sm">{t('about.ibrahim_desc')}</p>
                </div>

                {/* Pablo Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all transform md:translate-y-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">P</div>
                  <h3 className="font-bold text-gray-900 text-lg">Pablo</h3>
                  <p className="text-emerald-600 text-sm font-semibold mb-3">{t('about.role_cofounder')}</p>
                  <p className="text-gray-500 text-sm">{t('about.pablo_desc')}</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. MISIÓN Y VALORES */}
        <section className="py-24 bg-white text-center">
           <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">{t('about.mission_title')}</h2>
              <p className="text-xl text-gray-500 mb-16">
                {t('about.mission_sub')}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: "🤝", title: t('about.values.community_title'), desc: t('about.values.community_desc') },
                  { icon: "⚡", title: t('about.values.friction_title'), desc: t('about.values.friction_desc') },
                  { icon: "🔥", title: t('about.values.compete_title'), desc: t('about.values.compete_desc') },
                  { icon: "🚀", title: t('about.values.growth_title'), desc: t('about.values.growth_desc') }
                ].map((val, i) => (
                   <div key={i} className="flex flex-col items-center group">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:bg-emerald-50 group-hover:scale-110 transition-all">
                        {val.icon}
                      </div>
                      <h4 className="font-bold text-gray-900">{val.title}</h4>
                      <p className="text-sm text-gray-500">{val.desc}</p>
                   </div>
                ))}
              </div>
           </div>
        </section>

        {/* 5. QUÉ OFRECEMOS (Features visuales) */}
        <section className="py-20 bg-emerald-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4">{t('about.offer_title')}</h2>
                <p className="text-emerald-200 text-lg max-w-2xl mx-auto">{t('about.offer_sub')}</p>
             </div>

             <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: t('about.features.f1_title'), desc: t('about.features.f1_desc'), icon: "🏟️" },
                  { title: t('about.features.f2_title'), desc: t('about.features.f2_desc'), icon: "📍" },
                  { title: t('about.features.f3_title'), desc: t('about.features.f3_desc'), icon: "⚽" },
                  { title: t('about.features.f4_title'), desc: t('about.features.f4_desc'), icon: "🏆" },
                  { title: t('about.features.f5_title'), desc: t('about.features.f5_desc'), icon: "📊" }
                ].map((feat, i) => (
                  <div key={i} className="bg-emerald-800/50 p-6 rounded-3xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                     <span className="text-3xl mb-4 block">{feat.icon}</span>
                     <h4 className="text-xl font-bold mb-2">{feat.title}</h4>
                     <p className="text-emerald-100/70 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* 6. VISIÓN DE FUTURO */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 lg:flex items-center gap-16">
             <div className="lg:w-1/2 mb-10 lg:mb-0">
               <h2 className="text-4xl font-black text-gray-900 mb-6">{t('about.vision_title')}</h2>
               <div className="space-y-6 relative border-l-2 border-emerald-100 ml-3 pl-8">
                  <div className="relative">
                    <span className="absolute -left-[41px] bg-emerald-500 w-5 h-5 rounded-full border-4 border-white shadow-sm"></span>
                    <h4 className="font-bold text-gray-900 text-lg">{t('about.roadmap.phase1_title')}</h4>
                    <p className="text-gray-500 text-sm mt-1">{t('about.roadmap.phase1_desc')}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[41px] bg-emerald-200 w-5 h-5 rounded-full border-4 border-white shadow-sm"></span>
                    <h4 className="font-bold text-gray-600 text-lg">{t('about.roadmap.phase2_title')}</h4>
                    <p className="text-gray-400 text-sm mt-1">{t('about.roadmap.phase2_desc')}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[41px] bg-gray-200 w-5 h-5 rounded-full border-4 border-white shadow-sm"></span>
                    <h4 className="font-bold text-gray-400 text-lg">{t('about.roadmap.phase3_title')}</h4>
                    <p className="text-gray-400 text-sm mt-1">{t('about.roadmap.phase3_desc')}</p>
                  </div>
               </div>
             </div>
             
             {/* 7. TESTIMONIOS (Demo) */}
             <div className="lg:w-1/2">
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-6">
                   <div className="flex text-yellow-400 mb-3 text-sm">★★★★★</div>
                   <p className="italic text-gray-700 font-medium mb-4">
                     {t('about.testimonials.t1_text')}
                   </p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">M</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Miguel A.</p>
                        <p className="text-xs text-gray-500">{t('about.testimonials.t1_role')}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
                   <div className="flex text-yellow-400 mb-3 text-sm">★★★★★</div>
                   <p className="italic text-emerald-900 font-medium mb-4">
                     {t('about.testimonials.t2_text')}
                   </p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700">R</div>
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">Raúl G.</p>
                        <p className="text-xs text-emerald-700">{t('about.testimonials.t2_role')}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* 8. CTA FINAL */}
        <section className="bg-gray-900 text-center py-20 px-4">
           <div className="max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6">{t('about.final_title')}</h2>
             <p className="text-gray-400 text-lg mb-10">{t('about.final_sub')}</p>
             <Link to="/register" className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-black py-4 px-10 rounded-2xl shadow-xl transition-transform hover:scale-105">
               {t('about.join_btn')}
             </Link>
           </div>
        </section>
      </main>

      {/* Footer minimalista */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 text-center px-4">
        <p className="text-gray-400 text-sm font-medium">
          {t('about.footer')}
        </p>
      </footer>

      <BottomNav />
    </div>
  );
};

export default Conocenos;
