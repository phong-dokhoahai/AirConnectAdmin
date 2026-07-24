import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unauthorized";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const setAuthorizedUser = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      if (await isAdmin(nextUser.id)) {
        setUser(nextUser);
        setStatus("authenticated");
        return;
      }
    } catch {
      setUser(null);
      setStatus("unauthorized");
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setStatus("unauthorized");
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        void setAuthorizedUser(data.session?.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        void setAuthorizedUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthorizedUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return error.message;
      }

      if (!data.user || !(await isAdmin(data.user.id))) {
        await supabase.auth.signOut();
        setUser(null);
        setStatus("unauthorized");
        return "This account does not have admin access.";
      }

      setUser(data.user);
      setStatus("authenticated");
      return null;
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
