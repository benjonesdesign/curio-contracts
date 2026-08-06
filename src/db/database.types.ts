// AUTO-GENERATED — do not edit by hand.
//
// Source of truth: the Supabase schema for project `gldoykgslhhpuhjudyxl` (pokemon-tool's DB).
// Regenerate via `npm run gen:db` (wraps `supabase gen types typescript --project-id
// gldoykgslhhpuhjudyxl`), then re-run `npm run build` — the Swift structs in
// `Sources/CurioContracts/DBTypes.swift` are derived FROM this file in the same build step, so
// TS and Swift cannot diverge. See README.md "Releasing a new version".
//
// Scope: this is the SHARED subset both web and iOS consume — physical_cards, catalogue_cards,
// catalogue_sets, valuation_snapshots, profiles, scan_items, condition_assessments, audit_events.
// It is not a mirror of the full app schema (acquisitions, sales, purchases, etc. stay
// pokemon-tool-local — regenerate this file's table list if a consumer needs another one).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_events: {
        Row: {
          account_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          payload: Json
          user_agent: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          payload?: Json
          user_agent?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          payload?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      catalogue_cards: {
        Row: {
          attributes: string[]
          card_number: string | null
          created_at: string
          finishes: string[]
          game: string
          id: string
          image_ref: string | null
          is_promo: boolean
          language: string
          listing_desc_template: string | null
          listing_title_template: string | null
          name: string
          name_confidence: number | null
          native_catalogue_id: string | null
          normalized_name: string | null
          normalized_number: string | null
          rarity: string | null
          scryfall_id: string | null
          set_confidence: number | null
          set_name: string | null
          source: string | null
          tcg_id: string | null
          tcgplayer_id: string | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          attributes?: string[]
          card_number?: string | null
          created_at?: string
          finishes?: string[]
          game?: string
          id?: string
          image_ref?: string | null
          is_promo?: boolean
          language?: string
          listing_desc_template?: string | null
          listing_title_template?: string | null
          name: string
          name_confidence?: number | null
          native_catalogue_id?: string | null
          normalized_name?: string | null
          normalized_number?: string | null
          rarity?: string | null
          scryfall_id?: string | null
          set_confidence?: number | null
          set_name?: string | null
          source?: string | null
          tcg_id?: string | null
          tcgplayer_id?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          attributes?: string[]
          card_number?: string | null
          created_at?: string
          finishes?: string[]
          game?: string
          id?: string
          image_ref?: string | null
          is_promo?: boolean
          language?: string
          listing_desc_template?: string | null
          listing_title_template?: string | null
          name?: string
          name_confidence?: number | null
          native_catalogue_id?: string | null
          normalized_name?: string | null
          normalized_number?: string | null
          rarity?: string | null
          scryfall_id?: string | null
          set_confidence?: number | null
          set_name?: string | null
          source?: string | null
          tcg_id?: string | null
          tcgplayer_id?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      catalogue_sets: {
        Row: {
          card_count: number | null
          game: string
          id: string
          ingested_at: string
          set_code: string
          set_name: string
          source: string
        }
        Insert: {
          card_count?: number | null
          game: string
          id?: string
          ingested_at?: string
          set_code: string
          set_name: string
          source: string
        }
        Update: {
          card_count?: number | null
          game?: string
          id?: string
          ingested_at?: string
          set_code?: string
          set_name?: string
          source?: string
        }
        Relationships: []
      }
      condition_assessments: {
        Row: {
          assessment_version: number
          centering_ratios: Json | null
          confidence: string | null
          created_at: string
          defects: Json
          id: string
          image_quality: Json | null
          is_current: boolean
          model_version: string | null
          physical_card_id: string
          seller_confirmed_condition: string | null
          suggested_condition: string | null
        }
        Insert: {
          assessment_version?: number
          centering_ratios?: Json | null
          confidence?: string | null
          created_at?: string
          defects?: Json
          id?: string
          image_quality?: Json | null
          is_current?: boolean
          model_version?: string | null
          physical_card_id: string
          seller_confirmed_condition?: string | null
          suggested_condition?: string | null
        }
        Update: {
          assessment_version?: number
          centering_ratios?: Json | null
          confidence?: string | null
          created_at?: string
          defects?: Json
          id?: string
          image_quality?: Json | null
          is_current?: boolean
          model_version?: string | null
          physical_card_id?: string
          seller_confirmed_condition?: string | null
          suggested_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condition_assessments_physical_card_id_fkey"
            columns: ["physical_card_id"]
            isOneToOne: false
            referencedRelation: "physical_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_cards: {
        Row: {
          account_id: string
          acquisition_id: string | null
          allocation_channel: string | null
          allocation_ref_id: string | null
          attributes: string[]
          batch_position: number | null
          card_number: string | null
          catalogue_card_id: string | null
          cert_number: string | null
          cert_verified: boolean
          cm_trend_eur: number | null
          collection_type: string
          condition: string | null
          condition_source: string | null
          created_at: string
          decided_route: string | null
          ebay_listing_id: string | null
          ebay_offer_id: string | null
          ebay_price_avg: number | null
          ebay_price_low: number | null
          ebay_price_top: number | null
          fx_rate_eur_gbp: number | null
          fx_rate_usd_gbp: number | null
          game: string
          grade: string | null
          grading_company: string | null
          id: string
          id_verified_by_seller: boolean
          is_graded: boolean
          is_promo: boolean
          language: string
          legacy_card_id: string | null
          listing_description: string | null
          listing_title: string | null
          name: string | null
          name_confidence: number | null
          notes: string | null
          photo_thumb_urls: string[]
          photo_urls: string[]
          purchase_cost: number | null
          rarity: string | null
          sale_fees: number | null
          sale_platform: string | null
          sale_price: number | null
          scan_batch_id: string | null
          set_confidence: number | null
          set_name: string | null
          sku: string | null
          sold_at: string | null
          status: string
          storage_location: string | null
          suggested_price: number | null
          tcg_id: string | null
          tcp_market_usd: number | null
        }
        Insert: {
          account_id: string
          acquisition_id?: string | null
          allocation_channel?: string | null
          allocation_ref_id?: string | null
          attributes?: string[]
          batch_position?: number | null
          card_number?: string | null
          catalogue_card_id?: string | null
          cert_number?: string | null
          cert_verified?: boolean
          cm_trend_eur?: number | null
          collection_type?: string
          condition?: string | null
          condition_source?: string | null
          created_at?: string
          decided_route?: string | null
          ebay_listing_id?: string | null
          ebay_offer_id?: string | null
          ebay_price_avg?: number | null
          ebay_price_low?: number | null
          ebay_price_top?: number | null
          fx_rate_eur_gbp?: number | null
          fx_rate_usd_gbp?: number | null
          game?: string
          grade?: string | null
          grading_company?: string | null
          id?: string
          id_verified_by_seller?: boolean
          is_graded?: boolean
          is_promo?: boolean
          language?: string
          legacy_card_id?: string | null
          listing_description?: string | null
          listing_title?: string | null
          name?: string | null
          name_confidence?: number | null
          notes?: string | null
          photo_thumb_urls?: string[]
          photo_urls?: string[]
          purchase_cost?: number | null
          rarity?: string | null
          sale_fees?: number | null
          sale_platform?: string | null
          sale_price?: number | null
          scan_batch_id?: string | null
          set_confidence?: number | null
          set_name?: string | null
          sku?: string | null
          sold_at?: string | null
          status?: string
          storage_location?: string | null
          suggested_price?: number | null
          tcg_id?: string | null
          tcp_market_usd?: number | null
        }
        Update: {
          account_id?: string
          acquisition_id?: string | null
          allocation_channel?: string | null
          allocation_ref_id?: string | null
          attributes?: string[]
          batch_position?: number | null
          card_number?: string | null
          catalogue_card_id?: string | null
          cert_number?: string | null
          cert_verified?: boolean
          cm_trend_eur?: number | null
          collection_type?: string
          condition?: string | null
          condition_source?: string | null
          created_at?: string
          decided_route?: string | null
          ebay_listing_id?: string | null
          ebay_offer_id?: string | null
          ebay_price_avg?: number | null
          ebay_price_low?: number | null
          ebay_price_top?: number | null
          fx_rate_eur_gbp?: number | null
          fx_rate_usd_gbp?: number | null
          game?: string
          grade?: string | null
          grading_company?: string | null
          id?: string
          id_verified_by_seller?: boolean
          is_graded?: boolean
          is_promo?: boolean
          language?: string
          legacy_card_id?: string | null
          listing_description?: string | null
          listing_title?: string | null
          name?: string | null
          name_confidence?: number | null
          notes?: string | null
          photo_thumb_urls?: string[]
          photo_urls?: string[]
          purchase_cost?: number | null
          rarity?: string | null
          sale_fees?: number | null
          sale_platform?: string | null
          sale_price?: number | null
          scan_batch_id?: string | null
          set_confidence?: number | null
          set_name?: string | null
          sku?: string | null
          sold_at?: string | null
          status?: string
          storage_location?: string | null
          suggested_price?: number | null
          tcg_id?: string | null
          tcp_market_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_cards_acquisition_id_fkey"
            columns: ["acquisition_id"]
            isOneToOne: false
            referencedRelation: "acquisitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_cards_catalogue_card_id_fkey"
            columns: ["catalogue_card_id"]
            isOneToOne: false
            referencedRelation: "catalogue_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_cards_game_fkey"
            columns: ["game"]
            isOneToOne: false
            referencedRelation: "game_config"
            referencedColumns: ["game"]
          },
          {
            foreignKeyName: "physical_cards_legacy_card_id_fkey"
            columns: ["legacy_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_cards_scan_batch_id_fkey"
            columns: ["scan_batch_id"]
            isOneToOne: false
            referencedRelation: "scan_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aged_inventory_days: number
          created_at: string | null
          dispatch_address_city: string | null
          dispatch_address_country: string
          dispatch_address_line1: string | null
          dispatch_address_postcode: string | null
          id: string
          is_admin: boolean
          seller_type: string
          seller_type_source: string
        }
        Insert: {
          aged_inventory_days?: number
          created_at?: string | null
          dispatch_address_city?: string | null
          dispatch_address_country?: string
          dispatch_address_line1?: string | null
          dispatch_address_postcode?: string | null
          id: string
          is_admin?: boolean
          seller_type?: string
          seller_type_source?: string
        }
        Update: {
          aged_inventory_days?: number
          created_at?: string | null
          dispatch_address_city?: string | null
          dispatch_address_country?: string
          dispatch_address_line1?: string | null
          dispatch_address_postcode?: string | null
          id?: string
          is_admin?: boolean
          seller_type?: string
          seller_type_source?: string
        }
        Relationships: []
      }
      scan_items: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          physical_card_id: string | null
          public_url: string | null
          side: string | null
          sort_order: number
          status: string
          storage_path: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          physical_card_id?: string | null
          public_url?: string | null
          side?: string | null
          sort_order?: number
          status?: string
          storage_path: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          physical_card_id?: string | null
          public_url?: string | null
          side?: string | null
          sort_order?: number
          status?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "scan_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      valuation_snapshots: {
        Row: {
          cm_trend_eur: number | null
          confidence: string | null
          created_at: string
          ebay_avg_gbp: number | null
          ebay_low_gbp: number | null
          ebay_sale_count: number | null
          ebay_source: string | null
          ebay_top_gbp: number | null
          fx_date: string | null
          fx_eur_gbp: number | null
          fx_usd_gbp: number | null
          id: string
          is_current: boolean
          physical_card_id: string
          snapshot_version: number
          suggested_price_gbp: number | null
          tcp_market_usd: number | null
        }
        Insert: {
          cm_trend_eur?: number | null
          confidence?: string | null
          created_at?: string
          ebay_avg_gbp?: number | null
          ebay_low_gbp?: number | null
          ebay_sale_count?: number | null
          ebay_source?: string | null
          ebay_top_gbp?: number | null
          fx_date?: string | null
          fx_eur_gbp?: number | null
          fx_usd_gbp?: number | null
          id?: string
          is_current?: boolean
          physical_card_id: string
          snapshot_version?: number
          suggested_price_gbp?: number | null
          tcp_market_usd?: number | null
        }
        Update: {
          cm_trend_eur?: number | null
          confidence?: string | null
          created_at?: string
          ebay_avg_gbp?: number | null
          ebay_low_gbp?: number | null
          ebay_sale_count?: number | null
          ebay_source?: string | null
          ebay_top_gbp?: number | null
          fx_date?: string | null
          fx_eur_gbp?: number | null
          fx_usd_gbp?: number | null
          id?: string
          is_current?: boolean
          physical_card_id?: string
          snapshot_version?: number
          suggested_price_gbp?: number | null
          tcp_market_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valuation_snapshots_physical_card_id_fkey"
            columns: ["physical_card_id"]
            isOneToOne: false
            referencedRelation: "physical_cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
  }
}
