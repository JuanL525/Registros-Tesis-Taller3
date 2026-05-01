import { supabase } from "@shared/api/supabase";
import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface SessionState {
  user: User | null;
  isLoading: boolean;
}

export interface SessionContextType extends SessionState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión existente al montar
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error restaurando sesión:", error);
        } else {
          setUser(data?.session?.user ?? null);
        }
      } catch (err) {
        console.error("Error al restaurar sesión:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Suscribirse a cambios de autenticación en tiempo real
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true); // Inicia la carga
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setIsLoading(false); // Detiene la carga si hay un error
      throw error;
    }
    // Si el inicio de sesión es exitoso, `onAuthStateChange` se encargará de
    // actualizar el usuario y poner `isLoading` en `false`.
  };

  const signOut = async () => {
    setIsLoading(true); // Inicia la carga
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoading(false); // Detiene la carga si hay un error
      throw error;
    }
    // Si el cierre de sesión es exitoso, `onAuthStateChange` se encargará de
    // actualizar el usuario a `null` y poner `isLoading` en `false`.
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de un SessionProvider");
  }
  return context;
}
