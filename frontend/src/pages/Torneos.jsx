import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Torneos = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-4xl mb-4 block">🏆</span>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {t("navbar.torneos")}
          </h1>
          <p className="text-gray-500 font-medium">
            Próximamente: Únete a torneos y compite por la gloria.
          </p>
        </motion.div>

        {/* Placeholder para contenido futuro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-6"></div>
              <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Torneos;
