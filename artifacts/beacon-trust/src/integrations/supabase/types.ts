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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          balance: number
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["account_status"]
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          account_number: string
          bank_name: string | null
          created_at: string
          email: string | null
          id: string
          ifsc_code: string | null
          name: string
          user_id: string
        }
        Insert: {
          account_number: string
          bank_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ifsc_code?: string | null
          name: string
          user_id: string
        }
        Update: {
          account_number?: string
          bank_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ifsc_code?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string
          cardholder_name: string
          created_at: string
          expiry_month: number
          expiry_year: number
          id: string
          last_4: string
          network: string | null
          status: Database["public"]["Enums"]["card_status"]
          type: Database["public"]["Enums"]["card_type"]
          user_id: string
        }
        Insert: {
          account_id: string
          cardholder_name: string
          created_at?: string
          expiry_month: number
          expiry_year: number
          id?: string
          last_4: string
          network?: string | null
          status?: Database["public"]["Enums"]["card_status"]
          type: Database["public"]["Enums"]["card_type"]
          user_id: string
        }
        Update: {
          account_id?: string
          cardholder_name?: string
          created_at?: string
          expiry_month?: number
          expiry_year?: number
          id?: string
          last_4?: string
          network?: string | null
          status?: Database["public"]["Enums"]["card_status"]
          type?: Database["public"]["Enums"]["card_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          current_value: number | null
          id: string
          maturity_date: string | null
          name: string | null
          return_rate: number | null
          status: Database["public"]["Enums"]["investment_status"]
          type: Database["public"]["Enums"]["investment_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          current_value?: number | null
          id?: string
          maturity_date?: string | null
          name?: string | null
          return_rate?: number | null
          status?: Database["public"]["Enums"]["investment_status"]
          type: Database["public"]["Enums"]["investment_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_value?: number | null
          id?: string
          maturity_date?: string | null
          name?: string | null
          return_rate?: number | null
          status?: Database["public"]["Enums"]["investment_status"]
          type?: Database["public"]["Enums"]["investment_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_records: {
        Row: {
          address: string | null
          admin_notes: string | null
          created_at: string
          date_of_birth: string | null
          document_back_image: string | null
          document_front_image: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["kyc_doc_type"]
          full_name: string
          id: string
          nationality: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_back_image?: string | null
          document_front_image?: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["kyc_doc_type"]
          full_name: string
          id?: string
          nationality?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_back_image?: string | null
          document_front_image?: string | null
          document_number?: string
          document_type?: Database["public"]["Enums"]["kyc_doc_type"]
          full_name?: string
          id?: string
          nationality?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          emi_amount: number | null
          id: string
          interest_rate: number
          outstanding_amount: number | null
          purpose: string | null
          status: Database["public"]["Enums"]["loan_status"]
          tenure_months: number
          type: Database["public"]["Enums"]["loan_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          emi_amount?: number | null
          id?: string
          interest_rate: number
          outstanding_amount?: number | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          tenure_months: number
          type: Database["public"]["Enums"]["loan_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          emi_amount?: number | null
          id?: string
          interest_rate?: number
          outstanding_amount?: number | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          tenure_months?: number
          type?: Database["public"]["Enums"]["loan_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          staff_notes: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          recipient_account: string | null
          recipient_name: string | null
          reference: string | null
          status: Database["public"]["Enums"]["tx_status"]
          type: Database["public"]["Enums"]["tx_type"]
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          recipient_account?: string | null
          recipient_name?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          type: Database["public"]["Enums"]["tx_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          recipient_account?: string | null
          recipient_name?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          type?: Database["public"]["Enums"]["tx_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          password_hash: string | null
          phone: string | null
          pin_hash: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          password_hash?: string | null
          phone?: string | null
          pin_hash?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          password_hash?: string | null
          phone?: string | null
          pin_hash?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_status: "active" | "frozen" | "closed" | "pending"
      account_type: "savings" | "current" | "business" | "investment"
      app_role: "customer" | "staff" | "admin"
      card_status: "active" | "frozen" | "blocked" | "pending"
      card_type: "debit" | "virtual"
      investment_status: "active" | "matured" | "withdrawn"
      investment_type:
        | "mutualFund"
        | "fixedDeposit"
        | "stocks"
        | "bonds"
        | "crypto"
      kyc_doc_type: "passport" | "nationalId" | "driverLicense"
      kyc_status: "pending" | "verified" | "rejected"
      loan_status: "pending" | "approved" | "active" | "rejected" | "closed"
      loan_type: "personal" | "home" | "auto" | "education" | "business"
      notification_type: "general" | "transaction" | "security" | "loan" | "kyc"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "inProgress" | "resolved" | "closed"
      tx_status: "completed" | "pending" | "failed"
      tx_type: "credit" | "debit"
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
      account_status: ["active", "frozen", "closed", "pending"],
      account_type: ["savings", "current", "business", "investment"],
      app_role: ["customer", "staff", "admin"],
      card_status: ["active", "frozen", "blocked", "pending"],
      card_type: ["debit", "virtual"],
      investment_status: ["active", "matured", "withdrawn"],
      investment_type: [
        "mutualFund",
        "fixedDeposit",
        "stocks",
        "bonds",
        "crypto",
      ],
      kyc_doc_type: ["passport", "nationalId", "driverLicense"],
      kyc_status: ["pending", "verified", "rejected"],
      loan_status: ["pending", "approved", "active", "rejected", "closed"],
      loan_type: ["personal", "home", "auto", "education", "business"],
      notification_type: ["general", "transaction", "security", "loan", "kyc"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "inProgress", "resolved", "closed"],
      tx_status: ["completed", "pending", "failed"],
      tx_type: ["credit", "debit"],
    },
  },
} as const
