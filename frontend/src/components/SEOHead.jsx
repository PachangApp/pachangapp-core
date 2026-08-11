import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeMetaMap = {
  "/": {
    title: "PachangApp | Organiza y Reserva Partidos de Fútbol y Pádel",
    description: "PachangApp es la app nº1 para organizar pachangas de fútbol, torneos de pádel y conectar con jugadores cerca de ti en España."
  },
  "/inicio": {
    title: "PachangApp | Tu Panel de Partidos y Torneos",
    description: "Accede a tu panel personal de PachangApp. Consulta tus próximos partidos, estadísticas y nivel."
  },
  "/buscar-partidos": {
    title: "Buscar Partidos de Fútbol y Pádel | PachangApp",
    description: "Encuentra pachangas de fútbol 7, fútbol 11 y partidos de pádel cerca de ti. ¡Únete en un clic!"
  },
  "/buscar-jugadores": {
    title: "Buscar Jugadores y Rivales | PachangApp",
    description: "Completa la convocatoria de tu partido o encuentra compañeros de nivel para tus pachangas."
  },
  "/torneos": {
    title: "Torneos de Fútbol y Pádel | PachangApp",
    description: "Compite en torneos locales, consulta clasificaciones en tiempo real y cuadros eliminatorios."
  },
  "/crear-partido": {
    title: "Crear Nuevo Partido | PachangApp",
    description: "Organiza tu propia pachanga de fútbol o pádel en segundos. Elige campo, fecha y horario."
  },
  "/conocenos": {
    title: "Conócenos y Sobre PachangApp | Plataforma Deportiva",
    description: "Descubre cómo PachangApp revolucionó la organización de pachangas y torneos con Inteligencia Artificial."
  },
  "/login": {
    title: "Iniciar Sesión | PachangApp",
    description: "Entra a tu cuenta de PachangApp para gestionar tus partidos y torneos."
  },
  "/register": {
    title: "Registrarse Gratis | PachangApp",
    description: "Crea tu cuenta gratis en PachangApp y empieza a jugar partidos hoy mismo."
  },
  "/politica-privacidad": {
    title: "Política de Privacidad | PachangApp",
    description: "Información sobre cómo PachangApp protege y gestiona tus datos personales conforme al RGPD."
  },
  "/terminos-condiciones": {
    title: "Términos y Condiciones | PachangApp",
    description: "Condiciones de uso y servicio de la plataforma PachangApp."
  },
  "/politica-cookies": {
    title: "Política de Cookies | PachangApp",
    description: "Información sobre el uso de cookies y tecnologías similares en PachangApp."
  }
};

const SEOHead = () => {
  const location = useLocation();

  useEffect(() => {
    const routeInfo = routeMetaMap[location.pathname] || {
      title: "PachangApp | Tu App para Organizar Pachangas y Torneos",
      description: "Organiza partidos de fútbol, torneos de pádel y encuentra jugadores cerca de ti con PachangApp."
    };

    document.title = routeInfo.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", routeInfo.description);
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = routeInfo.description;
      document.head.appendChild(metaDesc);
    }
  }, [location.pathname]);

  return null;
};

export default SEOHead;
