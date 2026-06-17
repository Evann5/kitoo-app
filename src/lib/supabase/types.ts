export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      consents: {
        Row: {
          granted_at: string;
          id: string;
          revoked_at: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          id?: string;
          revoked_at?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          granted_at?: string;
          id?: string;
          revoked_at?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      mood_entries: {
        Row: {
          comment: string | null;
          created_at: string;
          entry_date: string;
          id: string;
          level: number;
          score: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          entry_date?: string;
          id?: string;
          level: number;
          score?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          entry_date?: string;
          id?: string;
          level?: number;
          score?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      mood_entry_tags: {
        Row: {
          mood_entry_id: string;
          tag_id: string;
        };
        Insert: {
          mood_entry_id: string;
          tag_id: string;
        };
        Update: {
          mood_entry_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mood_entry_tags_mood_entry_id_fkey";
            columns: ["mood_entry_id"];
            isOneToOne: false;
            referencedRelation: "mood_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mood_entry_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "mood_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      mood_tags: {
        Row: {
          id: string;
          label: string;
          slug: string;
        };
        Insert: {
          id?: string;
          label: string;
          slug: string;
        };
        Update: {
          id?: string;
          label?: string;
          slug?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          accessibility_prefs: Json;
          created_at: string;
          id: string;
          notif_prefs: Json;
          prenom: string | null;
          updated_at: string;
        };
        Insert: {
          accessibility_prefs?: Json;
          created_at?: string;
          id: string;
          notif_prefs?: Json;
          prenom?: string | null;
          updated_at?: string;
        };
        Update: {
          accessibility_prefs?: Json;
          created_at?: string;
          id?: string;
          notif_prefs?: Json;
          prenom?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          mood_levels: number[];
          summary: string;
          theme: string;
          title: string;
          type: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          mood_levels?: number[];
          summary: string;
          theme: string;
          title: string;
          type: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          mood_levels?: number[];
          summary?: string;
          theme?: string;
          title?: string;
          type?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_current_user: { Args: never; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
