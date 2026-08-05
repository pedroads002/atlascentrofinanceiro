import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AskInput = { pergunta: string; contexto: string };

export const askAtlas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AskInput) => {
    if (!input?.pergunta?.trim()) throw new Error("Pergunta vazia");
    return { pergunta: input.pergunta.slice(0, 2000), contexto: (input.contexto ?? "").slice(0, 12000) };
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Assistente indisponível: chave de IA não configurada.");

    const { supabase, userId } = context;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é o assistente financeiro do Atlas. Responda sempre em português do Brasil, com valores em reais (R$ 1.234,56). Seja direto, prático e humano: no máximo 6 linhas, sem jargão. Use apenas os dados do contexto; se algo não estiver lá, diga que ainda não há dados suficientes.",
          },
          { role: "user", content: `Contexto financeiro (JSON):\n${data.contexto}\n\nPergunta: ${data.pergunta}` },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) throw new Error("Muitas perguntas seguidas. Tente novamente em instantes.");
      if (response.status === 402) throw new Error("Créditos de IA esgotados no workspace.");
      throw new Error(`Falha na IA [${response.status}]: ${body}`);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const resposta = payload.choices?.[0]?.message?.content?.trim() ?? "Não consegui responder agora.";

    await supabase.from("ai_messages").insert([
      { user_id: userId, papel: "user", conteudo: data.pergunta },
      { user_id: userId, papel: "assistant", conteudo: resposta },
    ]);

    return { resposta };
  });