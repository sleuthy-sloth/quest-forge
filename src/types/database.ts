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
      api_usage: {
        Row: {
          date: string
          id: string
          last_updated: string
          request_count: number
        }
        Insert: {
          date: string
          id?: string
          last_updated?: string
          request_count?: number
        }
        Update: {
          date?: string
          id?: string
          last_updated?: string
          request_count?: number
        }
        Relationships: []
      }
      chore_completions: {
        Row: {
          chore_id: string
          completed_at: string
          gold_awarded: number
          household_id: string
          id: string
          player_id: string
          verified: boolean
          verified_at: string | null
          xp_awarded: number
        }
        Insert: {
          chore_id: string
          completed_at?: string
          gold_awarded?: number
          household_id: string
          id?: string
          player_id: string
          verified?: boolean
          verified_at?: string | null
          xp_awarded?: number
        }
        Update: {
          chore_id?: string
          completed_at?: string
          gold_awarded?: number
          household_id?: string
          id?: string
          player_id?: string
          verified?: boolean
          verified_at?: string | null
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "chore_completions_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_completions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_completions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_type"]
          gold_reward: number
          household_id: string
          id: string
          is_active: boolean
          quest_flavor_text: string
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          title: string
          xp_reward: number
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string
          difficulty: Database["public"]["Enums"]["difficulty_type"]
          gold_reward?: number
          household_id: string
          id?: string
          is_active?: boolean
          quest_flavor_text?: string
          recurrence: Database["public"]["Enums"]["recurrence_type"]
          title: string
          xp_reward: number
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_type"]
          gold_reward?: number
          household_id?: string
          id?: string
          is_active?: boolean
          quest_flavor_text?: string
          recurrence?: Database["public"]["Enums"]["recurrence_type"]
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "chores_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chores_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      edu_challenges: {
        Row: {
          age_tier: Database["public"]["Enums"]["age_tier_type"]
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          content: Json
          difficulty: number
          id: string
          is_active: boolean
          subject: Database["public"]["Enums"]["subject_type"]
          title: string
          xp_reward: number
        }
        Insert: {
          age_tier: Database["public"]["Enums"]["age_tier_type"]
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          content?: Json
          difficulty: number
          id?: string
          is_active?: boolean
          subject: Database["public"]["Enums"]["subject_type"]
          title: string
          xp_reward: number
        }
        Update: {
          age_tier?: Database["public"]["Enums"]["age_tier_type"]
          challenge_type?: Database["public"]["Enums"]["challenge_type"]
          content?: Json
          difficulty?: number
          id?: string
          is_active?: boolean
          subject?: Database["public"]["Enums"]["subject_type"]
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      edu_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          household_id: string
          id: string
          player_id: string
          score: number
          xp_awarded: number
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          household_id: string
          id?: string
          player_id: string
          score: number
          xp_awarded?: number
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          household_id?: string
          id?: string
          player_id?: string
          score?: number
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "edu_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "edu_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edu_completions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edu_completions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          settings: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          settings?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          settings?: Json
        }
        Relationships: []
      }
      inventory: {
        Row: {
          acquired_at: string
          description: string
          equipped: boolean
          household_id: string
          id: string
          item_name: string
          item_type: Database["public"]["Enums"]["item_type"]
          player_id: string
          sprite_layer: Json | null
        }
        Insert: {
          acquired_at?: string
          description?: string
          equipped?: boolean
          household_id: string
          id?: string
          item_name: string
          item_type: Database["public"]["Enums"]["item_type"]
          player_id: string
          sprite_layer?: Json | null
        }
        Update: {
          acquired_at?: string
          description?: string
          equipped?: boolean
          household_id?: string
          id?: string
          item_name?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          player_id?: string
          sprite_layer?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loot_store_items: {
        Row: {
          category: Database["public"]["Enums"]["loot_category"]
          cost_gold: number
          cost_xp: number
          created_by: string
          description: string
          flavor_text: string
          household_id: string
          id: string
          is_available: boolean
          name: string
          real_reward_description: string
          sprite_icon: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["loot_category"]
          cost_gold?: number
          cost_xp?: number
          created_by: string
          description?: string
          flavor_text?: string
          household_id: string
          id?: string
          is_available?: boolean
          name: string
          real_reward_description?: string
          sprite_icon?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["loot_category"]
          cost_gold?: number
          cost_xp?: number
          created_by?: string
          description?: string
          flavor_text?: string
          household_id?: string
          id?: string
          is_available?: boolean
          name?: string
          real_reward_description?: string
          sprite_icon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loot_store_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_store_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      player_inventory: {
        Row: {
          acquired_at: string
          id: string
          is_used: boolean
          player_id: string
          reward_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          is_used?: boolean
          player_id: string
          reward_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          is_used?: boolean
          player_id?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_inventory_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_inventory_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_class: string | null
          avatar_config: Json
          created_at: string
          display_name: string
          gold: number
          household_id: string
          id: string
          level: number
          role: Database["public"]["Enums"]["user_role"]
          story_chapter: number
          username: string
          xp_available: number
          xp_total: number
        }
        Insert: {
          age?: number | null
          avatar_class?: string | null
          avatar_config?: Json
          created_at?: string
          display_name: string
          gold?: number
          household_id: string
          id: string
          level?: number
          role: Database["public"]["Enums"]["user_role"]
          story_chapter?: number
          username: string
          xp_available?: number
          xp_total?: number
        }
        Update: {
          age?: number | null
          avatar_class?: string | null
          avatar_config?: Json
          created_at?: string
          display_name?: string
          gold?: number
          household_id?: string
          id?: string
          level?: number
          role?: Database["public"]["Enums"]["user_role"]
          story_chapter?: number
          username?: string
          xp_available?: number
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          household_id: string
          id: string
          item_id: string
          player_id: string
          purchased_at: string
          redeemed: boolean
          redeemed_at: string | null
        }
        Insert: {
          household_id: string
          id?: string
          item_id: string
          player_id: string
          purchased_at?: string
          redeemed?: boolean
          redeemed_at?: string | null
        }
        Update: {
          household_id?: string
          id?: string
          item_id?: string
          player_id?: string
          purchased_at?: string
          redeemed?: boolean
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "loot_store_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          cost: number
          created_at: string
          description: string
          household_id: string
          icon_type: string
          id: string
          title: string
        }
        Insert: {
          cost: number
          created_at?: string
          description?: string
          household_id: string
          icon_type?: string
          id?: string
          title: string
        }
        Update: {
          cost?: number
          created_at?: string
          description?: string
          household_id?: string
          icon_type?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      story_chapters: {
        Row: {
          boss_current_hp: number
          boss_description: string | null
          boss_hp: number
          boss_name: string | null
          boss_sprite_config: Json | null
          chapter_number: number
          household_id: string
          id: string
          is_unlocked: boolean
          narrative_text: string
          rewards_claimed: boolean
          title: string
          week_number: number
          xp_threshold_to_unlock: number
        }
        Insert: {
          boss_current_hp?: number
          boss_description?: string | null
          boss_hp?: number
          boss_name?: string | null
          boss_sprite_config?: Json | null
          chapter_number: number
          household_id: string
          id?: string
          is_unlocked?: boolean
          narrative_text?: string
          rewards_claimed?: boolean
          title?: string
          week_number: number
          xp_threshold_to_unlock?: number
        }
        Update: {
          boss_current_hp?: number
          boss_description?: string | null
          boss_hp?: number
          boss_name?: string | null
          boss_sprite_config?: Json | null
          chapter_number?: number
          household_id?: string
          id?: string
          is_unlocked?: boolean
          narrative_text?: string
          rewards_claimed?: boolean
          title?: string
          week_number?: number
          xp_threshold_to_unlock?: number
        }
        Relationships: [
          {
            foreignKeyName: "story_chapters_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      story_progress: {
        Row: {
          chapter_id: string
          contribution_xp: number
          household_id: string
          id: string
          player_id: string
          unlocked_at: string | null
        }
        Insert: {
          chapter_id: string
          contribution_xp?: number
          household_id: string
          id?: string
          player_id: string
          unlocked_at?: string | null
        }
        Update: {
          chapter_id?: string
          contribution_xp?: number
          household_id?: string
          id?: string
          player_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "story_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_progress_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          assigned_to: string | null
          boss_current_health: number | null
          boss_health: number | null
          boss_sprite: string | null
          created_at: string
          created_by: string
          description: string
          difficulty: string
          gold_reward: number
          household_id: string
          id: string
          is_active: boolean
          is_boss: boolean
          title: string
          xp_reward: number
        }
        Insert: {
          assigned_to?: string | null
          boss_current_health?: number | null
          boss_health?: number | null
          boss_sprite?: string | null
          created_at?: string
          created_by: string
          description?: string
          difficulty?: string
          gold_reward?: number
          household_id: string
          id?: string
          is_active?: boolean
          is_boss?: boolean
          title: string
          xp_reward: number
        }
        Update: {
          assigned_to?: string | null
          boss_current_health?: number | null
          boss_health?: number | null
          boss_sprite?: string | null
          created_at?: string
          created_by?: string
          description?: string
          difficulty?: string
          gold_reward?: number
          household_id?: string
          id?: string
          is_active?: boolean
          is_boss?: boolean
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quests_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          approved_at: string | null
          created_at: string
          household_id: string
          id: string
          player_id: string
          reward_id: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          household_id: string
          id?: string
          player_id: string
          reward_id: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          household_id?: string
          id?: string
          player_id?: string
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deal_boss_damage: {
        Args: { p_chapter_id: string; p_damage: number }
        Returns: number
      }
      deduct_gold: { Args: { p_player_id: string; p_amount: number }; Returns: boolean }
      get_my_household_id: { Args: never; Returns: string }
      is_gm: { Args: { hid: string }; Returns: boolean }
    }
    Enums: {
      age_tier_type: "junior" | "senior"
      challenge_type:
        | "quiz"
        | "puzzle"
        | "word_game"
        | "math_drill"
        | "ai_generated"
      difficulty_type: "easy" | "medium" | "hard" | "epic"
      item_type: "weapon" | "armor" | "accessory" | "consumable" | "cosmetic"
      loot_category: "real_reward" | "cosmetic" | "power_up" | "story_unlock"
      recurrence_type: "once" | "daily" | "weekly" | "monthly"
      subject_type:
        | "math"
        | "reading"
        | "science"
        | "history"
        | "vocabulary"
        | "logic"
      user_role: "gm" | "player"
      redemption_status: "pending" | "approved" | "redeemed"
      reward_type: "digital" | "real_world"
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
      age_tier_type: ["junior", "senior"],
      challenge_type: [
        "quiz",
        "puzzle",
        "word_game",
        "math_drill",
        "ai_generated",
      ],
      difficulty_type: ["easy", "medium", "hard", "epic"],
      item_type: ["weapon", "armor", "accessory", "consumable", "cosmetic"],
      loot_category: ["real_reward", "cosmetic", "power_up", "story_unlock"],
      recurrence_type: ["once", "daily", "weekly", "monthly"],
      subject_type: [
        "math",
        "reading",
        "science",
        "history",
        "vocabulary",
        "logic",
      ],
      user_role: ["gm", "player"],
      redemption_status: ["pending", "approved", "redeemed"],
      reward_type: ["digital", "real_world"],
    },
  },
} as const
