import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Metric, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { useAtlas } from "@/lib/atlas-data";
import { isExpense, monthMetrics, rankingPorCategoria } from "@/lib/metrics";
import { addMonths, brl, formatDate, monthLabel, startOfMonth } from "@/lib/format";

export const Route = createFileRoute("/resumo")({
  head: () => ({
    meta: [
      { title: "Resumo mensal — Atlas" },
      { name: "description", content: "Receitas, despesas, economia, maior gasto e maior categoria do mês." },
      { property: "og:title", content: "Resumo mensal — Atlas" },
      { property: "og:description", content: "Receitas, despesas, economia, maior gasto e maior categoria do mês." },
    ],
  }),
  component: Resumo,
});

function Resumo() {
  const { data } = useAtlas();
  const [reference, setReference] = useState(startOfMonth(new Date()));
  const metrics = useMemo(() => monthMetrics(data, reference), [data, reference]);
  const ranking = useMemo(() => rankingPorCategoria(data, reference), [data, reference]);

  const maiorGasto = [...metrics.monthTx]
    .filter(isExpense)
    .sort((a, b) => Number(b.valor) - Number(a.valor))[0];
  const maiorCategoria = ranking[0];
  const taxaEconomia = metrics.receitas > 0 ? metrics.economia / metrics.receitas : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumo mensal"
        subtitle="O fechamento automático do seu mês."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="tap" aria-label="Mês anterior" onClick={() => setReference(addMonths(reference, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[150px] text-center text-sm font-semibold capitalize">{monthLabel(reference)}</span>
            <Button variant="ghost" size="icon" className="tap" aria-label="Próximo mês" onClick={() => setReference(addMonths(reference, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Receitas" value={metrics.receitas} tone="positive" />
        <Metric label="Despesas" value={metrics.despesas} tone="negative" />
        <Metric label="Economia" value={metrics.economia} tone={metrics.economia >= 0 ? "positive" : "negative"} hint={`Taxa de economia: ${Math.round(taxaEconomia * 100)}%`} />
        <Metric label="Custo fixo" value={metrics.custoFixo} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Maior gasto do mês">
          {maiorGasto ? (
            <>
              <p className="num text-2xl font-extrabold">{brl(Number(maiorGasto.valor))}</p>
              <p className="mt-1 text-sm font-medium">{maiorGasto.descricao}</p>
              <p className="text-xs text-muted-foreground">{formatDate(maiorGasto.data)}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem despesas neste mês.</p>
          )}
        </Panel>

        <Panel title="Maior categoria">
          {maiorCategoria ? (
            <>
              <p className="num text-2xl font-extrabold">{brl(maiorCategoria.total)}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                <span className="size-2.5 rounded-full" style={{ background: maiorCategoria.cor }} />
                {maiorCategoria.nome}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.despesas > 0
                  ? `${Math.round((maiorCategoria.total / metrics.despesas) * 100)}% de todas as despesas`
                  : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem categorias movimentadas.</p>
          )}
        </Panel>
      </div>

      <Panel title="Todas as categorias do mês">
        <ul className="divide-y divide-border">
          {ranking.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: item.cor }} />
                <span className="truncate">{item.nome}</span>
              </span>
              <span className="num shrink-0 font-semibold">{brl(item.total)}</span>
            </li>
          ))}
          {ranking.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">Nenhum gasto registrado neste mês.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}