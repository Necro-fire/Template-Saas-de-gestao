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
      clientes: {
        Row: {
          city: string
          cnpj: string
          created_at: string
          credit_limit: number
          data_nascimento: string | null
          email: string
          endereco: string
          filial_id: string
          id: string
          observacoes: string
          phone: string
          responsible_name: string
          state: string
          status: string
          store_name: string
          tipo_cliente: string
          whatsapp: string
        }
        Insert: {
          city?: string
          cnpj?: string
          created_at?: string
          credit_limit?: number
          data_nascimento?: string | null
          email?: string
          endereco?: string
          filial_id?: string
          id?: string
          observacoes?: string
          phone?: string
          responsible_name: string
          state?: string
          status?: string
          store_name: string
          tipo_cliente?: string
          whatsapp?: string
        }
        Update: {
          city?: string
          cnpj?: string
          created_at?: string
          credit_limit?: number
          data_nascimento?: string | null
          email?: string
          endereco?: string
          filial_id?: string
          id?: string
          observacoes?: string
          phone?: string
          responsible_name?: string
          state?: string
          status?: string
          store_name?: string
          tipo_cliente?: string
          whatsapp?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          filial_id: string
          id: string
          produto_id: string
          quantidade: number
        }
        Insert: {
          created_at?: string
          filial_id?: string
          id?: string
          produto_id: string
          quantidade?: number
        }
        Update: {
          created_at?: string
          filial_id?: string
          id?: string
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          altura_lente: number
          barcode: string
          bridge_size: number
          categoria_idade: string
          category: string
          code: string
          color: string
          cor_armacao: string
          created_at: string
          description: string
          estilo: string
          filial_id: string
          genero: string
          hash_produto: string
          id: string
          image_url: string
          is_acessorio: boolean
          lens_size: number
          material: string
          material_aro: string
          material_haste: string
          min_stock: number
          model: string
          referencia: string
          retail_price: number
          status: string
          stock: number
          subcategoria_acessorio: string
          temple_size: number
          tipo_lente: string
          tipo_produto_id: string | null
          wholesale_min_qty: number
          wholesale_price: number
        }
        Insert: {
          altura_lente?: number
          barcode?: string
          bridge_size?: number
          categoria_idade?: string
          category?: string
          code: string
          color?: string
          cor_armacao?: string
          created_at?: string
          description?: string
          estilo?: string
          filial_id?: string
          genero?: string
          hash_produto?: string
          id?: string
          image_url?: string
          is_acessorio?: boolean
          lens_size?: number
          material?: string
          material_aro?: string
          material_haste?: string
          min_stock?: number
          model: string
          referencia?: string
          retail_price?: number
          status?: string
          stock?: number
          subcategoria_acessorio?: string
          temple_size?: number
          tipo_lente?: string
          tipo_produto_id?: string | null
          wholesale_min_qty?: number
          wholesale_price?: number
        }
        Update: {
          altura_lente?: number
          barcode?: string
          bridge_size?: number
          categoria_idade?: string
          category?: string
          code?: string
          color?: string
          cor_armacao?: string
          created_at?: string
          description?: string
          estilo?: string
          filial_id?: string
          genero?: string
          hash_produto?: string
          id?: string
          image_url?: string
          is_acessorio?: boolean
          lens_size?: number
          material?: string
          material_aro?: string
          material_haste?: string
          min_stock?: number
          model?: string
          referencia?: string
          retail_price?: number
          status?: string
          stock?: number
          subcategoria_acessorio?: string
          temple_size?: number
          tipo_lente?: string
          tipo_produto_id?: string | null
          wholesale_min_qty?: number
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_tipo_produto_id_fkey"
            columns: ["tipo_produto_id"]
            isOneToOne: false
            referencedRelation: "tipos_produto"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_produto: {
        Row: {
          created_at: string
          estoque_minimo_alerta: number
          id: string
          nome_tipo: string
        }
        Insert: {
          created_at?: string
          estoque_minimo_alerta?: number
          id?: string
          nome_tipo: string
        }
        Update: {
          created_at?: string
          estoque_minimo_alerta?: number
          id?: string
          nome_tipo?: string
        }
        Relationships: []
      }
      venda_items: {
        Row: {
          id: string
          product_code: string
          product_model: string
          produto_id: string
          quantity: number
          total: number
          unit_price: number
          venda_id: string
        }
        Insert: {
          id?: string
          product_code?: string
          product_model?: string
          produto_id: string
          quantity?: number
          total?: number
          unit_price?: number
          venda_id: string
        }
        Update: {
          id?: string
          product_code?: string
          product_model?: string
          produto_id?: string
          quantity?: number
          total?: number
          unit_price?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_items_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_items_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string
          discount: number
          filial_id: string
          id: string
          number: number
          origin: string
          payment_method: string
          seller_name: string
          total: number
        }
        Insert: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          discount?: number
          filial_id?: string
          id?: string
          number?: number
          origin?: string
          payment_method?: string
          seller_name?: string
          total?: number
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string
          discount?: number
          filial_id?: string
          id?: string
          number?: number
          origin?: string
          payment_method?: string
          seller_name?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_product_codes: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
