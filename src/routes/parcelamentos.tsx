import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Bar, EmptyState, Metric, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAtlas, useCreateInstallment, useRemove } from "@/lib/atlas-data";
import { addMonths, brl, formatDate, isoDate, parseBRL, toDate } from "@/lib/format";

export const Route = createFileRoute("/parcelamentos")({
  head: () => ({
    meta: [
      { title: "Parcelamentos — Atlas" },
      { name: "description", content: "Acompanhe valor original, parcela mensal, parcelas restantes e data final." },
      { property: "og:title", content: "Parcelamentos — Atlas" },
      { property: "og:description", content: "Acompanhe valor original, parcela mensal, parcelas restantes e data final." },
    ],
  }),
  component: Parcelamentos,
});

function Parcelamentos() {
  const { data } = useAtlas();
  const create = useCreateInstallment();
  const remove = useRemove("installments");

  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [parcelas, setParcelas] = useState("12");
  const [inicio, setInicio] = useState(isoDate(new Date()));
  const [cartaoId, setCartaoId] = useState("");

  const hoje = new Date();
  const comprometidoMes = data.transactions
    .filter((t) => t.tipo === "parcelamento" && t.data.slice(0, 7) === isoDate(hoje).slice(0, 7))
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const totalRestante = data.installments.reduce((sum, item) => {
    const pagas = data.transactions.filter((t) => t.installment_id === item.id && t.pago).length;
    return sum + Math.max(0, item.total_parcelas - pagas) * Number(item.valor_parcela);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Parcelamentos" subtitle="Todo compromisso futuro, visível hoje." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Comprometido este mês" value={comprometidoMes} tone="negative" />
        <Metric label="Saldo devedor total" value={totalRestante} />
        <Metric label="Parcelamentos ativos" value={String(data.installments.length)} />
      </div>

      <Panel title="Novo parcelamento" hint="As parcelas futuras são criadas automaticamente">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_0.7fr_1fr_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input placeholder="Notebook" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor total (R$)</Label>
            <Input className="num" placeholder="0,00" value={valorTotal} onChange={(event) => setValorTotal(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Parcelas</Label>
            <Input type="number" min={2} max={72} value={parcelas} onChange={(event) => setParcelas(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Início</Label>
            <Input type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cartão</Label>
            <Select value={cartaoId} onValueChange={setCartaoId}>
              <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
              <SelectContent>
                {data.cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>{card.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={create.isPending}
            onClick={() => {
              const total = parseBRL(valorTotal);
              const qtd = Number(parcelas);
              if (!descricao.trim() || total <= 0 || qtd < 2) {
                toast.error("Preencha descrição, valor e número de parcelas");
                return;
              }
              create.mutate(
                {
                  descricao: descricao.trim(),
                  valor_total: total,
                  total_parcelas: qtd,
                  data_inicio: inicio,
                  cartao_id: cartaoId || null,
                },
                {
                  onSuccess: () => {
                    toast.success("Parcelamento criado");
                    setDescricao("");
                    setValorTotal("");
                  },
                  onError: (error) => toast.error(error.message),
                },
              );
            }}
          >
            Criar
          </Button>
        </div>
      </Panel>

      {data.installments.length === 0 ? (
        <EmptyState title="Nenhum parcelamento" description="Cadastre compras parceladas para enxergar o futuro do seu caixa." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.installments.map((item) => {
            const pagas = data.transactions.filter((t) => t.installment_id === item.id && t.pago).length;
            const restantes = Math.max(0, item.total_parcelas - pagas);
            const fim = addMonths(toDate(item.data_inicio), item.total_parcelas - 1);
            return (
              <Panel key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {pagas} de {item.total_parcelas} parcelas pagas · termina em {formatDate(isoDate(fim))}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="tap" aria-label="Excluir" onClick={() => remove.mutate(item.id)}>
                    <Trash2 className="size-4 text-negative" />
                  </Button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Valor original</p>
                    <p className="num font-bold">{brl(Number(item.valor_total))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Parcela</p>
                    <p className="num font-bold">{brl(Number(item.valor_parcela))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Restam</p>
                    <p className="num font-bold">{restantes}x</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Bar value={item.total_parcelas ? pagas / item.total_parcelas : 0} />
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}