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
      cash_movements: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by_member_id: string | null
          description: string | null
          id: string
          proof_url: string | null
          session_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by_member_id?: string | null
          description?: string | null
          id?: string
          proof_url?: string | null
          session_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by_member_id?: string | null
          description?: string | null
          id?: string
          proof_url?: string | null
          session_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          closing_notes: string | null
          created_at: string
          created_by_member_id: string | null
          difference: number | null
          expected_amount: number | null
          id: string
          opened_at: string
          opened_by_user_id: string | null
          opening_amount: number
          status: string
          total_card: number | null
          total_cash: number | null
          total_entries: number | null
          total_expenses: number | null
          total_mobile_money: number | null
          total_sales: number | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          closing_notes?: string | null
          created_at?: string
          created_by_member_id?: string | null
          difference?: number | null
          expected_amount?: number | null
          id?: string
          opened_at?: string
          opened_by_user_id?: string | null
          opening_amount?: number
          status?: string
          total_card?: number | null
          total_cash?: number | null
          total_entries?: number | null
          total_expenses?: number | null
          total_mobile_money?: number | null
          total_sales?: number | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          closing_notes?: string | null
          created_at?: string
          created_by_member_id?: string | null
          difference?: number | null
          expected_amount?: number | null
          id?: string
          opened_at?: string
          opened_by_user_id?: string | null
          opening_amount?: number
          status?: string
          total_card?: number | null
          total_cash?: number | null
          total_entries?: number | null
          total_expenses?: number | null
          total_mobile_money?: number | null
          total_sales?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ceo_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_code: string
          company_name_set: boolean | null
          created_at: string
          id: string
          lock_timeout_minutes: number
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          owner_id: string
          selected_modules: string[] | null
          updated_at: string
        }
        Insert: {
          company_code: string
          company_name_set?: boolean | null
          created_at?: string
          id?: string
          lock_timeout_minutes?: number
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          owner_id: string
          selected_modules?: string[] | null
          updated_at?: string
        }
        Update: {
          company_code?: string
          company_name_set?: boolean | null
          created_at?: string
          id?: string
          lock_timeout_minutes?: number
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          owner_id?: string
          selected_modules?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          auth_user_id: string | null
          company_id: string
          created_at: string
          first_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          last_name: string | null
          photo_url: string | null
          pin_code: string
          role_id: string | null
          service_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          company_id: string
          created_at?: string
          first_name: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          photo_url?: string | null
          pin_code: string
          role_id?: string | null
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          company_id?: string
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_name?: string | null
          photo_url?: string | null
          pin_code?: string
          role_id?: string | null
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "company_services"
            referencedColumns: ["id"]
          },
        ]
      }
      company_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_system: boolean
          name: string
          permissions: Json
          service_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          permissions?: Json
          service_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          permissions?: Json
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_roles_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "company_services"
            referencedColumns: ["id"]
          },
        ]
      }
      company_services: {
        Row: {
          color: string
          company_id: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          company_id: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
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
      customers: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          credit_balance: number | null
          credit_enabled: boolean
          credit_limit: number | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          last_purchase_at: string | null
          loyalty_points: number
          notes: string | null
          phone: string | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          credit_balance?: number | null
          credit_enabled?: boolean
          credit_limit?: number | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          last_purchase_at?: string | null
          loyalty_points?: number
          notes?: string | null
          phone?: string | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          credit_balance?: number | null
          credit_enabled?: boolean
          credit_limit?: number | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          last_purchase_at?: string | null
          loyalty_points?: number
          notes?: string | null
          phone?: string | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          assigned_at: string | null
          company_id: string
          created_at: string
          delivered_at: string | null
          driver_member_id: string | null
          id: string
          problem_reason: string | null
          proof_url: string | null
          started_at: string | null
          status: string
          store_order_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          company_id: string
          created_at?: string
          delivered_at?: string | null
          driver_member_id?: string | null
          id?: string
          problem_reason?: string | null
          proof_url?: string | null
          started_at?: string | null
          status?: string
          store_order_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          driver_member_id?: string | null
          id?: string
          problem_reason?: string | null
          proof_url?: string | null
          started_at?: string | null
          status?: string
          store_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_driver_member_id_fkey"
            columns: ["driver_member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_store_order_id_fkey"
            columns: ["store_order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
        ]
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
      lock_sessions: {
        Row: {
          company_id: string
          id: string
          locked_at: string
          member_id: string
          unlocked_at: string | null
        }
        Insert: {
          company_id: string
          id?: string
          locked_at?: string
          member_id: string
          unlocked_at?: string | null
        }
        Update: {
          company_id?: string
          id?: string
          locked_at?: string
          member_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lock_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lock_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
          theme_id: string | null
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
          theme_id?: string | null
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
          theme_id?: string | null
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
      payment_history: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          id: string
          moneroo_payment_id: string | null
          paid_at: string | null
          payment_method: string | null
          plan_name: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          moneroo_payment_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_name: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          moneroo_payment_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_name?: string
          status?: string
          user_id?: string
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
      product_categories: {
        Row: {
          color: string | null
          created_at: string
          icon_emoji: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon_emoji?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon_emoji?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
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
          tax_rate: number | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
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
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
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
          tax_rate?: number | null
          unit?: string | null
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
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
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
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
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
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applies_to: string | null
          category_names: string[] | null
          code: string | null
          created_at: string
          cumulative: boolean | null
          current_uses: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          name: string
          product_ids: string[] | null
          start_date: string | null
          type: string
          user_id: string
          value: number
        }
        Insert: {
          applies_to?: string | null
          category_names?: string[] | null
          code?: string | null
          created_at?: string
          cumulative?: boolean | null
          current_uses?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          name: string
          product_ids?: string[] | null
          start_date?: string | null
          type: string
          user_id: string
          value: number
        }
        Update: {
          applies_to?: string | null
          category_names?: string[] | null
          code?: string | null
          created_at?: string
          cumulative?: boolean | null
          current_uses?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          name?: string
          product_ids?: string[] | null
          start_date?: string | null
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          action_type: string
          attempted_at: string
          id: string
          identifier: string
        }
        Insert: {
          action_type: string
          attempted_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action_type?: string
          attempted_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          created_by_member_id: string | null
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
          created_by_member_id?: string | null
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
          created_by_member_id?: string | null
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
            foreignKeyName: "sales_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["id"]
          },
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
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          email: string
          id: string
          is_legacy_user: boolean
          is_trial: boolean | null
          moneroo_payment_id: string | null
          next_billing_date: string | null
          paystack_customer_code: string | null
          plan_name: string | null
          plan_price: number | null
          subscribed: boolean
          subscription_code: string | null
          subscription_end: string | null
          subscription_start: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          email: string
          id?: string
          is_legacy_user?: boolean
          is_trial?: boolean | null
          moneroo_payment_id?: string | null
          next_billing_date?: string | null
          paystack_customer_code?: string | null
          plan_name?: string | null
          plan_price?: number | null
          subscribed?: boolean
          subscription_code?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          email?: string
          id?: string
          is_legacy_user?: boolean
          is_trial?: boolean | null
          moneroo_payment_id?: string | null
          next_billing_date?: string | null
          paystack_customer_code?: string | null
          plan_name?: string | null
          plan_price?: number | null
          subscribed?: boolean
          subscription_code?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          plan: string
          reference: string
          session_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan: string
          reference: string
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan?: string
          reference?: string
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
      cleanup_rate_limit_attempts: { Args: never; Returns: undefined }
      generate_company_code: { Args: never; Returns: string }
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
      is_active_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      validate_pin_login: {
        Args: { _company_code: string; _pin_code: string }
        Returns: {
          auth_user_id: string
          company_id: string
          company_logo_url: string
          company_name: string
          member_first_name: string
          member_id: string
          member_last_name: string
          member_permissions: Json
          member_photo_url: string
          member_role_name: string
          owner_id: string
        }[]
      }
      verify_member_pin: {
        Args: { _member_id: string; _pin: string }
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
