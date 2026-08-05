import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { EmptyState, Metric, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtlas, useRemove, useUpsert } from "@/lib/atlas-data";
import { brl, parseBRL } from "@/lib/format";
import { monthMetrics } from "@/lib/metrics";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas e carteiras — Atlas" },
      { name: "description", content: "Contas bancárias, carteiras e saldos iniciais do seu sistema financeiro." },
      { property: "og:title", content: "Contas e carteiras — Atlas" },
      { property: "og:description", content: "Contas bancárias, carteiras e saldos iniciais do seu sistema financeiro." },
    ],
  }),
  component: Contas,
});

function Contas() {
  const { data } = useAtlas();
  const upsert = useUpsert("accounts");
  const remove = useRemove("accounts");
  const metrics = monthMetrics(data, new Date());

  const [nome, setNome] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [saldo, setSaldo] = useState("");

  const saldoConta = (accountId: string, saldoInicial: number) =>
    saldoInicial +
    data.transactions
      .filter((t) => t.pago && (t.conta_id === accountId || t.conta_destino_id === accountId))
      .reduce((sum, t) => {
        if (t.conta_destino_id === accountId && t.tipo === "transferencia") return sum + Number(t.valor);
        if (t.conta_id === accountId && t.tipo === "transferencia") return sum - Number(t.valor);
        if (t.tipo === "receita" || t.tipo === "reembolso") return sum + Number(t.valor);
        return sum - Number(t.valor);
      }, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Contas" subtitle="Onde seu dinheiro está guardado." />

      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Saldo consolidado" value={metrics.saldoAtual} tone="positive" />
        <Metric label="Contas cadastradas" value={String(data.accounts.length)} />
      </div>

      <Panel title="Nova conta">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1.2fr_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Conta corrente" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Instituição</Label>
            <Input placeholder="Nubank" value={instituicao} onChange={(event) => setInstituicao(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Saldo inicial (R$)</Label>
            <Input className="num" placeholder="0,00" value={saldo} onChange={(event) => setSaldo(event.target.value)} />
          </div>
          <Button
            onClick={() => {
              if (!nome.trim()) {
                toast.error("Informe o nome da conta");
                return;
              }
              upsert.mutate(
                { nome: nome.trim(), instituicao: instituicao.trim() || null, saldo_inicial: parseBRL(saldo) },
                {
                  onSuccess: () => {
                    toast.success("Conta criada");
                    setNome("");
                    setInstituicao("");
                    setSaldo("");
                  },
                },
              );
            }}
          >
            Adicionar
          </Button>
        </div>
      </Panel>

      {data.accounts.length === 0 ? (
        <EmptyState title="Nenhuma conta" description="Cadastre sua conta principal para começar." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.accounts.map((account) => (
            <Panel key={account.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{account.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{account.instituicao ?? "Carteira"}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove.mutate(account.id)}>
                  <Trash2 className="size-4 text-negative" />
                </Button>
              </div>
              <p className="num mt-5 text-2xl font-extrabold">
                {brl(saldoConta(account.id, Number(account.saldo_inicial)))}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Saldo inicial {brl(Number(account.saldo_inicial))}
              </p>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}