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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          agency_address: string | null
          agency_email: string | null
          agency_name: string
          agency_phone: string | null
          created_at: string
          default_domestic_fee: number
          default_international_fee: number
          id: string
          invoice_footer: string | null
          tva_rate: number
          updated_at: string
        }
        Insert: {
          agency_address?: string | null
          agency_email?: string | null
          agency_name?: string
          agency_phone?: string | null
          created_at?: string
          default_domestic_fee?: number
          default_international_fee?: number
          id?: string
          invoice_footer?: string | null
          tva_rate?: number
          updated_at?: string
        }
        Update: {
          agency_address?: string | null
          agency_email?: string | null
          agency_name?: string
          agency_phone?: string | null
          created_at?: string
          default_domestic_fee?: number
          default_international_fee?: number
          id?: string
          invoice_footer?: string | null
          tva_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      balance_records: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          system: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          system: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          system?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_records: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          classification: string | null
          classified_at: string | null
          classified_by: string | null
          created_at: string
          description: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          classification?: string | null
          classified_at?: string | null
          classified_by?: string | null
          created_at?: string
          description: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          classification?: string | null
          classified_at?: string | null
          classified_by?: string | null
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          client_name: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          sale_id: string
          trigger_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          sale_id: string
          trigger_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          sale_id?: string
          trigger_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          agent: string
          buying_price: number
          cashed_in: boolean | null
          cashed_in_at: string | null
          cashed_in_by: string | null
          client_name: string
          created_at: string
          departure_date: string
          departure_time: string
          destination: string | null
          from_airport: string | null
          has_registration: boolean | null
          id: string
          numeric_id: number
          phone_number: string
          pnr: string | null
          profit: number | null
          rw_date: string | null
          rw_time: string | null
          selling_price: number
          system: string
          to_airport: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent: string
          buying_price: number
          cashed_in?: boolean | null
          cashed_in_at?: string | null
          cashed_in_by?: string | null
          client_name: string
          created_at?: string
          departure_date: string
          departure_time: string
          destination?: string | null
          from_airport?: string | null
          has_registration?: boolean | null
          id?: string
          numeric_id?: number
          phone_number: string
          pnr?: string | null
          profit?: number | null
          rw_date?: string | null
          rw_time?: string | null
          selling_price: number
          system: string
          to_airport?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent?: string
          buying_price?: number
          cashed_in?: boolean | null
          cashed_in_at?: string | null
          cashed_in_by?: string | null
          client_name?: string
          created_at?: string
          departure_date?: string
          departure_time?: string
          destination?: string | null
          from_airport?: string | null
          has_registration?: boolean | null
          id?: string
          numeric_id?: number
          phone_number?: string
          pnr?: string | null
          profit?: number | null
          rw_date?: string | null
          rw_time?: string | null
          selling_price?: number
          system?: string
          to_airport?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      assign_role_by_email: {
        Args: {
          user_email: string
          user_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      cash_in_sale: {
        Args: { sale_id: string }
        Returns: undefined
      }
      create_demo_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_all_system_balances: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_balance: number
          system: string
        }[]
      }
      get_current_debt_balance: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_balance: number
        }[]
      }
      get_expenses_daily_total: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_expenses: number
        }[]
      }
      get_expenses_monthly_total: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_expenses: number
        }[]
      }
      get_sales_by_type_aggregates: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          profit: number
          revenue: number
          type: string
        }[]
      }
      get_sales_daily_aggregates: {
        Args: Record<PropertyKey, never>
        Returns: {
          day: string
          profit: number
          revenue: number
          sales: number
        }[]
      }
      get_sales_monthly_aggregates: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          profit: number
          revenue: number
          sales: number
        }[]
      }
      get_system_balance: {
        Args: { system_name: string }
        Returns: number
      }
      get_unapproved_expenses_daily_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      get_unapproved_expenses_monthly_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      user_has_permission: {
        Args: { permission_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "agent"
        | "cashier"
        | "manager"
        | "super_agent"
        | "supplier_accelaero"
        | "supplier_ttp"
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
      app_role: [
        "agent",
        "cashier",
        "manager",
        "super_agent",
        "supplier_accelaero",
        "supplier_ttp",
      ],
    },
  },
} as const
