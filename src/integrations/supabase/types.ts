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
      alertas_estoque: {
        Row: {
          categoria: string
          cor: string | null
          created_at: string
          id: string
          material_acessorio: string
          quantidade_minima: number
          tipo: string
          tipo_acessorio: string
          variacao_acessorio: string
        }
        Insert: {
          categoria: string
          cor?: string | null
          created_at?: string
          id?: string
          material_acessorio?: string
          quantidade_minima?: number
          tipo?: string
          tipo_acessorio?: string
          variacao_acessorio?: string
        }
        Update: {
          categoria?: string
          cor?: string | null
          created_at?: string
          id?: string
          material_acessorio?: string
          quantidade_minima?: number
          tipo?: string
          tipo_acessorio?: string
          variacao_acessorio?: string
        }
        Relationships: []
      }
      caixa_movimentacoes: {
        Row: {
          caixa_id: string
          created_at: string
          descricao: string
          forma_pagamento: string
          id: string
          tipo: string
          usuario_id: string
          usuario_nome: string
          valor: number
          venda_id: string | null
        }
        Insert: {
          caixa_id: string
          created_at?: string
          descricao?: string
          forma_pagamento?: string
          id?: string
          tipo: string
          usuario_id: string
          usuario_nome?: string
          valor?: number
          venda_id?: string | null
        }
        Update: {
          caixa_id?: string
          created_at?: string
          descricao?: string
          forma_pagamento?: string
          id?: string
          tipo?: string
          usuario_id?: string
          usuario_nome?: string
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caixa_movimentacoes_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_movimentacoes_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      caixas: {
        Row: {
          aberto_em: string
          created_at: string
          diferenca: number | null
          fechado_em: string | null
          filial_id: string
          id: string
          observacoes_fechamento: string | null
          status: string
          usuario_abertura_id: string
          usuario_abertura_nome: string
          usuario_fechamento_id: string | null
          usuario_fechamento_nome: string | null
          valor_abertura: number
          valor_fechamento_esperado: number | null
          valor_fechamento_informado: number | null
        }
        Insert: {
          aberto_em?: string
          created_at?: string
          diferenca?: number | null
          fechado_em?: string | null
          filial_id?: string
          id?: string
          observacoes_fechamento?: string | null
          status?: string
          usuario_abertura_id: string
          usuario_abertura_nome?: string
          usuario_fechamento_id?: string | null
          usuario_fechamento_nome?: string | null
          valor_abertura?: number
          valor_fechamento_esperado?: number | null
          valor_fechamento_informado?: number | null
        }
        Update: {
          aberto_em?: string
          created_at?: string
          diferenca?: number | null
          fechado_em?: string | null
          filial_id?: string
          id?: string
          observacoes_fechamento?: string | null
          status?: string
          usuario_abertura_id?: string
          usuario_abertura_nome?: string
          usuario_fechamento_id?: string | null
          usuario_fechamento_nome?: string | null
          valor_abertura?: number
          valor_fechamento_esperado?: number | null
          valor_fechamento_informado?: number | null
        }
        Relationships: []
      }
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
          inscricao_estadual: string
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
          inscricao_estadual?: string
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
          inscricao_estadual?: string
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
      empresas: {
        Row: {
          ambiente: string
          ativa: boolean
          bairro: string
          celular: string
          cep: string
          cidade: string
          cnae: string
          cnpj: string
          codigo_ibge: string
          codigo_municipio: string
          created_at: string
          email: string
          endereco: string
          estado: string
          filial_padrao: boolean
          id: string
          inscricao_estadual: string
          nome_fantasia: string
          numero: string
          razao_social: string
          regime_tributario: string
          serie_nf: string
          telefone: string
        }
        Insert: {
          ambiente?: string
          ativa?: boolean
          bairro?: string
          celular?: string
          cep?: string
          cidade?: string
          cnae?: string
          cnpj: string
          codigo_ibge?: string
          codigo_municipio?: string
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          filial_padrao?: boolean
          id?: string
          inscricao_estadual?: string
          nome_fantasia?: string
          numero?: string
          razao_social: string
          regime_tributario?: string
          serie_nf?: string
          telefone?: string
        }
        Update: {
          ambiente?: string
          ativa?: boolean
          bairro?: string
          celular?: string
          cep?: string
          cidade?: string
          cnae?: string
          cnpj?: string
          codigo_ibge?: string
          codigo_municipio?: string
          created_at?: string
          email?: string
          endereco?: string
          estado?: string
          filial_padrao?: boolean
          id?: string
          inscricao_estadual?: string
          nome_fantasia?: string
          numero?: string
          razao_social?: string
          regime_tributario?: string
          serie_nf?: string
          telefone?: string
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
      funcionarios_auth: {
        Row: {
          cargo: string | null
          codigo_acesso: string
          created_at: string | null
          filial_id: string | null
          id: string
          nome: string
          status: string | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          cargo?: string | null
          codigo_acesso: string
          created_at?: string | null
          filial_id?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          cargo?: string | null
          codigo_acesso?: string
          created_at?: string | null
          filial_id?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          module: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          altura_lente: number
          barcode: string
          bridge_size: number
          categoria_acessorio: string
          categoria_idade: string
          category: string
          code: string
          color: string
          cor_acessorio: string
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
          material_acessorio: string
          material_aro: string
          material_haste: string
          min_stock: number
          model: string
          ncm: string
          referencia: string
          retail_price: number
          status: string
          stock: number
          subcategoria_acessorio: string
          temple_size: number
          tipo_acessorio: string
          tipo_lente: string
          tipo_produto_id: string | null
          variacao_acessorio: string
          wholesale_min_qty: number
          wholesale_price: number
        }
        Insert: {
          altura_lente?: number
          barcode?: string
          bridge_size?: number
          categoria_acessorio?: string
          categoria_idade?: string
          category?: string
          code: string
          color?: string
          cor_acessorio?: string
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
          material_acessorio?: string
          material_aro?: string
          material_haste?: string
          min_stock?: number
          model: string
          ncm?: string
          referencia?: string
          retail_price?: number
          status?: string
          stock?: number
          subcategoria_acessorio?: string
          temple_size?: number
          tipo_acessorio?: string
          tipo_lente?: string
          tipo_produto_id?: string | null
          variacao_acessorio?: string
          wholesale_min_qty?: number
          wholesale_price?: number
        }
        Update: {
          altura_lente?: number
          barcode?: string
          bridge_size?: number
          categoria_acessorio?: string
          categoria_idade?: string
          category?: string
          code?: string
          color?: string
          cor_acessorio?: string
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
          material_acessorio?: string
          material_aro?: string
          material_haste?: string
          min_stock?: number
          model?: string
          ncm?: string
          referencia?: string
          retail_price?: number
          status?: string
          stock?: number
          subcategoria_acessorio?: string
          temple_size?: number
          tipo_acessorio?: string
          tipo_lente?: string
          tipo_produto_id?: string | null
          variacao_acessorio?: string
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
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          email?: string
          id: string
          nome?: string
          tipo?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
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
      get_profiles_count: { Args: never; Returns: number }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: string
          module: string
        }[]
      }
      has_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
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
