import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Bar, EmptyState, PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAtlas, useAtlasRefresh, useRemove, useUpsert } from "@/lib/atlas-data";
import { useAuth } from "@/hooks/useAuth";
import { brl, formatDate, parseBRL } from "@/lib/format";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas financeiras — Atlas" },
      { name: "description", content: "Reserva de emergência, viagem, carro: acompanhe o progresso de cada meta." },
      { property: "og:title", content: "Metas financeiras — Atlas" },
      { property: "og:description", content: "Reserva de emergência, viagem, carro: acompanhe o progresso de cada meta." },
    ],
  }),
  component: Metas,
});

function Metas() {
  const { data } = useAtlas();
  const { user } = useAuth();
  const refresh = useAtlasRefresh();
  const upsert = useUpsert("goals");
  const remove = useRemove("goals");

  const [nome, setNome] = useState("");
  const [alvo, setAlvo] = useState("");
  const [dataAlvo, setDataAlvo] = useState("");
  const [metaMensal, setMetaMensal] = useState(String(data.profile?.meta_economia_mensal ?? ""));

  const salvarMetaMensal = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, meta_economia_mensal: parseBRL(metaMensal) });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Meta mensal atualizada");
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Metas" subtitle="Onde você quer chegar, e o quanto já andou." />

      <Panel title="Meta mensal de economia" hint="Usada no dashboard para medir seu ritmo">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input className="num" placeholder="0,00" value={metaMensal} onChange={(event) => setMetaMensal(event.target.value)} />
          </div>
          <Button onClick={salvarMetaMensal}>Salvar meta</Button>
        </div>
      </Panel>

      <Panel title="Nova meta">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Reserva de emergência" value={nome} onChange={(event) => setNome(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor alvo (R$)</Label>
            <Input className="num" placeholder="0,00" value={alvo} onChange={(event) => setAlvo(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Data alvo</Label>
            <Input type="date" value={dataAlvo} onChange={(event) => setDataAlvo(event.target.value)} />
          </div>
          <Button
            onClick={() => {
              if (!nome.trim() || parseBRL(alvo) <= 0) {
                toast.error("Informe nome e valor alvo");
                return;
              }
              upsert.mutate(
                { nome: nome.trim(), valor_alvo: parseBRL(alvo), data_alvo: dataAlvo || null },
                {
                  onSuccess: () => {
                    toast.success("Meta criada");
                    setNome("");
                    setAlvo("");
                    setDataAlvo("");
                  },
                },
              );
            }}
          >
            Criar meta
          </Button>
        </div>
      </Panel>

      {data.goals.length === 0 ? (
        <EmptyState title="Nenhuma meta" description="Crie metas como reserva de emergência, viagem ou notebook." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.goals.map((goal) => {
            const progresso = Number(goal.valor_alvo) ? Number(goal.valor_atual) / Number(goal.valor_alvo) : 0;
            return (
              <Panel key={goal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{goal.nome}</p>
                    {goal.data_alvo ? (
                      <p className="text-xs text-muted-foreground">Até {formatDate(goal.data_alvo)}</p>
                    ) : null}
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove.mutate(goal.id)}>
                    <Trash2 className="size-4 text-negative" />
                  </Button>
                </div>
                <p className="num mt-4 text-2xl font-extrabold">{brl(Number(goal.valor_atual))}</p>
                <p className="text-xs text-muted-foreground">de {brl(Number(goal.valor_alvo))}</p>
                <div className="mt-4">
                  <Bar value={progresso} />
                </div>
                <div className="mt-4 flex gap-2">
                  {[50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        upsert.mutate({ id: goal.id, valor_atual: Number(goal.valor_atual) + amount })
                      }
                    >
                      +{brl(amount)}
                    </Button>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}