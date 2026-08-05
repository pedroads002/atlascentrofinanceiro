import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar as RBar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel } from "@/components/atlas/ui";
import { useAtlas } from "@/lib/atlas-data";
import { fluxoMensal, inMonth, isExpense, rankingPorCategoria } from "@/lib/metrics";
import { brl, monthLabel } from "@/lib/format";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Atlas" },
      { name: "description", content: "Gráficos interativos por mês, categoria, cartão, conta e forma de pagamento." },
      { property: "og:title", content: "Relatórios — Atlas" },
      { property: "og:description", content: "Gráficos interativos por mês, categoria, cartão, conta e forma de pagamento." },
    ],
  }),
  component: Relatorios;
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

function Relatorios() {
  const { data } = useAtlas();
  const [reference] = useState(new Date());

  const fluxo = useMemo(() => fluxoMensal(data, 6), [data]);
  const categorias = useMemo(() => rankingPorCategoria(data, reference), [data, reference]);

  const despesasMes = data.transactions.filter((t) => inMonth(t, reference) && isExpense(t));

  const porCartao = data.cards.map((card) => ({
    nome: card.nome,
    total: despesasMes.filter((t) => t.cartao_id === card.id).reduce((sum, t) => sum + Number(t.valor), 0),
  }));

  const porConta = data.accounts.map((account) => ({
    nome: account.nome,
    total: despesasMes.filter((t) => t.conta_id === account.id).reduce((sum, t) => sum + Number(t.valor), 0),
  }));

  const porForma = Object.entries(
    despesasMes.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.forma_pagamento] = (acc[transaction.forma_pagamento] ?? 0) + Number(transaction.valor);
      return acc;
    }, {}),
  ).map(([nome, total]) => ({ nome, total }));

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" subtitle={`Análises interativas — referência: ${monthLabel(reference)}`} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Receitas x despesas" hint="Últimos 6 meses">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxo} margin={{ left: -18 }}>
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip formatter={(value: number) => brl(value)} contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <RBar dataKey="receitas" name="Receitas" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <RBar dataKey="despesas" name="Despesas" fill="var(--color-negative)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Despesas por categoria" hint="Mês atual">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorias} dataKey="total" nameKey="nome" innerRadius={62} outerRadius={100} paddingAngle={2}>
                  {categorias.map((item) => (
                    <Cell key={item.id} fill={item.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => brl(value)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Gastos por cartão" hint="Mês atual">
          <ChartList items={porCartao} vazio="Nenhum cartão cadastrado." />
        </Panel>

        <Panel title="Gastos por conta" hint="Mês atual">
          <ChartList items={porConta} vazio="Nenhuma conta cadastrada." />
        </Panel>

        <Panel title="Gastos por forma de pagamento" hint="Mês atual" className="lg:col-span-2">
          <ChartList items={porForma} vazio="Sem lançamentos neste mês." />
        </Panel>
      </div>
    </div>
  );
}

function ChartList({ items, vazio }: { items: Array<{ nome: string; total: number }>; vazio: string }) {
  const maior = Math.max(1, ...items.map((item) => item.total));
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{vazio}</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.nome} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate capitalize">{item.nome}</span>
            <span className="num shrink-0 font-semibold">{brl(item.total)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.total / maior) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}