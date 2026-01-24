export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          category: string;
          content: string | null;
          created_at: string | null;
          excerpt: string | null;
          id: string;
          image_url: string | null;
          is_editor_pick: boolean | null;
          is_featured: boolean | null;
          section: string;
          slug: string;
          title: string;
          trending_rank: number | null;
        };
        Insert: {
          category: string;
          content?: string | null;
          created_at?: string | null;
          excerpt?: string | null;
          id?: string;
          image_url?: string | null;
          is_editor_pick?: boolean | null;
          is_featured?: boolean | null;
          section: string;
          slug: string;
          title: string;
          trending_rank?: number | null;
        };
        Update: {
          category?: string;
          content?: string | null;
          created_at?: string | null;
          excerpt?: string | null;
          id?: string;
          image_url?: string | null;
          is_editor_pick?: boolean | null;
          is_featured?: boolean | null;
          section?: string;
          slug?: string;
          title?: string;
          trending_rank?: number | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          place: string | null;
          date: string | null;
          event_link: string | null;
          banner_image_url: string | null;
          logo_image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          place?: string | null;
          date?: string | null;
          event_link?: string | null;
          banner_image_url?: string | null;
          logo_image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string | null;
          place?: string | null;
          date?: string | null;
          event_link?: string | null;
          banner_image_url?: string | null;
          logo_image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for accessing database types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
