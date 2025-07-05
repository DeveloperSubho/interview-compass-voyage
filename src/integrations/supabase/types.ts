export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          tier: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tier?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tier?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coding_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      coding_questions: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          github_link: string | null
          id: string
          is_paid: boolean
          level_unlock: string
          slug: string
          solution: string
          status: string
          tags: string[]
          tier: string
          title: string
          updated_at: string
          video_link: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          github_link?: string | null
          id?: string
          is_paid?: boolean
          level_unlock?: string
          slug: string
          solution: string
          status?: string
          tags?: string[]
          tier?: string
          title: string
          updated_at?: string
          video_link?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          github_link?: string | null
          id?: string
          is_paid?: boolean
          level_unlock?: string
          slug?: string
          solution?: string
          status?: string
          tags?: string[]
          tier?: string
          title?: string
          updated_at?: string
          video_link?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          id: string
          tier: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          id?: string
          tier?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          id?: string
          tier?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          duration: string | null
          github_url: string | null
          id: string
          key_features: string[]
          pricing_tier: string
          technologies: string[]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration?: string | null
          github_url?: string | null
          id?: string
          key_features?: string[]
          pricing_tier?: string
          technologies?: string[]
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration?: string | null
          github_url?: string | null
          id?: string
          key_features?: string[]
          pricing_tier?: string
          technologies?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          content: string
          created_at: string | null
          created_by: string | null
          difficulty: string
          id: string
          pricing_tier: string | null
          subcategory_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          content: string
          created_at?: string | null
          created_by?: string | null
          difficulty: string
          id?: string
          pricing_tier?: string | null
          subcategory_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string
          id?: string
          pricing_tier?: string | null
          subcategory_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          tier: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tier?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tier?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_design_problems: {
        Row: {
          created_at: string
          description: string
          design_image: string | null
          difficulty: string
          github_link: string | null
          id: string
          pricing_tier: string
          requirement_discussion: string | null
          slug: string
          solution: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          video_link: string | null
        }
        Insert: {
          created_at?: string
          description: string
          design_image?: string | null
          difficulty?: string
          github_link?: string | null
          id?: string
          pricing_tier?: string
          requirement_discussion?: string | null
          slug: string
          solution?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          video_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          design_image?: string | null
          difficulty?: string
          github_link?: string | null
          id?: string
          pricing_tier?: string
          requirement_discussion?: string | null
          slug?: string
          solution?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          video_link?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          status: string | null
          tier: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          tier?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          tier?: string | null
          user_id?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
