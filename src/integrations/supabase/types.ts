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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          arquivada: boolean
          cor: string
          created_at: string
          id: string
          instituicao: string | null
          nome: string
          saldo_inicial: number
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivada?: boolean
          cor?: string
          created_at?: string
          id?: string
          instituicao?: string | null
          nome: string
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivada?: boolean
          cor?: string
          created_at?: string
          id?: string
          instituicao?: string | null
          nome?: string
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          papel: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          papel?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          papel?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          cor: string
          created_at: string
          icone: string | null
          id: string
          nome: string
          orcamento_mensal: number | null
          tipo: Database["public"]["Enums"]["category_kind"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          orcamento_mensal?: number | null
          tipo?: Database["public"]["Enums"]["category_kind"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          orcamento_mensal?: number | null
          tipo?: Database["public"]["Enums"]["category_kind"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          arquivado: boolean
          bandeira: string | null
          cor: string
          created_at: string
          dia_fechamento: number
          dia_vencimento: number
          id: string
          limite: number
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivado?: boolean
          bandeira?: string | null
          cor?: string
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          id?: string
          limite?: number
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivado?: boolean
          bandeira?: string | null
          cor?: string
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          id?: string
          limite?: number
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          ativo: boolean
          cartao_id: string | null
          categoria_id: string | null
          conta_id: string | null
          created_at: string
          dia_vencimento: number
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          cartao_id?: string | null
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string
          dia_vencimento?: number
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          ativo?: boolean
          cartao_id?: string | null
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string
          dia_vencimento?: number
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fixed_expenses_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_expenses_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_expenses_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          concluida: boolean
          cor: string
          created_at: string
          data_alvo: string | null
          id: string
          nome: string
          updated_at: string
          user_id: string
          valor_alvo: number
          valor_atual: number
        }
        Insert: {
          concluida?: boolean
          cor?: string
          created_at?: string
          data_alvo?: string | null
          id?: string
          nome: string
          updated_at?: string
          user_id: string
          valor_alvo: number
          valor_atual?: number
        }
        Update: {
          concluida?: boolean
          cor?: string
          created_at?: string
          data_alvo?: string | null
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
          valor_alvo?: number
          valor_atual?: number
        }
        Relationships: []
      }
      installments: {
        Row: {
          cartao_id: string | null
          categoria_id: string | null
          conta_id: string | null
          created_at: string
          data_inicio: string
          descricao: string
          id: string
          parcelas_pagas: number
          total_parcelas: number
          updated_at: string
          user_id: string
          valor_parcela: number
          valor_total: number
        }
        Insert: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_inicio?: string
          descricao: string
          id?: string
          parcelas_pagas?: number
          total_parcelas: number
          updated_at?: string
          user_id: string
          valor_parcela: number
          valor_total: number
        }
        Update: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_inicio?: string
          descricao?: string
          id?: string
          parcelas_pagas?: number
          total_parcelas?: number
          updated_at?: string
          user_id?: string
          valor_parcela?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "installments_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          meta_economia_mensal: number
          nome: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          meta_economia_mensal?: number
          nome?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_economia_mensal?: number
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          cartao_id: string | null
          categoria_id: string | null
          conta_destino_id: string | null
          conta_id: string | null
          created_at: string
          data: string
          descricao: string
          fixed_expense_id: string | null
          forma_pagamento: string
          id: string
          installment_id: string | null
          observacoes: string | null
          pago: boolean
          parcela_numero: number | null
          parcela_total: number | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_destino_id?: string | null
          conta_id?: string | null
          created_at?: string
          data?: string
          descricao: string
          fixed_expense_id?: string | null
          forma_pagamento?: string
          id?: string
          installment_id?: string | null
          observacoes?: string | null
          pago?: boolean
          parcela_numero?: number | null
          parcela_total?: number | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          cartao_id?: string | null
          categoria_id?: string | null
          conta_destino_id?: string | null
          conta_id?: string | null
          created_at?: string
          data?: string
          descricao?: string
          fixed_expense_id?: string | null
          forma_pagamento?: string
          id?: string
          installment_id?: string | null
          observacoes?: string | null
          pago?: boolean
          parcela_numero?: number | null
          parcela_total?: number | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_conta_destino_id_fkey"
            columns: ["conta_destino_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_kind: "receita" | "despesa"
      transaction_type:
        | "receita"
        | "despesa"
        | "transferencia"
        | "parcelamento"
        | "reembolso"
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
      category_kind: ["receita", "despesa"],
      transaction_type: [
        "receita",
        "despesa",
        "transferencia",
        "parcelamento",
        "reembolso",
      ],
    },
  },
} as const
