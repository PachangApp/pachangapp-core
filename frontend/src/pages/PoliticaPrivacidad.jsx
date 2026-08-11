import React from "react";
import Navbar from "../components/Navbar";

const PoliticaPrivacidad = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-emerald-500 selection:text-gray-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Política de <span className="text-emerald-500">Privacidad</span>
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mb-8 uppercase tracking-widest">
            Última actualización: 11 de Agosto de 2026
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Responsable del Tratamiento</h2>
              <p>
                El responsable del tratamiento de los datos recabados a través de esta plataforma es **PachangApp** (con dominio oficial <strong>pachangapp.es</strong>). Para cualquier consulta referente a la protección de datos, puedes dirigirte a nuestro correo de contacto oficial: <a href="mailto:contacto@pachangapp.es" className="text-emerald-400 underline">contacto@pachangapp.es</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Datos que Recopilamos</h2>
              <p className="mb-2">Recopilamos la información estrictamente necesaria para ofrecer el servicio de organización de partidos y torneos:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2">
                <li>Datos de registro: nombre, correo electrónico y foto de perfil (vía registro directo o Google OAuth).</li>
                <li>Datos de uso deportivo: posición de juego, estadísticas de partidos y preferencia de ciudad.</li>
                <li>Información técnica: dirección IP, navegador y tipo de dispositivo para garantizar la seguridad.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Finalidad del Tratamiento</h2>
              <p>Los datos recabados se utilizan para:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 mt-2">
                <li>Gestionar la creación e inscripción en partidos y torneos de fútbol y pádel.</li>
                <li>Facilitar el sistema de chat interactivo y asistente inteligente PachanBot.</li>
                <li>Garantizar la seguridad de la plataforma y evitar accesos no autorizados.</li>
                <li>Enviar notificaciones relativas a tus partidos confirmados o cambios de horario.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Legitimación</h2>
              <p>
                La base legal para el tratamiento de tus datos es la ejecución del contrato de prestación de servicios al registrarte en PachangApp y tu consentimiento explícito para las funcionalidades opcionales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Derechos del Usuario (ARCO / RGPD)</h2>
              <p>
                Conforme al Reglamento General de Protección de Datos (RGPD), tienes derecho a acceder, rectificar, suprimir, limitar u oponerte al tratamiento de tus datos personales, así como solicitar su portabilidad. Puedes ejercer estos derechos enviando una solicitud a <a href="mailto:contacto@pachangapp.es" className="text-emerald-400 underline">contacto@pachangapp.es</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Conservación y Seguridad</h2>
              <p>
                Tus datos se conservarán mientras mantengas activa tu cuenta en PachangApp. Implementamos cifrado SSL (HTTPS) de 256 bits y protocolos de seguridad robustos para proteger tu información contra accesos no autorizados.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoliticaPrivacidad;
