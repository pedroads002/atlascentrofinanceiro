import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/atlas/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAtlas } from "@/lib/atlas-data";
import { askAtlas } from "@/lib/assistant.functions";
import { buildAtlasContext } from "@/lib/ai-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente IA — Atlas" },
      { name: "description", content: "Converse com seus dados financeiros e receba respostas em linguagem natural." },
      { property: "og:title", content: "Assistente IA — Atlas" },
      { property: "og:description", content: "Converse com seus dados financeiros e receba respostas em linguagem natural." },
    ],
  }),
  component: Assistente,
});

const SUGESTOES = [
  "Quanto gastei com alimentação este mês?",
  "Posso gastar R$ 300 esse mês?",
  "Onde estou gastando demais?",
  "Quanto sobra por mês em média?",
];

type Mensagem = { papel: "user" | "assistant"; conteudo: string };

function Assistente() {
  const { data } = useAtlas();
  const ask = useServerFn(askAtlas);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      papel: "assistant",
      conteudo:
        "Oi! Eu leio seus lançamentos, contas fixas, cartões e metas. Pergunte em português normal — por exemplo: “posso gastar R$ 300 esse mês?”.",
    },
  ]);
  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (pergunta: string) =>
      ask({ data: { pergunta, contexto: JSON.stringify(buildAtlasContext(data)) } }),
    onSuccess: (result) =>
      setMensagens((prev) => [...prev, { papel: "assistant", conteudo: result.resposta }]),
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, mutation.isPending]);

  const enviar = (pergunta: string) => {
    const valor = pergunta.trim();
    if (!valor || mutation.isPending) return;
    setMensagens((prev) => [...prev, { papel: "user", conteudo: valor }]);
    setTexto("");
    mutation.mutate(valor);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Assistente IA" subtitle="Pergunte sobre suas finanças em linguagem natural." />

      <Panel className="flex h-[min(70vh,640px)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {mensagens.map((mensagem, index) => (
            <div
              key={index}
              className={cn("flex gap-3", mensagem.papel === "user" ? "justify-end" : "justify-start")}
            >
              {mensagem.papel === "assistant" ? (
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="size-3.5" />
                </span>
              ) : null}
              <p
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  mensagem.papel === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {mensagem.conteudo}
              </p>
            </div>
          ))}
          {mutation.isPending ? (
            <p className="text-sm text-muted-foreground">Analisando seus dados…</p>
          ) : null}
          <div ref={fimRef} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGESTOES.map((sugestao) => (
            <Button key={sugestao} variant="secondary" size="sm" onClick={() => enviar(sugestao)}>
              {sugestao}
            </Button>
          ))}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            enviar(texto);
          }}
        >
          <Input
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            placeholder="Pergunte algo sobre suas finanças…"
            aria-label="Mensagem"
          />
          <Button type="submit" size="icon" disabled={mutation.isPending} aria-label="Enviar">
            <Send className="size-4" />
          </Button>
        </form>
      </Panel>
    </div>
  );
}