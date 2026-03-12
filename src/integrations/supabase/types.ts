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
      bookmarks: {
        Row: {
          created_at: string
          id: string
          sale_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sale_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sale_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
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
      event_occurrences: {
        Row: {
          category_tags: string[]
          created_at: string
          created_by: string | null
          ends_on: string | null
          event_series_id: string
          id: string
          last_verified_at: string | null
          max_discount_pct: number | null
          official_url: string | null
          sale_year: number
          starts_on: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_tags?: string[]
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          event_series_id: string
          id?: string
          last_verified_at?: string | null
          max_discount_pct?: number | null
          official_url?: string | null
          sale_year: number
          starts_on?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_tags?: string[]
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          event_series_id?: string
          id?: string
          last_verified_at?: string | null
          max_discount_pct?: number | null
          official_url?: string | null
          sale_year?: number
          starts_on?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_occurrences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_occurrences_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["event_series_id"]
          },
          {
            foreignKeyName: "event_occurrences_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
        ]
      }
      event_series: {
        Row: {
          cadence: string
          created_at: string
          event_kind: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          organization_id: string
          slug: string
          typical_end_month: number | null
          typical_start_month: number | null
          updated_at: string
        }
        Insert: {
          cadence?: string
          created_at?: string
          event_kind: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          organization_id: string
          slug: string
          typical_end_month?: number | null
          typical_start_month?: number | null
          updated_at?: string
        }
        Update: {
          cadence?: string
          created_at?: string
          event_kind?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          slug?: string
          typical_end_month?: number | null
          typical_start_month?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_series_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "event_series_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_series_follows: {
        Row: {
          created_at: string
          event_series_id: string
          notify_before_days: number[]
          notify_on_ending_soon: boolean
          notify_on_start: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          event_series_id: string
          notify_before_days?: number[]
          notify_on_ending_soon?: boolean
          notify_on_start?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          event_series_id?: string
          notify_before_days?: number[]
          notify_on_ending_soon?: boolean
          notify_on_start?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_series_follows_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["event_series_id"]
          },
          {
            foreignKeyName: "event_series_follows_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
        ]
      }
      event_signals: {
        Row: {
          created_at: string
          created_by: string | null
          event_series_id: string
          expires_on: string | null
          id: string
          occurrence_id: string | null
          signal_date: string
          signal_kind: string
          signal_strength: number
          source_id: string | null
          summary: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_series_id: string
          expires_on?: string | null
          id?: string
          occurrence_id?: string | null
          signal_date?: string
          signal_kind: string
          signal_strength?: number
          source_id?: string | null
          summary: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_series_id?: string
          expires_on?: string | null
          id?: string
          occurrence_id?: string | null
          signal_date?: string
          signal_kind?: string
          signal_strength?: number
          source_id?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_signals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_signals_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["event_series_id"]
          },
          {
            foreignKeyName: "event_signals_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_signals_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["occurrence_id"]
          },
          {
            foreignKeyName: "event_signals_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "event_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sources: {
        Row: {
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          occurrence_id: string
          published_at: string | null
          publisher: string | null
          reliability_score: number
          source_kind: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          occurrence_id: string
          published_at?: string | null
          publisher?: string | null
          reliability_score?: number
          source_kind: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          occurrence_id?: string
          published_at?: string | null
          publisher?: string | null
          reliability_score?: number
          source_kind?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sources_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["occurrence_id"]
          },
          {
            foreignKeyName: "event_sources_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_follows: {
        Row: {
          created_at: string
          notify_before_days: number[]
          notify_on_ending_soon: boolean
          notify_on_start: boolean
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          notify_before_days?: number[]
          notify_on_ending_soon?: boolean
          notify_on_start?: boolean
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          notify_before_days?: number[]
          notify_on_ending_soon?: boolean
          notify_on_start?: boolean
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_follows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_follows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country_code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          org_type: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          org_type: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          org_type?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
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
      submissions: {
        Row: {
          body: string | null
          created_at: string
          ends_on: string | null
          event_series_id: string | null
          id: string
          moderation_status: string
          organization_id: string | null
          payload: Json
          platform_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_url: string | null
          starts_on: string | null
          submitted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          ends_on?: string | null
          event_series_id?: string | null
          id?: string
          moderation_status?: string
          organization_id?: string | null
          payload?: Json
          platform_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_url?: string | null
          starts_on?: string | null
          submitted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          ends_on?: string | null
          event_series_id?: string | null
          id?: string
          moderation_status?: string
          organization_id?: string | null
          payload?: Json
          platform_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_url?: string | null
          starts_on?: string | null
          submitted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["event_series_id"]
          },
          {
            foreignKeyName: "submissions_event_series_id_fkey"
            columns: ["event_series_id"]
            isOneToOne: false
            referencedRelation: "event_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "event_occurrence_cards"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      event_occurrence_cards: {
        Row: {
          category_tags: string[] | null
          ends_on: string | null
          event_name: string | null
          event_series_id: string | null
          event_slug: string | null
          last_verified_at: string | null
          max_discount_pct: number | null
          occurrence_id: string | null
          occurrence_title: string | null
          official_url: string | null
          organization_id: string | null
          organization_name: string | null
          organization_slug: string | null
          starts_on: string | null
          status: string | null
          summary: string | null
        }
        Relationships: []
      }
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
