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
      batches: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          name: string
          section: string
          semester: number
          strength: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          name: string
          section?: string
          semester?: number
          strength?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          name?: string
          section?: string
          semester?: number
          strength?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credit_hours: number
          department_id: string | null
          id: string
          lab_hours: number
          lecture_hours: number
          name: string
          requires_lab: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credit_hours?: number
          department_id?: string | null
          id?: string
          lab_hours?: number
          lecture_hours?: number
          name: string
          requires_lab?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credit_hours?: number
          department_id?: string | null
          id?: string
          lab_hours?: number
          lecture_hours?: number
          name?: string
          requires_lab?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          room_id: string | null
          start_time: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_date: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          room_id?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          room_id?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          created_at: string
          current_load: number | null
          department_id: string | null
          email: string | null
          id: string
          max_hours_per_day: number
          max_hours_per_week: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_load?: number | null
          department_id?: string | null
          email?: string | null
          id?: string
          max_hours_per_day?: number
          max_hours_per_week?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_load?: number | null
          department_id?: string | null
          email?: string | null
          id?: string
          max_hours_per_day?: number
          max_hours_per_week?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_preferences: {
        Row: {
          created_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          faculty_id: string
          id: string
          preference: number
          time_slot_id: string
        }
        Insert: {
          created_at?: string
          day: Database["public"]["Enums"]["day_of_week"]
          faculty_id: string
          id?: string
          preference?: number
          time_slot_id: string
        }
        Update: {
          created_at?: string
          day?: Database["public"]["Enums"]["day_of_week"]
          faculty_id?: string
          id?: string
          preference?: number
          time_slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_preferences_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_preferences_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batch_id: string | null
          created_at: string
          department_id: string | null
          display_name: string | null
          faculty_code: string | null
          id: string
          student_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          batch_id?: string | null
          created_at?: string
          department_id?: string | null
          display_name?: string | null
          faculty_code?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          batch_id?: string | null
          created_at?: string
          department_id?: string | null
          display_name?: string | null
          faculty_code?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number
          created_at: string
          floor: number | null
          has_projector: boolean
          id: string
          name: string
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          building?: string | null
          capacity?: number
          created_at?: string
          floor?: number | null
          has_projector?: boolean
          id?: string
          name: string
          room_type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          building?: string | null
          capacity?: number
          created_at?: string
          floor?: number | null
          has_projector?: boolean
          id?: string
          name?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      schedule_entries: {
        Row: {
          created_at: string
          day: Database["public"]["Enums"]["day_of_week"]
          id: string
          room_id: string
          schedule_id: string
          teaching_assignment_id: string
          time_slot_id: string
        }
        Insert: {
          created_at?: string
          day: Database["public"]["Enums"]["day_of_week"]
          id?: string
          room_id: string
          schedule_id: string
          teaching_assignment_id: string
          time_slot_id: string
        }
        Update: {
          created_at?: string
          day?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          room_id?: string
          schedule_id?: string
          teaching_assignment_id?: string
          time_slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_teaching_assignment_id_fkey"
            columns: ["teaching_assignment_id"]
            isOneToOne: false
            referencedRelation: "teaching_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          fitness_score: number | null
          generation_count: number | null
          hard_constraint_violations: number | null
          id: string
          mutation_rate: number | null
          name: string
          population_size: number | null
          soft_constraint_score: number | null
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          fitness_score?: number | null
          generation_count?: number | null
          hard_constraint_violations?: number | null
          id?: string
          mutation_rate?: number | null
          name: string
          population_size?: number | null
          soft_constraint_score?: number | null
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          fitness_score?: number | null
          generation_count?: number | null
          hard_constraint_violations?: number | null
          id?: string
          mutation_rate?: number | null
          name?: string
          population_size?: number | null
          soft_constraint_score?: number | null
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Relationships: []
      }
      teaching_assignments: {
        Row: {
          batch_id: string
          course_id: string
          created_at: string
          faculty_id: string
          id: string
          is_lab: boolean
        }
        Insert: {
          batch_id: string
          course_id: string
          created_at?: string
          faculty_id: string
          id?: string
          is_lab?: boolean
        }
        Update: {
          batch_id?: string
          course_id?: string
          created_at?: string
          faculty_id?: string
          id?: string
          is_lab?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "teaching_assignments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teaching_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teaching_assignments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_break: boolean
          label: string
          slot_order: number
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_break?: boolean
          label: string
          slot_order: number
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_break?: boolean
          label?: string
          slot_order?: number
          start_time?: string
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
      check_schedule_conflicts: {
        Args: { p_schedule_id: string }
        Returns: {
          conflict_type: string
          day: string
          entity_name: string
          entry_count: number
          time_slot_label: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "viewer" | "faculty" | "student"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
      event_type: "exam" | "seminar" | "workshop" | "meeting" | "other"
      room_type: "classroom" | "lab" | "auditorium"
      schedule_status: "draft" | "published" | "archived"
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
      app_role: ["admin", "viewer", "faculty", "student"],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      event_type: ["exam", "seminar", "workshop", "meeting", "other"],
      room_type: ["classroom", "lab", "auditorium"],
      schedule_status: ["draft", "published", "archived"],
    },
  },
} as const
