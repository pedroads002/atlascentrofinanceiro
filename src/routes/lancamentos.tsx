import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickTransaction } from "@/components/atlas/QuickTransaction";
import { TIPO_LABEL, useAtlas, useRemove, type Transaction, type TransactionType } from "@/lib/atlas-data";
import { brl, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos — Atlas" },
      { name: "description", content: "Registre receitas, despesas, transferências e reembolsos em segundos." },
      { property: "og:title", content: "Lançamentos — Atlas" },
      { property: "og:description", content: "Registre receitas, despesas, transferências e reembolsos em segundos." },
    ],
  }),
  component: Lancamentos,
});

const FILTROS: Array<TransactionType | "todos"> = [
  "todos",
  "despesa",
  "receita",
  "parcelamento",
  "transferencia",
  "reembolso",
];

function Lancamentos() {
  const { data } = useAtlas();
  const remove = useRemove("transactions");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<TransactionType | "todos">("todos");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return data.transactions.filter((transaction) => {
      const okTipo = filtro === "todos" || transaction.tipo === filtro;
      const okBusca = !termo || transaction.descricao.toLowerCase().includes(termo);
      return okTipo && okBusca;
    });
  }, [data.transactions, busca, filtro]);

  const categoria = (id: string | null) => data.categories.find((c) => c.id === id)?.nome ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lançamentos"
        subtitle={`${lista.length} registro(s) encontrados`}
        actions={
          <Button
            className="hidden sm:inline-flex"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Novo lançamento
          </Button>
        }
      />

      <Panel className="p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <Input
            className="h-11"
            placeholder="Buscar por descrição..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
          {/* Swipeable chip row on mobile so filters never force page-wide horizontal scroll. */}
          <div className="scroll-x -mx-4 flex gap-2 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {FILTROS.map((option) => (
              <button
                key={option}
                onClick={() => setFiltro(option)}
                className={cn(
                  "press min-h-11 shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors sm:min-h-9",
                  filtro === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {option === "todos" ? "Todos" : TIPO_LABEL[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {lista.length === 0 ? (
            <EmptyState title="Nenhum lançamento" description="Comece registrando sua primeira movimentação financeira." />
          ) : (
            <ul className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-border">
              {lista.map((transaction) => {
                const entrada = transaction.tipo === "receita" || transaction.tipo === "reembolso";
                return (
                  <li
                    key={transaction.id}
                    className="rounded-2xl border border-border bg-card p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:py-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Whole row is the edit tap target on mobile (44px+). */}
                      <button
                        onClick={() => {
                          setEditing(transaction);
                          setOpen(true);
                        }}
                        className="press flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{transaction.descricao}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {formatDate(transaction.data)} · {categoria(transaction.categoria_id)} ·{" "}
                            <span className="capitalize">{transaction.forma_pagamento}</span>
                            {transaction.pago ? "" : " · em aberto"}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "num shrink-0 text-sm font-bold",
                            entrada ? "text-positive" : "text-foreground",
                          )}
                        >
                          {entrada ? "+" : "−"} {brl(Number(transaction.valor))}
                        </span>
                      </button>
                      <span className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="tap hidden sm:inline-flex"
                          aria-label="Editar"
                          onClick={() => {
                            setEditing(transaction);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="tap"
                          aria-label="Excluir"
                          onClick={() => remove.mutate(transaction.id)}
                        >
                          <Trash2 className="size-4 text-negative" />
                        </Button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Panel>

      <QuickTransaction open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}