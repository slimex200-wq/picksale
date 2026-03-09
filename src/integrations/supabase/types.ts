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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      community_comments: {
        Row: {
          author_id: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author: string | null
          author_id: string | null
          category: string[]
          comments_count: number
          content: string | null
          created_at: string
          external_link: string
          id: string
          is_sale_signal: boolean
          platform: string | null
          review_status: string
          signal_score: number
          source_type: string | null
          title: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          category?: string[]
          comments_count?: number
          content?: string | null
          created_at?: string
          external_link?: string
          id?: string
          is_sale_signal?: boolean
          platform?: string | null
          review_status?: string
          signal_score?: number
          source_type?: string | null
          title: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          author?: string | null
          author_id?: string | null
          category?: string[]
          comments_count?: number
          content?: string | null
          created_at?: string
          external_link?: string
          id?: string
          is_sale_signal?: boolean
          platform?: string | null
          review_status?: string
          signal_score?: number
          source_type?: string | null
          title?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_upvotes: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_aliases: {
        Row: {
          alias: string
          canonical_name: string
          id: string
          platform: string
        }
        Insert: {
          alias: string
          canonical_name: string
          id?: string
          platform: string
        }
        Update: {
          alias?: string
          canonical_name?: string
          id?: string
          platform?: string
        }
        Relationships: []
      }
      platform_scrape_rules: {
        Row: {
          active: boolean
          card_selector: string
          date_selector: string
          id: string
          link_selector: string
          page_url: string
          platform: string
          surface_type: string
          title_selector: string
        }
        Insert: {
          active?: boolean
          card_selector?: string
          date_selector?: string
          id?: string
          link_selector?: string
          page_url?: string
          platform: string
          surface_type?: string
          title_selector?: string
        }
        Update: {
          active?: boolean
          card_selector?: string
          date_selector?: string
          id?: string
          link_selector?: string
          page_url?: string
          platform?: string
          surface_type?: string
          title_selector?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      sale_events: {
        Row: {
          canonical_link: string
          canonical_title: string
          created_at: string
          end_date: string
          event_status: string
          id: string
          importance_score: number
          platform: string
          signal_count: number
          start_date: string
          updated_at: string
        }
        Insert: {
          canonical_link?: string
          canonical_title: string
          created_at?: string
          end_date: string
          event_status?: string
          id?: string
          importance_score?: number
          platform: string
          signal_count?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          canonical_link?: string
          canonical_title?: string
          created_at?: string
          end_date?: string
          event_status?: string
          id?: string
          importance_score?: number
          platform?: string
          signal_count?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      sale_signals: {
        Row: {
          community_post_id: string | null
          confidence: number
          created_at: string
          detected_discount: string
          detected_keywords: string[]
          end_date_raw: string | null
          id: string
          matched_alias: string
          normalized_title: string
          platform: string
          processed: boolean
          raw_text: string
          raw_title: string
          review_status: string
          source_type: string
          source_url: string
          start_date_raw: string | null
        }
        Insert: {
          community_post_id?: string | null
          confidence?: number
          created_at?: string
          detected_discount?: string
          detected_keywords?: string[]
          end_date_raw?: string | null
          id?: string
          matched_alias?: string
          normalized_title?: string
          platform: string
          processed?: boolean
          raw_text?: string
          raw_title?: string
          review_status?: string
          source_type?: string
          source_url?: string
          start_date_raw?: string | null
        }
        Update: {
          community_post_id?: string | null
          confidence?: number
          created_at?: string
          detected_discount?: string
          detected_keywords?: string[]
          end_date_raw?: string | null
          id?: string
          matched_alias?: string
          normalized_title?: string
          platform?: string
          processed?: boolean
          raw_text?: string
          raw_title?: string
          review_status?: string
          source_type?: string
          source_url?: string
          start_date_raw?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_signals_community_post_id_fkey"
            columns: ["community_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_submissions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          link: string
          platform: string | null
          sale_name: string
          start_date: string | null
          status: string
          submitter_email: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          link?: string
          platform?: string | null
          sale_name: string
          start_date?: string | null
          status?: string
          submitter_email?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          link?: string
          platform?: string | null
          sale_name?: string
          start_date?: string | null
          status?: string
          submitter_email?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          category: string[]
          confidence_score: number | null
          created_at: string
          description: string
          end_date: string
          event_id: string | null
          event_key: string | null
          filter_reason: string
          grouped_page_count: number
          id: string
          image_url: string | null
          importance_score: number
          latest_pub_date: string | null
          latest_source_url: string | null
          link: string
          matched_by: string | null
          platform: string
          publish_status: string
          review_status: string
          sale_name: string
          sale_tier: string
          signal_id: string | null
          signal_type: string | null
          source_type: string | null
          source_urls: string[]
          start_date: string
          updated_at: string
        }
        Insert: {
          category?: string[]
          confidence_score?: number | null
          created_at?: string
          description?: string
          end_date: string
          event_id?: string | null
          event_key?: string | null
          filter_reason?: string
          grouped_page_count?: number
          id?: string
          image_url?: string | null
          importance_score?: number
          latest_pub_date?: string | null
          latest_source_url?: string | null
          link?: string
          matched_by?: string | null
          platform: string
          publish_status?: string
          review_status?: string
          sale_name: string
          sale_tier?: string
          signal_id?: string | null
          signal_type?: string | null
          source_type?: string | null
          source_urls?: string[]
          start_date: string
          updated_at?: string
        }
        Update: {
          category?: string[]
          confidence_score?: number | null
          created_at?: string
          description?: string
          end_date?: string
          event_id?: string | null
          event_key?: string | null
          filter_reason?: string
          grouped_page_count?: number
          id?: string
          image_url?: string | null
          importance_score?: number
          latest_pub_date?: string | null
          latest_source_url?: string | null
          link?: string
          matched_by?: string | null
          platform?: string
          publish_status?: string
          review_status?: string
          sale_name?: string
          sale_tier?: string
          signal_id?: string | null
          signal_type?: string | null
          source_type?: string | null
          source_urls?: string[]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sale_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "sale_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recalc_signal_score: { Args: { p_post_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
