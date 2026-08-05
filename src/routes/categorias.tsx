import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAtlas, useRemove, useUpsert } from "@/lib/atlas-data";
import { brl, parseBRL } from "@/lib/format";
import { rankingPorCategoria } from "@/lib/metrics";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Atlas" },
      { name: "description", content: "Categorias personalizadas com orçamento mensal e cor própria." },
      { property: "og:title", content: "Categorias — Atlas" },
      { property: "og:description", content: "Categorias personalizadas com orçamento mensal e cor própria." },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  const { data } = useAtlas();
  const upsert = useUpsert("categories");
  const remove = useRemove("categories");
  const ranking = rankingPorCategoria(data, new Date());

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"despesa" | "receita">("despesa");
  const [cor, setCor] = useState("#00D84A");
  const [orcamento, setOrcamento] = useState("");

  const gastoDe = (id: string) => ranking.find((item) => item.id === id)?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Categorias" subtitle="Organize seus gastos do jeito que a sua vida funciona." />

      <Panel title="Nova categoria">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_0.6fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="iFood" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(value) => setTipo(value as "despesa" | "receita")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Orçamento mensal (R$)</Label>
            <Input className="num" placeholder="Opcional" value={orcamento} onChange={(event) => setOrcamento(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cor</Label>
            <Input type="color" value={cor} onChange={(event) => setCor(event.target.value)} className="h-9 p-1" />
          </div>
          <Button
            onClick={() => {
              if (!nome.trim()) {
                toast.error("Informe o nome");
                return;
              }
              upsert.mutate(
                {
                  nome: nome.trim(),
                  tipo,
                  cor,
                  orcamento_mensal: orcamento ? parseBRL(orcamento) : null,
                },
                {
                  onSuccess: () => {
                    toast.success("Categoria criada");
                    setNome("");
                    setOrcamento("");
                  },
                },
              );
            }}
          >
            Adicionar
          </Button>
        </div>
      </Panel>

      {data.categories.length === 0 ? (
        <EmptyState title="Nenhuma categoria" description="Crie categorias como Mercado, Uber, iFood e Café." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.categories.map((category) => {
            const gasto = gastoDe(category.id);
            const orcamentoMensal = Number(category.orcamento_mensal ?? 0);
            return (
              <Panel key={category.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: category.cor }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{category.nome}</p>
                      <p className="text-xs capitalize text-muted-foreground">{category.tipo}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="tap" aria-label="Excluir" onClick={() => remove.mutate(category.id)}>
                    <Trash2 className="size-4 text-negative" />
                  </Button>
                </div>
                <p className="num mt-4 text-xl font-extrabold">{brl(gasto)}</p>
                <p className="text-xs text-muted-foreground">
                  {orcamentoMensal > 0 ? `de ${brl(orcamentoMensal)} orçados este mês` : "gasto neste mês"}
                </p>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}