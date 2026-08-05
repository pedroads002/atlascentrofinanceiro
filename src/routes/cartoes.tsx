import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Bar, EmptyState, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtlas, useRemove, useUpsert } from "@/lib/atlas-data";
import { brl, formatDate, parseBRL } from "@/lib/format";
import { faturaCartao } from "@/lib/metrics";

export const Route = createFileRoute("/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões de crédito — Atlas" },
      { name: "description", content: "Faturas, limites, limite disponível e parcelas de todos os seus cartões." },
      { property: "og:title", content: "Cartões de crédito — Atlas" },
      { property: "og:description", content: "Faturas, limites, limite disponível e parcelas de todos os seus cartões." },
    ],
  }),
  component: Cartoes,
});

function Cartoes() {
  const { data } = useAtlas();
  const upsert = useUpsert("credit_cards");
  const remove = useRemove("credit_cards");
  const hoje = new Date();

  const [nome, setNome] = useState("");
  const [limite, setLimite] = useState("");
  const [fechamento, setFechamento] = useState("1");
  const [vencimento, setVencimento] = useState("10");

  return (
    <div className="space-y-6">
      <PageHeader title="Cartões de crédito" subtitle="Faturas, limites e compromissos futuros." />

      <Panel title="Novo cartão">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Nubank Ultravioleta" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Limite (R$)</Label>
            <Input className="num" placeholder="0,00" value={limite} onChange={(event) => setLimite(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Fechamento</Label>
            <Input type="number" min={1} max={31} value={fechamento} onChange={(event) => setFechamento(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Vencimento</Label>
            <Input type="number" min={1} max={31} value={vencimento} onChange={(event) => setVencimento(event.target.value)} />
          </div>
          <Button
            onClick={() => {
              if (!nome.trim()) {
                toast.error("Informe o nome do cartão");
                return;
              }
              upsert.mutate(
                {
                  nome: nome.trim(),
                  limite: parseBRL(limite),
                  dia_fechamento: Number(fechamento) || 1,
                  dia_vencimento: Number(vencimento) || 10,
                },
                {
                  onSuccess: () => {
                    toast.success("Cartão adicionado");
                    setNome("");
                    setLimite("");
                  },
                },
              );
            }}
          >
            Adicionar
          </Button>
        </div>
      </Panel>

      {data.cards.length === 0 ? (
        <EmptyState title="Nenhum cartão" description="Cadastre seus cartões para acompanhar faturas e limites." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.cards.map((card) => {
            const fatura = faturaCartao(data, card.id, hoje);
            const limiteTotal = Number(card.limite);
            const disponivel = Math.max(0, limiteTotal - fatura.comprometido);
            const parcelas = data.installments.filter((i) => i.cartao_id === card.id);
            const compras = data.transactions.filter((t) => t.cartao_id === card.id).slice(0, 5);

            return (
              <Panel key={card.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{card.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Fecha dia {card.dia_fechamento} · vence dia {card.dia_vencimento}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove.mutate(card.id)}>
                    <Trash2 className="size-4 text-negative" />
                  </Button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fatura atual</p>
                    <p className="num text-2xl font-extrabold">{brl(fatura.atual)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Próxima fatura</p>
                    <p className="num text-2xl font-extrabold text-muted-foreground">{brl(fatura.proxima)}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Limite disponível</span>
                    <span className="num font-semibold text-foreground">
                      {brl(disponivel)} de {brl(limiteTotal)}
                    </span>
                  </div>
                  <Bar value={limiteTotal ? fatura.comprometido / limiteTotal : 0} tone="negative" />
                </div>

                {parcelas.length > 0 ? (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {parcelas.length} parcelamento(s) ativo(s) neste cartão
                  </p>
                ) : null}

                {compras.length > 0 ? (
                  <ul className="mt-4 divide-y divide-border border-t border-border pt-2">
                    {compras.map((transaction) => (
                      <li key={transaction.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="min-w-0 truncate">{transaction.descricao}</span>
                        <span className="num shrink-0 text-xs text-muted-foreground">
                          {formatDate(transaction.data)} · {brl(Number(transaction.valor))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}