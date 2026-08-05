import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type CreditCard = Tables<"credit_cards">;
export type Transaction = Tables<"transactions">;
export type FixedExpense = Tables<"fixed_expenses">;
export type Installment = Tables<"installments">;
export type Goal = Tables<"goals">;
export type Profile = Tables<"profiles">;

export type TransactionType = Transaction["tipo"];

export const TIPO_LABEL: Record<TransactionType, string> = {
  receita: "Receita",
  despesa: "Despesa",
  transferencia: "Transferência",
  parcelamento: "Parcelamento",
  reembolso: "Reembolso",
};

export const FORMAS_PAGAMENTO = [
  "pix",
  "débito",
  "crédito",
  "dinheiro",
  "boleto",
  "transferência",
] as const;

/** Every financial record of the signed-in user, in one normalized snapshot.
 *  This is the single read surface the future AI assistant will consume. */
export type AtlasSnapshot = {
  accounts: Account[];
  categories: Category[];
  cards: CreditCard[];
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  installments: Installment[];
  goals: Goal[];
  profile: Profile | null;
};

export const atlasKey = ["atlas", "snapshot"] as const;

async function fetchSnapshot(): Promise<AtlasSnapshot> {
  const [accounts, categories, cards, transactions, fixedExpenses, installments, goals, profile] =
    await Promise.all([
      supabase.from("accounts").select("*").order("created_at"),
      supabase.from("categories").select("*").order("nome"),
      supabase.from("credit_cards").select("*").order("created_at"),
      supabase.from("transactions").select("*").order("data", { ascending: false }).limit(2000),
      supabase.from("fixed_expenses").select("*").order("dia_vencimento"),
      supabase.from("installments").select("*").order("created_at", { ascending: false }),
      supabase.from("goals").select("*").order("created_at"),
      supabase.from("profiles").select("*").maybeSingle(),
    ]);

  return {
    accounts: accounts.data ?? [],
    categories: categories.data ?? [],
    cards: cards.data ?? [],
    transactions: transactions.data ?? [],
    fixedExpenses: fixedExpenses.data ?? [],
    installments: installments.data ?? [],
    goals: goals.data ?? [],
    profile: profile.data ?? null,
  };
}

const EMPTY: AtlasSnapshot = {
  accounts: [],
  categories: [],
  cards: [],
  transactions: [],
  fixedExpenses: [],
  installments: [],
  goals: [],
  profile: null,
};

export function useAtlas() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [...atlasKey, user?.id],
    queryFn: fetchSnapshot,
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  return { ...query, data: query.data ?? EMPTY };
}

export function useAtlasRefresh() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: atlasKey });
}

type TableName =
  | "accounts"
  | "categories"
  | "credit_cards"
  | "transactions"
  | "fixed_expenses"
  | "installments"
  | "goals";

export function useUpsert<T extends TableName>(table: T) {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Record<string, unknown> & { id?: string }) => {
      const payload = { ...values, user_id: user?.id } as TablesInsert<T>;
      const { error } = values.id
        ? await supabase
            .from(table)
            .update(values as TablesUpdate<T>)
            .eq("id", values.id)
        : await supabase.from(table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: atlasKey }),
  });
}

export function useRemove(table: TableName) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: atlasKey }),
  });
}

/** Creates a parcelamento + its future transactions in one shot. */
export function useCreateInstallment() {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      descricao: string;
      valor_total: number;
      total_parcelas: number;
      data_inicio: string;
      categoria_id?: string | null;
      cartao_id?: string | null;
      conta_id?: string | null;
    }) => {
      const valorParcela = Number((input.valor_total / input.total_parcelas).toFixed(2));
      const { data, error } = await supabase
        .from("installments")
        .insert({ ...input, valor_parcela: valorParcela, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;

      const [y, m, d] = input.data_inicio.split("-").map(Number);
      const rows = Array.from({ length: input.total_parcelas }, (_, index) => {
        const date = new Date(y!, m! - 1 + index, d!);
        return {
          user_id: user!.id,
          descricao: `${input.descricao} (${index + 1}/${input.total_parcelas})`,
          valor: valorParcela,
          tipo: "parcelamento" as const,
          data: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          categoria_id: input.categoria_id ?? null,
          cartao_id: input.cartao_id ?? null,
          conta_id: input.conta_id ?? null,
          forma_pagamento: input.cartao_id ? "crédito" : "pix",
          pago: index === 0,
          parcela_numero: index + 1,
          parcela_total: input.total_parcelas,
          installment_id: data.id,
        };
      });
      const { error: txError } = await supabase.from("transactions").insert(rows);
      if (txError) throw txError;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: atlasKey }),
  });
}

const DEFAULT_CATEGORIES: Array<{ nome: string; tipo: "receita" | "despesa"; cor: string }> = [
  { nome: "Salário", tipo: "receita", cor: "#00D84A" },
  { nome: "Freelas", tipo: "receita", cor: "#34C759" },
  { nome: "Mercado", tipo: "despesa", cor: "#FF9F0A" },
  { nome: "iFood", tipo: "despesa", cor: "#FF375F" },
  { nome: "Uber", tipo: "despesa", cor: "#0B0B0B" },
  { nome: "Café", tipo: "despesa", cor: "#A2845E" },
  { nome: "Cigarro", tipo: "despesa", cor: "#8E8E93" },
  { nome: "Farmácia", tipo: "despesa", cor: "#30B0C7" },
  { nome: "Combustível", tipo: "despesa", cor: "#FFD60A" },
  { nome: "Lazer", tipo: "despesa", cor: "#BF5AF2" },
  { nome: "Moradia", tipo: "despesa", cor: "#5E5CE6" },
  { nome: "Investimentos", tipo: "despesa", cor: "#64D2FF" },
];

/** First-run setup: default account + Brazilian day-to-day categories. */
export function useBootstrapWorkspace() {
  const client = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("accounts").insert({
        user_id: user.id,
        nome: "Conta principal",
        tipo: "corrente",
        saldo_inicial: 0,
      });
      await supabase
        .from("categories")
        .insert(DEFAULT_CATEGORIES.map((category) => ({ ...category, user_id: user.id })));
    },
    onSuccess: () => client.invalidateQueries({ queryKey: atlasKey }),
  });
}