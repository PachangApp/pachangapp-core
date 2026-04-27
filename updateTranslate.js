const fs = require('fs');

function updateLang(file, newProps) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data, newProps);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const esProps = {
  home: {
    stats: "Más de 500 partidos jugados este mes",
    title_start: "Encuentra tu próxima",
    title_highlight: "pachanga",
    title_end: "en segundos.",
    subtitle: "Únete a partidos cerca de ti, reserva instalaciones Top y compite en ligas. El fútbol se vive en comunidad.",
    search_btn: "Buscar Partidos",
    create_btn: "Crear un Partido",
    welcome_user: "Hola, {{name}} 👋",
    welcome_sub: "Aquí tienes tu actividad reciente y próximos retos.",
    stats_matches: "Partidos",
    stats_goals: "Goles",
    stats_assists: "Asistencias",
    stats_level: "Nivel",
    trending_title: "🔥🔥 Partidos cerca de ti",
    trending_sub: "No te quedes en casa. Hay gente buscando jugadores en tu ciudad ahora mismo.",
    view_all: "Ver todos",
    no_matches_title: "No hay partidos abiertos",
    no_matches_sub: "Sé el primero en crear uno y empieza a jugar.",
    community_label: "Comunidad",
    community_title: "Sube de nivel y sé el MVP.",
    community_sub: "PachangApp no es solo para jugar, es para competir. Cada partido cuenta, cada gol suma, y tus asistencias te harán liderar el ranking de tu zona.",
    feature_1: "Estadísticas personales detalladas",
    feature_2: "Rankings locales mensuales",
    feature_3: "Insignias y recompensas por actividad",
    view_rankings: "Ver Rankings",
    top_players: "Top Jugadores",
    cta_title: "¿Listo para bajar a jugar?",
    cta_sub: "Únete a una pachanga hoy mismo o crea tú una nueva y empieza a sumar puntos en el ranking de tu ciudad.",
    start_now: "Comenzar Ahora"
  },
  about: {
    label: "Nuestra App",
    title_start: "Devolviendo el",
    title_highlight: "fútbol callejero",
    title_end: "al siglo XXI.",
    subtitle: "¿Cansado de grupos de WhatsApp muertos, faltas de asistencia y reservas imposibles? PachangApp centraliza todo para que tú solo tengas que preocuparte de bajar al campo y jugar.",
    cta_btn: "Descubre partidos ahora",
    origin_label: "Los Orígenes",
    origin_title: "De un Trabajo de Clase a la Cancha Real.",
    p1: "Todo empezó como un Proyecto de Grado Superior de Desarrollo de Aplicaciones Web (DAW).",
    p1_end: "vio clarísimo que la forma de organizar pachangas en nuestra ciudad estaba obsoleta: la fricción de sumar los 10 jugadores exactos rompe la magia del deporte amateur.",
    p2_start: "Al compartir su idea,",
    p2_end: "no dudó en subirse al barco. Ambos vimos el enorme potencial de automatizar reservas, conectar jugadores desconocidos y gamificar la experiencia del clásico 'Paco, ¿al final vienes hoy?'.",
    p3: "Así nació PachangApp: por y para futboleros harta de la burocracia de los grupos de chat.",
    mission_title: "Jugamos en el Mismo Equipo",
    mission_sub: "Creemos que el deporte es la red social original. Nuestra misión es derribar las barreras logísticas para que cualquier persona, en cualquier momento, pueda jugar un partido de calidad.",
    offer_title: "Todo el Fútbol en tu Bolsillo",
    offer_sub: "Funcionalidades diseñadas específicamente para el ecosistema del fútbol amateur.",
    vision_title: "Rumbo a la Cima",
    final_title: "Haz Más Fácil Tu Próxima Pachanga.",
    final_sub: "No esperes más. Únete, elige tu posición, revisa las estadísticas y demuestra quién manda en el terreno de juego.",
    join_btn: "Unirme a la comunidad",
    footer: "Hecho con pasión por Ibrahim y Pablo · © 2026 PachangApp"
  },
  tournaments: {
    label: "Compite a otro Nivel",
    title_start: "Torneos y",
    title_highlight: "Ligas Locales",
    subtitle: "Apunta a tu equipo, sigue los cruces en tiempo real y demuestra quién manda en la pista.",
    create_btn: "Crear Torneo",
    active_title: "Torneos Activos",
    active_sub: "Inscríbete antes de que se llenen las plazas",
    loading: "Cargando torneos...",
    no_tournaments: "No hay torneos activos",
    no_tournaments_sub: "Sé el creador del primer gran evento de esta temporada.",
    level: "Nivel",
    prize: "Premio",
    teams: "Equipos",
    enter_btn: "Entrar"
  }
};

