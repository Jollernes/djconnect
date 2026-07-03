import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types/domain";
import { SEED_DJS } from "@/data/seed";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (args: { email: string; password: string; fullName: string; role: UserRole; company?: string }) => Promise<void>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  mockLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const MOCK_STORAGE_KEY = "djconnect.mockRole";
const MOCK_PROFILE_KEY = "djconnect.mockProfile";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function buildMockProfile(role: UserRole, companyName?: string): Profile {
  const now = new Date().toISOString();
  if (role === "dj") {
    const dj = SEED_DJS.find((item) => item.approved_for_shortlist) ?? SEED_DJS[0];
    return {
      id: dj.id,
      role: "dj",
      email: dj.email,
      full_name: dj.legal_name,
      phone: dj.phone,
      company_name: null,
      city: dj.city,
      created_at: dj.created_at,
      updated_at: dj.updated_at,
    };
  }

  if (role === "admin") {
    return {
      id: "mock_admin_mads",
      role: "admin",
      email: "admin@djconnect.demo",
      full_name: "Mads Holm",
      phone: "+45 33 44 55 66",
      company_name: "DJConnect",
      city: "København",
      created_at: now,
      updated_at: now,
    };
  }

  return {
    id: "mock_client_sara",
    role: "client",
    email: "sara@acme.demo",
    full_name: "Sara fra Acme A/S",
    phone: "+45 44 55 66 77",
    company_name: companyName ?? "Acme A/S",
    city: "København",
    created_at: now,
    updated_at: now,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u || !supabase) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    if (error) {
      console.error("Failed to load profile", error);
      setProfile(null);
      return;
    }
    setProfile((data as Profile | null) ?? null);
  }, []);

  const loadMockProfile = useCallback(() => {
    if (!isBrowser()) {
      setLoading(false);
      return;
    }
    const storedProfile = localStorage.getItem(MOCK_PROFILE_KEY);
    const storedRole = localStorage.getItem(MOCK_STORAGE_KEY) as UserRole | null;
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile) as Profile);
        setLoading(false);
        return;
      } catch {
        // fall through to rehydrate from the stored role
      }
    }
    if (storedRole) {
      const next = buildMockProfile(storedRole);
      setProfile(next);
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(next));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      loadMockProfile();
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      loadProfile(data.session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      loadProfile(newSession?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadMockProfile, loadProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithPassword = useCallback(
    async ({ email, password, fullName, role, company }: { email: string; password: string; fullName: string; role: UserRole; company?: string }) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, company_name: company ?? null },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (data.user) {
        await loadProfile(data.user);
      }
    },
    [loadProfile],
  );

  const signInWithGoogle = useCallback(async (role: UserRole = "client") => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent_role=${role}`,
      },
    });
    if (error) throw error;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (isBrowser()) {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      localStorage.removeItem(MOCK_PROFILE_KEY);
    }
    setProfile(null);
    setUser(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!supabase) {
      loadMockProfile();
      return;
    }
    await loadProfile(user);
  }, [loadMockProfile, loadProfile, user]);

  const mockLogin = useCallback((role: UserRole) => {
    const next = buildMockProfile(role);
    if (isBrowser()) {
      localStorage.setItem(MOCK_STORAGE_KEY, role);
      localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(next));
    }
    setProfile(next);
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      isConfigured: isSupabaseConfigured,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
      refreshProfile,
      mockLogin,
    }),
    [
      user,
      session,
      profile,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
      refreshProfile,
      mockLogin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
