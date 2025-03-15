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
      certificates: {
        Row: {
          certificate_id: string
          course_id: string
          id: string
          issue_date: string
          user_id: string
        }
        Insert: {
          certificate_id: string
          course_id: string
          id?: string
          issue_date?: string
          user_id: string
        }
        Update: {
          certificate_id?: string
          course_id?: string
          id?: string
          issue_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_tests: {
        Row: {
          chapter_id: string
          correct_answer: number
          created_at: string | null
          id: string
          options: Json
          question: string
          updated_at: string | null
        }
        Insert: {
          chapter_id: string
          correct_answer: number
          created_at?: string | null
          id?: string
          options: Json
          question: string
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string
          correct_answer?: number
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_tests_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_test_questions: {
        Row: {
          correct_answer: number
          course_test_id: string | null
          created_at: string | null
          id: string
          options: Json
          points: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          correct_answer: number
          course_test_id?: string | null
          created_at?: string | null
          id?: string
          options: Json
          points?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: number
          course_test_id?: string | null
          created_at?: string | null
          id?: string
          options?: Json
          points?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_test_questions_course_test_id_fkey"
            columns: ["course_test_id"]
            isOneToOne: false
            referencedRelation: "course_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tests: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          passing_score: number | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          passing_score?: number | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          passing_score?: number | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_tests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string
          discount_price: number | null
          duration: string
          full_description: string | null
          id: string
          instructor: string
          is_featured: boolean
          is_premium: boolean
          level: string
          objectives: string[] | null
          price: number | null
          requirements: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          discount_price?: number | null
          duration: string
          full_description?: string | null
          id?: string
          instructor: string
          is_featured?: boolean
          is_premium?: boolean
          level: string
          objectives?: string[] | null
          price?: number | null
          requirements?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          discount_price?: number | null
          duration?: string
          full_description?: string | null
          id?: string
          instructor?: string
          is_featured?: boolean
          is_premium?: boolean
          level?: string
          objectives?: string[] | null
          price?: number | null
          requirements?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          chapter_id: string
          content: string
          course_id: string
          created_at: string
          duration: string
          id: string
          is_premium: boolean
          order_index: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          content: string
          course_id: string
          created_at?: string
          duration: string
          id?: string
          is_premium?: boolean
          order_index: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          content?: string
          course_id?: string
          created_at?: string
          duration?: string
          id?: string
          is_premium?: boolean
          order_index?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_vip: boolean | null
          last_name: string | null
          updated_at: string
          vip_expiration_date: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_vip?: boolean | null
          last_name?: string | null
          updated_at?: string
          vip_expiration_date?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_vip?: boolean | null
          last_name?: string | null
          updated_at?: string
          vip_expiration_date?: string | null
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          course_id: string
          enrolled_at: string
          has_paid: boolean
          id: string
          last_accessed: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_id: string | null
          progress_percentage: number
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          has_paid?: boolean
          id?: string
          last_accessed?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_id?: string | null
          progress_percentage?: number
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          has_paid?: boolean
          id?: string
          last_accessed?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_id?: string | null
          progress_percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          last_position: string | null
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          last_position?: string | null
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          last_position?: string | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_test_results: {
        Row: {
          answers: Json | null
          chapter_id: string | null
          course_id: string | null
          course_test_id: string | null
          created_at: string | null
          id: string
          passed: boolean
          score: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          chapter_id?: string | null
          course_id?: string | null
          course_test_id?: string | null
          created_at?: string | null
          id?: string
          passed: boolean
          score: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          chapter_id?: string | null
          course_id?: string | null
          course_test_id?: string | null
          created_at?: string | null
          id?: string
          passed?: boolean
          score?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_test_results_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_test_results_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_test_results_course_test_id_fkey"
            columns: ["course_test_id"]
            isOneToOne: false
            referencedRelation: "course_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_purchases: {
        Row: {
          activation_date: string | null
          amount: number
          id: string
          plan_type: string
          purchase_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          activation_date?: string | null
          amount: number
          id?: string
          plan_type: string
          purchase_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          activation_date?: string | null
          amount?: number
          id?: string
          plan_type?: string
          purchase_date?: string | null
          status?: string | null
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