const enProps = {
  home: {
    stats: "More than 500 matches played this month",
    title_start: "Find your next",
    title_highlight: "pickup game",
    title_end: "in seconds.",
    subtitle: "Join matches near you, book Top facilities and compete in leagues. Football is lived in community.",
    search_btn: "Search Matches",
    create_btn: "Create a Match",
    welcome_user: "Hello, {{name}} 👋",
    welcome_sub: "Here is your recent activity and upcoming challenges.",
    stats_matches: "Matches",
    stats_goals: "Goals",
    stats_assists: "Assists",
    stats_level: "Level",
    trending_title: "🔥🔥 Matches near you",
    trending_sub: "Don't stay home. There are people looking for players in your city right now.",
    view_all: "View all",
    no_matches_title: "No open matches",
    no_matches_sub: "Be the first to create one and start playing.",
    community_label: "Community",
    community_title: "Level up and be the MVP.",
    community_sub: "PachangApp is not just for playing, it's for competing. Every match counts, every goal adds up, and your assists will make you lead your local ranking.",
    feature_1: "Detailed personal stats",
    feature_2: "Monthly local rankings",
    feature_3: "Badges and rewards for activity",
    view_rankings: "View Rankings",
    top_players: "Top Players",
    cta_title: "Ready to go down and play?",
    cta_sub: "Join a pickup game today or create a new one yourself and start ranking up in your city.",
    start_now: "Start Now"
  },
  about: {
    label: "Our App",
    title_start: "Bringing",
    title_highlight: "street football",
    title_end: "back to the 21st century.",
    subtitle: "Tired of dead WhatsApp groups, no-shows and impossible bookings? PachangApp centralizes everything so you just have to worry about hitting the pitch and playing.",
    cta_btn: "Discover matches now",
    origin_label: "The Origins",
    origin_title: "From a Class Project to the Real Pitch.",
    p1: "It all started as a Web Application Development (DAW) Higher Degree Project.",
    p1_end: "saw very clearly that the way pickup games were organized in our city was obsolete: the friction of getting exactly 10 players breaks the magic of amateur sports.",
    p2_start: "Upon sharing his idea,",
    p2_end: "didn't hesitate to join the boat. We both saw the huge potential of automating bookings, connecting unknown players and gamifying the experience of the classic 'Paco, are you coming today?'.",
    p3: "Thus PachangApp was born: by and for football fans tired of the bureaucracy of chat groups.",
    mission_title: "We Play on the Same Team",
    mission_sub: "We believe sport is the original social network. Our mission is to break down logistical barriers so anyone, anytime, can play a quality match.",
    offer_title: "All Football in Your Pocket",
    offer_sub: "Features designed specifically for the amateur football ecosystem.",
    vision_title: "Heading to the Top",
    final_title: "Make Your Next Match Easier.",
    final_sub: "Don't wait any longer. Join, choose your position, check stats and show who rules the pitch.",
    join_btn: "Join the community",
    footer: "Made with passion by Ibrahim and Pablo · © 2026 PachangApp"
  },
  tournaments: {
    label: "Compete at another Level",
    title_start: "Tournaments and",
    title_highlight: "Local Leagues",
    subtitle: "Sign up your team, follow the brackets in real time and show who rules the court.",
    create_btn: "Create Tournament",
    active_title: "Active Tournaments",
    active_sub: "Register before spots fill up",
    loading: "Loading tournaments...",
    no_tournaments: "No active tournaments",
    no_tournaments_sub: "Be the creator of the first big event of this season.",
    level: "Level",
    prize: "Prize",
    teams: "Teams",
    enter_btn: "Enter"
  }
};

updateLang("./frontend/src/locales/es.json", esProps);
updateLang("./frontend/src/locales/en.json", enProps);
console.log("Languages updated");
