export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          elderly_profile_id: string
          id: string
          logged_by: string | null
          notes: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          elderly_profile_id: string
          id?: string
          logged_by?: string | null
          notes?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          elderly_profile_id?: string
          id?: string
          logged_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_elderly_profile_id_fkey"
            columns: ["elderly_profile_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_history: {
        Row: {
          acknowledged_at: string | null
          alert_method: Database["public"]["Enums"]["alert_method"]
          contact_id: string | null
          created_at: string
          elderly_profile_id: string
          error_message: string | null
          id: string
          message: string
          sent_at: string | null
          status: Database["public"]["Enums"]["alert_status"]
        }
        Insert: {
          acknowledged_at?: string | null
          alert_method: Database["public"]["Enums"]["alert_method"]
          contact_id?: string | null
          created_at?: string
          elderly_profile_id: string
          error_message?: string | null
          id?: string
          message: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
        }
        Update: {
          acknowledged_at?: string | null
          alert_method?: Database["public"]["Enums"]["alert_method"]
          contact_id?: string | null
          created_at?: string
          elderly_profile_id?: string
          error_message?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_elderly_profile_id_fkey"
            columns: ["elderly_profile_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          alert_methods: Database["public"]["Enums"]["alert_method"][]
          created_at: string
          elderly_profile_id: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          phone: string | null
          relationship: string | null
        }
        Insert: {
          alert_methods?: Database["public"]["Enums"]["alert_method"][]
          created_at?: string
          elderly_profile_id: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          relationship?: string | null
        }
        Update: {
          alert_methods?: Database["public"]["Enums"]["alert_method"][]
          created_at?: string
          elderly_profile_id?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_elderly_profile_id_fkey"
            columns: ["elderly_profile_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_activity: {
        Row: {
          created_at: string
          device_id: string | null
          elderly_profile_id: string
          id: string
          received_at: string
          sms_body: string | null
          sms_from: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          elderly_profile_id: string
          id?: string
          received_at?: string
          sms_body?: string | null
          sms_from?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          elderly_profile_id?: string
          id?: string
          received_at?: string
          sms_body?: string | null
          sms_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_activity_elderly_profile_id_fkey"
            columns: ["elderly_profile_id"]
            isOneToOne: false
            referencedRelation: "elderly_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          device_name: string
          id: string
          inactivity_threshold_hours: number
          is_active: boolean
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name: string
          id?: string
          inactivity_threshold_hours?: number
          is_active?: boolean
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string
          id?: string
          inactivity_threshold_hours?: number
          is_active?: boolean
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      elderly_profiles: {
        Row: {
          address: string | null
          age: number | null
          caregiver_id: string
          created_at: string
          device_id: string | null
          device_phone_number: string | null
          full_name: string
          id: string
          inactivity_threshold_hours: number
          last_activity_at: string | null
          medical_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          caregiver_id: string
          created_at?: string
          device_id?: string | null
          device_phone_number?: string | null
          full_name: string
          id?: string
          inactivity_threshold_hours?: number
          last_activity_at?: string | null
          medical_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          caregiver_id?: string
          created_at?: string
          device_id?: string | null
          device_phone_number?: string | null
          full_name?: string
          id?: string
          inactivity_threshold_hours?: number
          last_activity_at?: string | null
          medical_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notification_method: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          notification_method?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notification_method?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_method: "email" | "sms" | "voice_call"
      alert_status: "pending" | "sent" | "failed" | "acknowledged"
      app_role: "admin" | "caregiver" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_method: ["email", "sms", "voice_call"],
      alert_status: ["pending", "sent", "failed", "acknowledged"],
      app_role: ["admin", "caregiver", "user"],
    },
  },
} as const
