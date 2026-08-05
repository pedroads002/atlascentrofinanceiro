import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { useAtlas } from "@/lib/atlas-data";
import { contasDoMes } from "@/lib/metrics";
import { WEEKDAYS_PT, addMonths, brl, endOfMonth, isoDate, monthLabel, startOfMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário financeiro — Atlas" },
      { name: "description", content: "Vencimentos, pagamentos, receitas e parcelas distribuídos no mês." },
      { property: "og:title", content: "Calendário financeiro — Atlas" },
      { property: "og:description", content: "Vencimentos, pagamentos, receitas e parcelas distribuídos no mês." },
    ],
  }),
  component: Calendario,
});

function Calendario() {
  const { data } = useAtlas();
  const [reference, setReference] = useState(startOfMonth(new Date()));

  const dias = useMemo(() => {
    const primeiro = startOfMonth(reference);
    const ultimo = endOfMonth(reference);
    const offset = primeiro.getDay();
    const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= ultimo.getDate(); day += 1) {
      cells.push(new Date(reference.getFullYear(), reference.getMonth(), day));
    }
    return cells;
  }, [reference]);

  const contas = useMemo(() => contasDoMes(data, reference), [data, reference]);

  const eventosDoDia = (date: Date) => {
    const iso = isoDate(date);
    const transacoes = data.transactions.filter((t) => t.data === iso);
    const vencimentos = contas.filter((c) => c.data === iso && c.origem === "fixa");
    return { transacoes, vencimentos };
  };

  const hojeIso = isoDate(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário financeiro"
        subtitle="Enxergue o mês inteiro antes que ele aconteça."
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

      <Panel>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {WEEKDAYS_PT.map((day) => (
            <span key={day} className="py-2">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1">
          {dias.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-[52px] rounded-xl sm:min-h-[92px]" />;
            const { transacoes, vencimentos } = eventosDoDia(date);
            const iso = isoDate(date);
            const entradas = transacoes
              .filter((t) => t.tipo === "receita" || t.tipo === "reembolso")
              .reduce((sum, t) => sum + Number(t.valor), 0);
            const saidas = transacoes
              .filter((t) => t.tipo === "despesa" || t.tipo === "parcelamento")
              .reduce((sum, t) => sum + Number(t.valor), 0);

            return (
              <div
                key={iso}
                className={cn(
                  "min-h-[52px] rounded-xl border border-border p-1 text-left transition-colors sm:min-h-[92px] sm:p-2",
                  iso === hojeIso ? "border-primary/60 bg-accent/40" : "hover:bg-muted/50",
                )}
              >
                <span className={cn("num text-xs font-bold", iso === hojeIso && "text-primary")}>
                  {date.getDate()}
                </span>
                {/* Phones get value dots; tablets and up get the full amounts. */}
                <div className="mt-1 flex gap-1 sm:hidden">
                  {entradas > 0 ? <span className="size-1.5 rounded-full bg-positive" /> : null}
                  {saidas > 0 ? <span className="size-1.5 rounded-full bg-negative" /> : null}
                  {vencimentos.length > 0 ? <span className="size-1.5 rounded-full bg-warning" /> : null}
                </div>
                <div className="mt-1 hidden space-y-1 sm:block">
                  {entradas > 0 ? (
                    <p className="num truncate text-[10px] font-semibold text-positive">+{brl(entradas)}</p>
                  ) : null}
                  {saidas > 0 ? (
                    <p className="num truncate text-[10px] font-semibold text-negative">−{brl(saidas)}</p>
                  ) : null}
                  {vencimentos.map((item) => (
                    <p key={item.id} className="truncate rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
                      {item.descricao}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Agenda do mês" hint="Contas fixas e lançamentos em aberto">
        <ul className="divide-y divide-border">
          {contas.map((conta) => (
            <li key={`${conta.origem}-${conta.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0 truncate">{conta.descricao}</span>
              <span className="num shrink-0 text-xs text-muted-foreground">
                dia {conta.data.slice(8, 10)} · {brl(conta.valor)} {conta.pago ? "· pago" : ""}
              </span>
            </li>
          ))}
          {contas.length === 0 ? (
            <li className="py-6 text-center text-sm text-muted-foreground">Nada agendado para este mês.</li>
          ) : null}
        </ul>
      </Panel>
    </div>
  );
}