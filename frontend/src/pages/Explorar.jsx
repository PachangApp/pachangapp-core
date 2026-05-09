import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const Explorar = () => {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-10 pb-32 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {t("explore_hub.title")}
          </h1>
          <p className="text-gray-500 font-medium">
            {t("explore_hub.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4"
        >
          <Link
            to="/buscar-partidos"
            className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-5xl mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">⚽</span>
            <h2 className="text-xl font-bold text-gray-900 relative z-10 mb-2">
              {t("explore_hub.search_matches")}
            </h2>
            <p className="text-sm text-gray-500 relative z-10">
              {t("explore_hub.search_matches_desc")}
            </p>
          </Link>

          <Link
            to="/buscar-jugadores"
            className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-blue-100 hover:border-blue-500 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-5xl mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">👥</span>
            <h2 className="text-xl font-bold text-gray-900 relative z-10 mb-2">
              {t("explore_hub.search_players")}
            </h2>
            <p className="text-sm text-gray-500 relative z-10">
              {t("explore_hub.search_players_desc")}
            </p>
          </Link>
        </motion.div>

      </div>
    </div>
    </>
  );
};

export default Explorar;
