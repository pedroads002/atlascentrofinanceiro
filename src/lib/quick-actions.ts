import type { Category } from "@/lib/atlas-data";

/** One-tap shortcuts for the expenses people log most often.
 *  `match` holds the category names we try to resolve, in priority order. */
export type QuickAction = {
  id: string;
  emoji: string;
  label: string;
  match: string[];
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "uber", emoji: "🚕", label: "Uber", match: ["transporte", "mobilidade", "uber"] },
  { id: "cafe", emoji: "☕", label: "Café", match: ["alimentação", "café", "lazer"] },
  { id: "cigarro", emoji: "🚬", label: "Cigarro", match: ["pessoal", "outros", "lazer"] },
  { id: "ifood", emoji: "🍔", label: "iFood", match: ["alimentação", "delivery", "lazer"] },
  { id: "mercado", emoji: "🛒", label: "Mercado", match: ["mercado", "supermercado", "alimentação"] },
  { id: "combustivel", emoji: "⛽", label: "Combustível", match: ["transporte", "combustível", "carro"] },
  { id: "farmacia", emoji: "💊", label: "Farmácia", match: ["saúde", "farmácia"] },
  { id: "moradia", emoji: "🏠", label: "Moradia", match: ["moradia", "casa", "aluguel"] },
  { id: "cartao", emoji: "💳", label: "Cartão", match: ["cartão", "fatura", "outros"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Resolves the best existing expense category for a shortcut. */
export function resolveCategoryId(action: QuickAction, categories: Category[]): string {
  const expenses = categories.filter((category) => category.tipo === "despesa");
  for (const candidate of action.match) {
    const target = normalize(candidate);
    const hit = expenses.find((category) => {
      const name = normalize(category.nome);
      return name === target || name.includes(target) || target.includes(name);
    });
    if (hit) return hit.id;
  }
  return "";
}
