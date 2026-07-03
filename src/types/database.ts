export type UserRole = "client" | "dj" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          email: string;
          full_name: string;
          phone: string | null;
          company_name: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          email: string;
          full_name: string;
          phone?: string | null;
          company_name?: string | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
}
