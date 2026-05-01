import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "@shared/config/env";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: {
    //En React Native no hay localStorage, por lo que usamos AsyncStorage para persistir la sesión.
    //Aquí Supabase guarda y recupera los tokens de sesion
    storage: AsyncStorage,
    //Remueva automaticamente el access token antes de que expire, para evitar errores de autenticación.
    autoRefreshToken: true,
    //Mantiene la sesión incluso después de cerrar la app, hasta que el usuario cierre sesión manualmente.
    persistSession: true,
    //En mobile no se manejan callbacks de sesion por URL como web.
    detectSessionInUrl: false,
  },
});
