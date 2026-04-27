import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ActivityWidget = ({ upcomingMatch }) => {
  const { t } = useTranslation();

  if (!upcomingMatch) {
    return (
      <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center animate-in fade-in duration-500 h-full flex flex-col justify-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          🏃‍♂️
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">{t('home.widget_empty_title')}</h2>
        <p className="text-gray-500 mb-8 font-medium">{t('home.widget_empty_sub')}</p>
        <div className="flex flex-col gap-3">
          <Link to="/buscar-partidos" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             {t('home.search_btn')}
          </Link>
          <Link to="/crear-partido" className="w-full bg-white hover:bg-gray-50 border-2 border-gray-100 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
             {t('home.create_btn')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 h-full border border-white/10 flex flex-col justify-between">
      <div>
        <div className="absolute top-0 right-0 opacity-10 text-9xl translate-x-12 -translate-y-8 pointer-events-none">⚽</div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-200/80">
          {t('home.next_match_in')} {upcomingMatch.timeUntil}
        </p>
        <h2 className="text-2xl font-black mb-6 leading-tight drop-shadow-md">
          {upcomingMatch.type} <br/> <span className="text-emerald-300">@ {upcomingMatch.location}</span>
        </h2>
        <div className="flex flex-col gap-3 mb-8 text-white">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 w-fit">
            <span>📅</span> {upcomingMatch.dateFormatted}
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 w-fit">
            <span>☀️</span> {upcomingMatch.weather}
          </div>
        </div>
      </div>
      <Link to="/perfil" className="block w-full bg-white text-emerald-900 font-black py-4 rounded-xl text-center hover:shadow-lg hover:bg-emerald-50 transition drop-shadow-md active:scale-95">
        {t('home.view_match_details')}
      </Link>
    </section>
  );
};

export default ActivityWidget;
