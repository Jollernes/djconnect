import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types/domain";
import type { UserRole as RoleEnum } from "@/types/database";
import { readDemoDJProfile } from "@/lib/demoDJProfile";
import { markDJGuideCompleted } from "@/lib/djGuide";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (args: { email: string; password: string; fullName: string; role: RoleEnum; company?: string }) => Promise<void>;
  signInWithGoogle: (role?: RoleEnum) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Mock login (only used when Supabase is not configured, for UI demos) */
  mockLogin: (role: UserRole, opts?: { customerKind?: "private" | "corporate" }) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_STORAGE_KEY = "djconnect.mockRole";
const MOCK_CUSTOMER_KIND_KEY = "djconnect.mockCustomerKind";

/**
 * Deterministic profile ids assigned to the demo private / corporate
 * customer accounts. Exported so other parts of the app (e.g. flows that
 * auto-create a customer session via {@link mockLogin}) can attach
 * records to the same id `mockLogin` will produce, without depending on
 * the implicit string literal.
 */
export const MOCK_CUSTOMER_PRIVATE_ID = "user-customer-1";
export const MOCK_CUSTOMER_CORPORATE_ID = "user-customer-2";

export function mockCustomerIdFor(kind: "private" | "corporate"): string {
  return kind === "corporate" ? MOCK_CUSTOMER_CORPORATE_ID : MOCK_CUSTOMER_PRIVATE_ID;
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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load profile", error);
      setProfile(null);
      return;
    }
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      const mockRole = localStorage.getItem(MOCK_STORAGE_KEY) as UserRole | null;
      if (mockRole) {
        const kind = localStorage.getItem(MOCK_CUSTOMER_KIND_KEY) as "private" | "corporate" | null;
        const isCorporate = mockRole === "customer" && kind === "corporate";
        const demoDJ = mockRole === "dj" ? readDemoDJProfile() : null;
        setProfile({
          id: isCorporate
            ? MOCK_CUSTOMER_CORPORATE_ID
            : mockRole === "customer"
              ? MOCK_CUSTOMER_PRIVATE_ID
              : `mock-${mockRole}`,
          role: mockRole,
          email: demoDJ?.email
            ? demoDJ.email
            : isCorporate
              ? "tom@acme.example"
              : `${mockRole}@djconnect.example`,
          full_name:
            mockRole === "admin"
              ? "Platform Admin"
              : mockRole === "dj"
                ? demoDJ?.fullName?.trim() || demoDJ?.stageName?.trim() || "DJ Alex Holm"
                : isCorporate
                  ? "Tom Bergmann"
                  : "Sara Jensen",
          phone: demoDJ?.phone ?? null,
          avatar_url: demoDJ?.profilePhotoDataUrl ?? null,
          city: demoDJ?.city ?? "Copenhagen",
          country: demoDJ?.country ?? "Denmark",
          company_name: isCorporate ? "Acme A/S" : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setLoading(false);
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
  }, [loadProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Load the profile before resolving so callers can navigate to a
    // role-gated route without racing the async onAuthStateChange handler.
    await loadProfile(data.user ?? null);
  }, [loadProfile]);

  const signUpWithPassword = useCallback(
    async ({ email, password, fullName, role, company }: { email: string; password: string; fullName: string; role: RoleEnum; company?: string }) => {
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
      // Profile row is created by DB trigger `handle_new_user`.
      if (data.user) {
        await loadProfile(data.user);
      }
    },
    [loadProfile],
  );

  const signInWithGoogle = useCallback(async (role: RoleEnum = "customer") => {
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
    localStorage.removeItem(MOCK_STORAGE_KEY);
    localStorage.removeItem(MOCK_CUSTOMER_KIND_KEY);
    setProfile(null);
    setUser(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  const mockLogin = useCallback(
    (role: UserRole, opts?: { customerKind?: "private" | "corporate" }) => {
      localStorage.setItem(MOCK_STORAGE_KEY, role);
      const kind = opts?.customerKind ?? "private";
      if (role === "customer") {
        localStorage.setItem(MOCK_CUSTOMER_KIND_KEY, kind);
      } else {
        localStorage.removeItem(MOCK_CUSTOMER_KIND_KEY);
      }
      const isCorporate = role === "customer" && kind === "corporate";
      // Demo DJs created via the signup flow override the canned profile so
      // the dashboard shows "their" name, photo and city instead of the
      // built-in seed ("DJ Alex Holm"). Logging in as DJ also marks the
      // educational onboarding guide complete — demo accounts skip that.
      const demoDJ = role === "dj" ? readDemoDJProfile() : null;
      if (role === "dj") {
        markDJGuideCompleted();
      }
      setProfile({
        id: isCorporate
          ? MOCK_CUSTOMER_CORPORATE_ID
          : role === "customer"
            ? MOCK_CUSTOMER_PRIVATE_ID
            : `mock-${role}`,
        role,
        email: demoDJ?.email
          ? demoDJ.email
          : isCorporate
            ? "tom@acme.example"
            : `${role}@djconnect.example`,
        full_name:
          role === "admin"
            ? "Platform Admin"
            : role === "dj"
              ? demoDJ?.fullName?.trim() || demoDJ?.stageName?.trim() || "DJ Alex Holm"
              : isCorporate
                ? "Tom Bergmann"
                : "Sara Jensen",
        phone: demoDJ?.phone ?? null,
        avatar_url: demoDJ?.profilePhotoDataUrl ?? null,
        city: demoDJ?.city ?? "Copenhagen",
        country: demoDJ?.country ?? "Denmark",
        company_name: isCorporate ? "Acme A/S" : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
    [],
  );

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
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
