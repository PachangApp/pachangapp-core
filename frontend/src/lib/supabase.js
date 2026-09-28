import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.error(
    '[Supabase] Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY.\n' +
    'Crea frontend/.env con esas variables o configúralas en Vercel.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ---------------------------------------------------------------------------
// HELPERS DE AUTENTICACIÓN
// ---------------------------------------------------------------------------

/** Obtiene el usuario activo (sesión) */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/** Obtiene el perfil público del usuario activo */
export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
};

/** 
 * Construye el objeto de usuario en el formato que espera el frontend
 * (igual que respondía el backend de Spring Boot)
 */
export const buildUserPayload = (supabaseUser, profile) => ({
  id:              profile?.id   || supabaseUser.id,
  username:        profile?.username || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
  email:           supabaseUser.email,
  avatar:          profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
  role:            profile?.role || 'USER',
  ranking:         profile?.ranking || 1000,
  goles:           profile?.goles || 0,
  asistencias:     profile?.asistencias || 0,
  partidosJugados: profile?.partidos_jugados || 0,
  // Token de Supabase - se guarda igual que el JWT anterior
  token:           supabaseUser.access_token || null,
});
