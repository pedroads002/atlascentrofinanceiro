import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { EmptyState, Metric, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAtlas, useRemove, useUpsert } from "@/lib/atlas-data";
import { brl, parseBRL } from "@/lib/format";

export const Route = createFileRoute("/fixas")({
  head: () => ({
    meta: [
      { title: "Despesas fixas — Atlas" },
      { name: "description", content: "Aluguel, internet, energia e todo o custo fixo mensal em um só lugar." },
      { property: "og:title", content: "Despesas fixas — Atlas" },
      { property: "og:description", content: "Aluguel, internet, energia e todo o custo fixo mensal em um só lugar." },
    ],
  }),
  component: Fixas,
});

function Fixas() {
  const { data } = useAtlas();
  const upsert = useUpsert("fixed_expenses");
  const remove = useRemove("fixed_expenses");

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [dia, setDia] = useState("5");
  const [categoriaId, setCategoriaId] = useState("");

  const total = data.fixedExpenses.filter((f) => f.ativo).reduce((sum, f) => sum + Number(f.valor), 0);

  const salvar = () => {
    if (!nome.trim() || parseBRL(valor) <= 0) {
      toast.error("Informe nome e valor");
      return;
    }
    upsert.mutate(
      {
        nome: nome.trim(),
        valor: parseBRL(valor),
        dia_vencimento: Number(dia) || 1,
        categoria_id: categoriaId || null,
      },
      {
        onSuccess: () => {
          toast.success("Despesa fixa criada");
          setNome("");
          setValor("");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Despesas fixas" subtitle="O que se repete todo mês, sem surpresas." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Custo fixo mensal" value={total} tone="negative" />
        <Metric label="Custo fixo anual" value={total * 12} />
        <Metric label="Itens ativos" value={String(data.fixedExpenses.filter((f) => f.ativo).length)} />
      </div>

      <Panel title="Nova despesa fixa">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_0.7fr_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Aluguel" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input className="num" placeholder="0,00" value={valor} onChange={(event) => setValor(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Dia</Label>
            <Input type="number" min={1} max={31} value={dia} onChange={(event) => setDia(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {data.categories.filter((c) => c.tipo === "despesa").map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={salvar} disabled={upsert.isPending}>Adicionar</Button>
        </div>
      </Panel>

      <Panel title="Suas despesas fixas">
        {data.fixedExpenses.length === 0 ? (
          <EmptyState title="Nenhuma despesa fixa" description="Cadastre aluguel, internet, energia, academia e afins." />
        ) : (
          <ul className="divide-y divide-border">
            {data.fixedExpenses.map((expense) => (
              <li key={expense.id} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{expense.nome}</span>
                  <span className="block text-xs text-muted-foreground">
                    Vence todo dia {expense.dia_vencimento}
                  </span>
                </span>
                <span className="num shrink-0 text-sm font-bold">{brl(Number(expense.valor))}</span>
                <Switch
                  checked={expense.ativo}
                  onCheckedChange={(checked) => upsert.mutate({ id: expense.id, ativo: checked })}
                  aria-label="Ativa"
                />
                <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove.mutate(expense.id)}>
                  <Trash2 className="size-4 text-negative" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}