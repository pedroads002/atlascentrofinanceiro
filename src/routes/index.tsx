import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, PiggyBank, Wallet } from "lucide-react";
import { Bar, EmptyState, Metric, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { QuickTransaction } from "@/components/atlas/QuickTransaction";
import { useAtlas } from "@/lib/atlas-data";
import { contasDoMes, fluxoMensal, monthMetrics, rankingPorCategoria } from "@/lib/metrics";
import { brl, formatDate, isoDate, monthLabel } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas - Seu Centro Financeiro" },
      {
        name: "description",
        content: "Seu centro de comando financeiro. Controle total. Decisões melhores. Veja para onde seu dinheiro vai. Decida para onde ele deve ir.",
      },
      { property: "og:title", content: "Atlas - Seu Centro Financeiro" },
      {
        property: "og:description",
        content: "Seu centro de comando financeiro. Controle total. Decisões melhores. Veja para onde seu dinheiro vai. Decida para onde ele deve ir.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useAtlas();
  const [quickOpen, setQuickOpen] = useState(false);
  const hoje = new Date();

  const metrics = useMemo(() => monthMetrics(data, hoje), [data]);
  const ranking = useMemo(() => rankingPorCategoria(data, hoje).slice(0, 5), [data]);
  const contas = useMemo(() => contasDoMes(data, hoje), [data]);
  const fluxo = useMemo(() => fluxoMensal(data), [data]);

  const hojeIso = isoDate(hoje);
  const atrasadas = contas.filter((c) => !c.pago && c.data < hojeIso);
  const vencendo = contas.filter((c) => !c.pago && c.data >= hojeIso).slice(0, 6);
  const maiorRanking = ranking[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, aqui está ${monthLabel(hoje)}`}
        subtitle="Sua saúde financeira de hoje e a melhor decisão para agora."
        actions={
          <Button variant="secondary" onClick={() => setQuickOpen(true)}>
            Registrar gasto
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Saldo atual" value={metrics.saldoAtual} icon={<Wallet className="size-4" />} tone={metrics.saldoAtual >= 0 ? "neutral" : "negative"} />
        <Metric label="Saldo disponível" value={metrics.saldoDisponivel} hint="Descontando contas em aberto" tone="positive" />
        <Metric label="Receitas do mês" value={metrics.receitas} icon={<ArrowUpRight className="size-4" />} tone="positive" />
        <Metric label="Despesas do mês" value={metrics.despesas} icon={<ArrowDownRight className="size-4" />} tone="negative" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Economia do mês" value={metrics.economia} tone={metrics.economia >= 0 ? "positive" : "negative"} icon={<PiggyBank className="size-4" />} />
        <Metric label="Gastos de hoje" value={metrics.gastosDoDia} hint={`Média diária: ${brl(metrics.mediaDiaria)}`} />
        <Metric label="Projeção de saldo" value={metrics.projecaoSaldo} hint="Ao fim do mês, pagando tudo" tone={metrics.projecaoSaldo >= 0 ? "neutral" : "negative"} />
        <Metric
          label="Contas atrasadas"
          value={atrasadas.reduce((sum, c) => sum + c.valor, 0)}
          hint={`${atrasadas.length} conta(s)`}
          tone={atrasadas.length ? "negative" : "neutral"}
          icon={<AlertTriangle className="size-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Fluxo de caixa"
          hint="Últimos 6 meses de receitas e despesas"
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxo} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-negative)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-negative)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  formatter={(value: number, name) => [brl(value), name === "receitas" ? "Receitas" : "Despesas"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="receitas" stroke="var(--color-primary)" strokeWidth={2} fill="url(#inflow)" />
                <Area type="monotone" dataKey="despesas" stroke="var(--color-negative)" strokeWidth={2} fill="url(#outflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Para onde foi meu dinheiro?" hint={`Ranking de ${monthLabel(hoje)}`}>
          {ranking.length === 0 ? (
            <EmptyState title="Sem gastos ainda" description="Registre um lançamento para ver o ranking por categoria." />
          ) : (
            <ul className="space-y-4">
              {ranking.map((item, index) => (
                <li key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{index + 1}</span>
                      <span className="size-2 shrink-0 rounded-full" style={{ background: item.cor }} />
                      <span className="truncate font-medium">{item.nome}</span>
                    </span>
                    <span className="num shrink-0 font-semibold">{brl(item.total)}</span>
                  </div>
                  <Bar value={maiorRanking ? item.total / maiorRanking : 0} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Quanto custa viver?" hint="Custo fixo mensal recorrente">
          <p className="num text-3xl font-extrabold">{brl(metrics.custoFixo)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {metrics.receitas > 0
              ? `Isso consome ${Math.round((metrics.custoFixo / metrics.receitas) * 100)}% das suas receitas do mês.`
              : "Cadastre suas receitas para ver o peso do custo fixo."}
          </p>
          <div className="mt-4">
            <Bar value={metrics.receitas ? metrics.custoFixo / metrics.receitas : 0} tone="negative" />
          </div>
          <Link to="/fixas" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
            Ver despesas fixas →
          </Link>
        </Panel>

        <Panel title="Se continuar assim..." hint="Projeção até o fim do mês">
          <p className={`num text-3xl font-extrabold ${metrics.seContinuarAssim >= 0 ? "text-positive" : "text-negative"}`}>
            {brl(metrics.seContinuarAssim)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Mantendo a média de {brl(metrics.mediaDiaria)} por dia, você deve fechar o mês
            {metrics.seContinuarAssim >= 0 ? " no positivo." : " no negativo."}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Despesa projetada: <span className="num font-semibold">{brl(metrics.projecaoDespesas)}</span>
          </p>
        </Panel>

        <Panel title="Meta mensal de economia" hint="Defina em Metas">
          <p className="num text-3xl font-extrabold">{brl(metrics.meta)}</p>
          <div className="mt-4 space-y-2">
            <Bar value={metrics.metaProgresso} />
            <p className="text-xs text-muted-foreground">
              {metrics.meta > 0
                ? `Você já economizou ${brl(Math.max(0, metrics.economia))} (${Math.round(metrics.metaProgresso * 100)}%).`
                : "Nenhuma meta mensal definida ainda."}
            </p>
          </div>
          <Link to="/metas" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
            Configurar meta →
          </Link>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Contas vencendo" hint="Próximos vencimentos do mês">
          {vencendo.length === 0 ? (
            <EmptyState title="Nada a vencer" description="Você está em dia com as contas deste mês." />
          ) : (
            <ul className="divide-y divide-border">
              {vencendo.map((conta) => (
                <li key={`${conta.origem}-${conta.id}`} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{conta.descricao}</span>
                      <span className="block text-xs text-muted-foreground">{formatDate(conta.data)}</span>
                    </span>
                  </span>
                  <span className="num shrink-0 text-sm font-semibold">{brl(conta.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Contas atrasadas" hint="Resolva o quanto antes">
          {atrasadas.length === 0 ? (
            <EmptyState title="Tudo em dia" description="Nenhuma conta atrasada. Continue assim." />
          ) : (
            <ul className="divide-y divide-border">
              {atrasadas.map((conta) => (
                <li key={`${conta.origem}-${conta.id}`} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{conta.descricao}</span>
                    <span className="block text-xs text-negative">Venceu em {formatDate(conta.data)}</span>
                  </span>
                  <span className="num shrink-0 text-sm font-semibold text-negative">{brl(conta.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando seus dados...</p> : null}
      <QuickTransaction open={quickOpen} onOpenChange={setQuickOpen} />
    </div>
  );
}