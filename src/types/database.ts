export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          country: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          created_at?: string
        }
      }
      bottles: {
        Row: {
          id: string
          user_id: string
          brand_id: string | null
          name: string
          type: string | null
          age: number | null
          abv: number | null
          purchase_price: number | null
          market_price: number | null
          discount_rate: number | null
          purchase_date: string | null
          purchase_location: string | null
          total_amount: number
          remaining_amount: number
          is_opened: boolean
          opened_date: string | null
          vintage: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_id?: string | null
          name: string
          type?: string | null
          age?: number | null
          abv?: number | null
          purchase_price?: number | null
          market_price?: number | null
          discount_rate?: number | null
          purchase_date?: string | null
          purchase_location?: string | null
          total_amount: number
          remaining_amount: number
          is_opened?: boolean
          opened_date?: string | null
          vintage?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string | null
          name?: string
          type?: string | null
          age?: number | null
          abv?: number | null
          purchase_price?: number | null
          market_price?: number | null
          discount_rate?: number | null
          purchase_date?: string | null
          purchase_location?: string | null
          total_amount?: number
          remaining_amount?: number
          is_opened?: boolean
          opened_date?: string | null
          vintage?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tastings: {
        Row: {
          id: string
          bottle_id: string
          user_id: string
          tasting_date: string
          tasting_time: string | null
          location: string | null
          companions: string | null
          nose_notes: string | null
          palate_notes: string | null
          finish_notes: string | null
          nose_rating: number | null
          palate_rating: number | null
          finish_rating: number | null
          overall_rating: number | null
          consumed_amount: number
          remaining_amount: number
          mood: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bottle_id: string
          user_id: string
          tasting_date: string
          tasting_time?: string | null
          location?: string | null
          companions?: string | null
          nose_notes?: string | null
          palate_notes?: string | null
          finish_notes?: string | null
          nose_rating?: number | null
          palate_rating?: number | null
          finish_rating?: number | null
          overall_rating?: number | null
          consumed_amount: number
          remaining_amount: number
          mood?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bottle_id?: string
          user_id?: string
          tasting_date?: string
          tasting_time?: string | null
          location?: string | null
          companions?: string | null
          nose_notes?: string | null
          palate_notes?: string | null
          finish_notes?: string | null
          nose_rating?: number | null
          palate_rating?: number | null
          finish_rating?: number | null
          overall_rating?: number | null
          consumed_amount?: number
          remaining_amount?: number
          mood?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      consumption_logs: {
        Row: {
          id: string
          bottle_id: string
          user_id: string
          consumed_amount: number
          remaining_amount: number
          consumed_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bottle_id: string
          user_id: string
          consumed_amount: number
          remaining_amount: number
          consumed_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bottle_id?: string
          user_id?: string
          consumed_amount?: number
          remaining_amount?: number
          consumed_date?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
} 