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
      company_settings: {
        Row: {
          company_address: string | null
          company_city: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          company_postal_code: string | null
          company_siret: string | null
          company_tva: string | null
          created_at: string
          id: string
          logo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_name: string
          company_phone?: string | null
          company_postal_code?: string | null
          company_siret?: string | null
          company_tva?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          company_postal_code?: string | null
          company_siret?: string | null
          company_tva?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_history: {
        Row: {
          id: string
          message: string
          recipient_email: string | null
          recipient_type: string
          sent_at: string
          sent_by: string
          status: string
          subject: string
          total_recipients: number | null
        }
        Insert: {
          id?: string
          message: string
          recipient_email?: string | null
          recipient_type: string
          sent_at?: string
          sent_by: string
          status?: string
          subject: string
          total_recipients?: number | null
        }
        Update: {
          id?: string
          message?: string
          recipient_email?: string | null
          recipient_type?: string
          sent_at?: string
          sent_by?: string
          status?: string
          subject?: string
          total_recipients?: number | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_rate: number
          id: string
          invoice_id: string
          position: number
          quantity: number
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_rate?: number
          id?: string
          invoice_id: string
          position?: number
          quantity?: number
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_rate?: number
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_city: string | null
          client_email: string | null
          client_logo_url: string | null
          client_name: string
          client_phone: string | null
          client_postal_code: string | null
          company_address: string | null
          company_city: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_postal_code: string | null
          company_siret: string | null
          company_tva: string | null
          created_at: string
          discount_amount: number
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          due_date: string | null
          id: string
          issue_date: string
          notes: string | null
          status: Database["public"]["Enums"]["document_status"]
          subtotal: number
          tax_amount: number
          terms: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_city?: string | null
          client_email?: string | null
          client_logo_url?: string | null
          client_name: string
          client_phone?: string | null
          client_postal_code?: string | null
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_postal_code?: string | null
          company_siret?: string | null
          company_tva?: string | null
          created_at?: string
          discount_amount?: number
          document_number: string
          document_type?: Database["public"]["Enums"]["document_type"]
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_city?: string | null
          client_email?: string | null
          client_logo_url?: string | null
          client_name?: string
          client_phone?: string | null
          client_postal_code?: string | null
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_postal_code?: string | null
          company_siret?: string | null
          company_tva?: string | null
          created_at?: string
          discount_amount?: number
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      online_store: {
        Row: {
          address: string | null
          allow_orders: boolean | null
          banner_url: string | null
          created_at: string | null
          delivery_fee: number | null
          delivery_info: string | null
          description: string | null
          email: string | null
          enable_reviews: boolean | null
          free_delivery_minimum: number | null
          id: string
          is_published: boolean | null
          logo_url: string | null
          maintenance_mode: boolean | null
          name: string
          phone: string | null
          primary_color: string | null
          show_stock: boolean | null
          slug: string
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          allow_orders?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          delivery_info?: string | null
          description?: string | null
          email?: string | null
          enable_reviews?: boolean | null
          free_delivery_minimum?: number | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          maintenance_mode?: boolean | null
          name: string
          phone?: string | null
          primary_color?: string | null
          show_stock?: boolean | null
          slug: string
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          allow_orders?: boolean | null
          banner_url?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          delivery_info?: string | null
          description?: string | null
          email?: string | null
          enable_reviews?: boolean | null
          free_delivery_minimum?: number | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          maintenance_mode?: boolean | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          show_stock?: boolean | null
          slug?: string
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_first_name: string | null
          customer_last_name: string | null
          customer_name: string | null
          customer_phone: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_amount: number
          payment_date: string
          payment_method: string
          payment_provider: string | null
          proof_image_url: string | null
          remaining_amount: number
          sale_id: string | null
          status: string
          total_amount: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_date?: string
          payment_method: string
          payment_provider?: string | null
          proof_image_url?: string | null
          remaining_amount?: number
          sale_id?: string | null
          status?: string
          total_amount?: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_date?: string
          payment_method?: string
          payment_provider?: string | null
          proof_image_url?: string | null
          remaining_amount?: number
          sale_id?: string | null
          status?: string
          total_amount?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon_bg_color: string | null
          icon_emoji: string | null
          id: string
          image_url: string | null
          min_quantity: number
          name: string
          price: number
          quantity: number
          sku: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon_bg_color?: string | null
          icon_emoji?: string | null
          id?: string
          image_url?: string | null
          min_quantity?: number
          name: string
          price?: number
          quantity?: number
          sku?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon_bg_color?: string | null
          icon_emoji?: string | null
          id?: string
          image_url?: string | null
          min_quantity?: number
          name?: string
          price?: number
          quantity?: number
          sku?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          paid_amount: number
          payment_method: string | null
          product_id: string
          quantity: number
          sale_date: string
          total_amount: number
          unit_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          paid_amount?: number
          payment_method?: string | null
          product_id: string
          quantity: number
          sale_date?: string
          total_amount: number
          unit_price: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          paid_amount?: number
          payment_method?: string | null
          product_id?: string
          quantity?: number
          sale_date?: string
          total_amount?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          new_quantity: number
          previous_quantity: number
          product_id: string
          quantity: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          new_quantity: number
          previous_quantity: number
          product_id: string
          quantity: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          new_quantity?: number
          previous_quantity?: number
          product_id?: string
          quantity?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_order_items: {
        Row: {
          id: string
          order_id: string
          product_icon: string | null
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_icon?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_icon?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_fee: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          store_id: string
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_fee?: number | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          store_id: string
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          store_id?: string
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "online_store"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          id: string
          is_featured: boolean | null
          online_description: string | null
          online_price: number | null
          product_id: string
          published_at: string | null
          store_id: string
        }
        Insert: {
          id?: string
          is_featured?: boolean | null
          online_description?: string | null
          online_price?: number | null
          product_id: string
          published_at?: string | null
          store_id: string
        }
        Update: {
          id?: string
          is_featured?: boolean | null
          online_description?: string | null
          online_price?: number | null
          product_id?: string
          published_at?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "online_store"
            referencedColumns: ["id"]
          },
        ]
      }
      store_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          product_id: string | null
          rating: number | null
          store_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          store_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "online_store"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string
          id: string
          is_legacy_user: boolean
          paystack_customer_code: string | null
          subscribed: boolean
          subscription_code: string | null
          subscription_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          is_legacy_user?: boolean
          paystack_customer_code?: string | null
          subscribed?: boolean
          subscription_code?: string | null
          subscription_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          is_legacy_user?: boolean
          paystack_customer_code?: string | null
          subscribed?: boolean
          subscription_code?: string | null
          subscription_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_login_history: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          login_at: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          login_at?: string
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          login_at?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      cleanup_expired_reset_codes: { Args: never; Returns: undefined }
      generate_document_number: {
        Args: {
          _document_type: Database["public"]["Enums"]["document_type"]
          _user_id: string
          _year?: number
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_reset_code: {
        Args: { _code: string; _email: string }
        Returns: {
          code: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      document_status:
        | "brouillon"
        | "envoye"
        | "paye"
        | "annule"
        | "accepte"
        | "refuse"
      document_type: "facture" | "devis"
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
      app_role: ["admin", "user"],
      document_status: [
        "brouillon",
        "envoye",
        "paye",
        "annule",
        "accepte",
        "refuse",
      ],
      document_type: ["facture", "devis"],
    },
  },
} as const
