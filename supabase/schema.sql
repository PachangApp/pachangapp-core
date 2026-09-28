-- ============================================================
--  PACHANGAPP · SUPABASE SCHEMA
--  Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
--  (Dashboard → SQL Editor → New Query → pega y corre)
-- ============================================================

-- ============================================================
-- 1. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 2. TABLA PROFILES (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        TEXT,
    avatar_url      TEXT,
    role            TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    partidos_jugados INT  NOT NULL DEFAULT 0,
    victorias        INT  NOT NULL DEFAULT 0,
    derrotas         INT  NOT NULL DEFAULT 0,
    ranking          INT  NOT NULL DEFAULT 1000,
    goles            INT  NOT NULL DEFAULT 0,
    asistencias      INT  NOT NULL DEFAULT 0,
    posicion1        TEXT,
    posicion2        TEXT,
    posicion3        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. CAMPOS (pistas deportivas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campos (
    id              BIGSERIAL PRIMARY KEY,
    nombre          TEXT NOT NULL,
    zona            TEXT,
    deporte         TEXT NOT NULL DEFAULT 'FUTBOL_7',
    precio_por_hora NUMERIC(10,2) NOT NULL DEFAULT 0,
    disponible      BOOLEAN NOT NULL DEFAULT TRUE,
    imagen_url      TEXT,
    location_url    TEXT,
    parent_campo_id BIGINT REFERENCES public.campos(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.campos (nombre, zona, deporte, precio_por_hora, disponible, imagen_url, location_url) VALUES
('Campo Municipal La Alameda',    'Triana',        'FUTBOL_7',  25.00, TRUE, NULL, 'https://maps.google.com/?q=Triana+Sevilla'),
('Estadio Auxiliar del Sevilla',  'Nervión',       'FUTBOL_11', 60.00, TRUE, NULL, 'https://maps.google.com/?q=Nervion+Sevilla'),
('Pabellón Deportivo San Pablo',  'San Pablo',     'SALA',      20.00, TRUE, NULL, 'https://maps.google.com/?q=San+Pablo+Sevilla'),
('Campo Sintético Los Bermejales','Los Bermejales','FUTBOL_7',  30.00, TRUE, NULL, 'https://maps.google.com/?q=Los+Bermejales+Sevilla'),
('Polideportivo Heliópolis',      'Heliópolis',    'FUTBOL_7',  28.00, TRUE, NULL, 'https://maps.google.com/?q=Heliopolis+Sevilla'),
('Campo de Fútbol Torreblanca',   'Torreblanca',   'FUTBOL_11', 50.00, TRUE, NULL, 'https://maps.google.com/?q=Torreblanca+Sevilla'),
('Pista Cubierta Macarena',       'Macarena',      'SALA',      18.00, TRUE, NULL, 'https://maps.google.com/?q=Macarena+Sevilla'),
('Campo La Buhaira',              'Nervión',       'FUTBOL_7',  22.00, TRUE, NULL, 'https://maps.google.com/?q=La+Buhaira+Sevilla');

-- ============================================================
-- 5. RESERVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reservas (
    id               BIGSERIAL PRIMARY KEY,
    campo_id         BIGINT NOT NULL REFERENCES public.campos(id) ON DELETE CASCADE,
    user_id          UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fecha            DATE   NOT NULL,
    hora_inicio      TIME   NOT NULL,
    duracion_minutos INT    NOT NULL DEFAULT 60,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campo_id, fecha, hora_inicio)
);

-- ============================================================
-- 6. PARTIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partidos (
    id             BIGSERIAL PRIMARY KEY,
    reserva_id     BIGINT UNIQUE REFERENCES public.reservas(id) ON DELETE CASCADE,
    organizador_id UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    max_jugadores  INT    NOT NULL DEFAULT 14,
    deporte        TEXT   NOT NULL DEFAULT 'FUTBOL_7',
    estado         TEXT   NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'LLENO', 'FINALIZADO')),
    marcador_a     INT,
    marcador_b     INT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. PARTICIPACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.participaciones (
    id         BIGSERIAL PRIMARY KEY,
    partido_id BIGINT NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    user_id    UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    equipo     TEXT   NOT NULL DEFAULT 'NINGUNO' CHECK (equipo IN ('NEGRO', 'BLANCO', 'NINGUNO')),
    color_rgb  TEXT   NOT NULL DEFAULT '#000000',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (partido_id, user_id)
);

-- ============================================================
-- 8. MENSAJES DE PARTIDO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mensajes (
    id         BIGSERIAL PRIMARY KEY,
    partido_id BIGINT NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    user_id    UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contenido  TEXT   NOT NULL,
    timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. INVITACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitaciones (
    id           BIGSERIAL PRIMARY KEY,
    partido_id   BIGINT NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    invitador_id UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitado_id  UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    estado       TEXT   NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (partido_id, invitado_id)
);

-- ============================================================
-- 10. TORNEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    image_url   TEXT,
    level       TEXT CHECK (level IN ('BASICO', 'INTERMEDIO', 'AVANZADO')),
    type        TEXT NOT NULL DEFAULT 'ELIMINATORIAS' CHECK (type IN ('ELIMINATORIAS', 'LIGA')),
    max_teams   INT  NOT NULL DEFAULT 8,
    location    TEXT,
    start_date  DATE,
    end_date    DATE,
    price       NUMERIC(10,2),
    prize       TEXT,
    sport_type  TEXT CHECK (sport_type IN ('SALA', 'FUTBOL_7', 'FUTBOL_11')),
    status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'FINISHED')),
    creator_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. EQUIPOS DE TORNEO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id            BIGSERIAL PRIMARY KEY,
    name          TEXT    NOT NULL,
    tournament_id BIGINT  NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    creator_id    UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_players (
    team_id BIGINT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

-- ============================================================
-- 12. BRACKET DE TORNEO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id            BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_a_id     BIGINT REFERENCES public.teams(id) ON DELETE SET NULL,
    team_b_id     BIGINT REFERENCES public.teams(id) ON DELETE SET NULL,
    score_a       INT,
    score_b       INT,
    round         TEXT,
    match_index   INT    NOT NULL DEFAULT 0,
    matchday      INT,
    next_match_id BIGINT REFERENCES public.tournament_matches(id) ON DELETE SET NULL,
    winner_id     BIGINT REFERENCES public.teams(id) ON DELETE SET NULL,
    status        TEXT   NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PLAYING', 'FINISHED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. CLASIFICACIÓN DE LIGA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.league_standings (
    id             BIGSERIAL PRIMARY KEY,
    tournament_id  BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id        BIGINT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    points         INT NOT NULL DEFAULT 0,
    played         INT NOT NULL DEFAULT 0,
    won            INT NOT NULL DEFAULT 0,
    drawn          INT NOT NULL DEFAULT 0,
    lost           INT NOT NULL DEFAULT 0,
    goals_for      INT NOT NULL DEFAULT 0,
    goals_against  INT NOT NULL DEFAULT 0,
    UNIQUE (tournament_id, team_id)
);

-- ============================================================
-- 14. CHAT DE TORNEO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_chats (
    id            BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    sender_id     UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content       TEXT   NOT NULL,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participaciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitaciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_standings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_chats  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"  ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "campos_select_all"    ON public.campos FOR SELECT USING (TRUE);
CREATE POLICY "campos_insert_admin"  ON public.campos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "campos_update_admin"  ON public.campos FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "reservas_select_own"  ON public.reservas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reservas_insert_auth" ON public.reservas FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reservas_delete_own"  ON public.reservas FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "partidos_select_all"       ON public.partidos FOR SELECT USING (TRUE);
CREATE POLICY "partidos_insert_auth"      ON public.partidos FOR INSERT WITH CHECK (organizador_id = auth.uid());
CREATE POLICY "partidos_update_organizer" ON public.partidos FOR UPDATE USING (organizador_id = auth.uid());
CREATE POLICY "partidos_delete_organizer" ON public.partidos FOR DELETE USING (organizador_id = auth.uid());

CREATE POLICY "participaciones_select_all"  ON public.participaciones FOR SELECT USING (TRUE);
CREATE POLICY "participaciones_insert_auth" ON public.participaciones FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "participaciones_delete_own"  ON public.participaciones FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "mensajes_select_all"   ON public.mensajes FOR SELECT USING (TRUE);
CREATE POLICY "mensajes_insert_auth"  ON public.mensajes FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "invitaciones_select_involved" ON public.invitaciones FOR SELECT
    USING (invitador_id = auth.uid() OR invitado_id = auth.uid());
CREATE POLICY "invitaciones_insert_auth"     ON public.invitaciones FOR INSERT
    WITH CHECK (invitador_id = auth.uid());
CREATE POLICY "invitaciones_update_invitado" ON public.invitaciones FOR UPDATE
    USING (invitado_id = auth.uid());

CREATE POLICY "tournaments_select_all"     ON public.tournaments FOR SELECT USING (TRUE);
CREATE POLICY "tournaments_insert_auth"    ON public.tournaments FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "tournaments_update_creator" ON public.tournaments FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "tournaments_delete_creator" ON public.tournaments FOR DELETE USING (creator_id = auth.uid());

CREATE POLICY "teams_select_all"     ON public.teams FOR SELECT USING (TRUE);
CREATE POLICY "teams_insert_auth"    ON public.teams FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "teams_update_creator" ON public.teams FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "team_players_select_all"  ON public.team_players FOR SELECT USING (TRUE);
CREATE POLICY "team_players_insert_auth" ON public.team_players FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "team_players_delete_own"  ON public.team_players FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "tournament_matches_select_all" ON public.tournament_matches FOR SELECT USING (TRUE);
CREATE POLICY "tournament_matches_update_creator" ON public.tournament_matches FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.creator_id = auth.uid()));

CREATE POLICY "league_standings_select_all" ON public.league_standings FOR SELECT USING (TRUE);

CREATE POLICY "tournament_chats_select_all"  ON public.tournament_chats FOR SELECT USING (TRUE);
CREATE POLICY "tournament_chats_insert_auth" ON public.tournament_chats FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- 16. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reservas_campo_fecha        ON public.reservas(campo_id, fecha);
CREATE INDEX IF NOT EXISTS idx_partidos_estado             ON public.partidos(estado);
CREATE INDEX IF NOT EXISTS idx_participaciones_partido     ON public.participaciones(partido_id);
CREATE INDEX IF NOT EXISTS idx_profiles_ranking            ON public.profiles(ranking DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status          ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_chats_tournament ON public.tournament_chats(tournament_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_partido            ON public.mensajes(partido_id);

-- ============================================================
-- 17. TRIGGER UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
